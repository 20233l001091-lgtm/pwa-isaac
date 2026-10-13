// Escuchar cuando el Service Worker envíe mensajes
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW Registrado:', reg))
      .catch(err => console.error('Error al registrar SW:', err));
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    mostrarAlertaEstado(event.data);
  });
}

// RESPALDO DIRECTO: Cuando el navegador detecta que volvió el Internet
window.addEventListener('online', () => {
  const syncPendiente = localStorage.getItem('sync_pendiente');
  if (syncPendiente) {
    mostrarAlertaEstado('✅ Sync completado: conexión restablecida (nuevo-post-sync)');
    localStorage.removeItem('sync_pendiente');
  }
});

const personajes = [
  { id: 'ronaldinho', username: '@ronaldinho', nombre: 'Ronaldinho Gaucho', avatar: 'ronaldinho.jpg', tweets: ['¡La sonrisa del fútbol nunca se apaga! 🤙⚽'] },
  { id: 'neymar', username: '@neymarjr', nombre: 'Neymar Jr', avatar: 'neymar.jpg', tweets: ['O pai tá on! 🔥⚽'] },
  { id: 'cr7', username: '@cristiano', nombre: 'Cristiano Ronaldo', avatar: 'cr7.jpg', tweets: ['Siuuuuu! El trabajo duro siempre supera al talento. 💪🔥'] },
  { id: 'raul', username: '@rauljimenez', nombre: 'Raúl Jiménez', avatar: 'raul.jpg', tweets: ['¡Con todo por la victoria! 🇲🇽⚽'] }
];

let personajeActual = null;

const viewSelection = document.getElementById('view-selection');
const viewFeed = document.getElementById('view-feed');
const headerTitle = document.getElementById('header-title');
const btnBack = document.getElementById('btn-back');
const btnNotif = document.getElementById('btn-notif');
const btnNewTweet = document.getElementById('btn-new-tweet');
const feedAvatarImg = document.getElementById('feed-avatar-img');
const tweetsContainer = document.getElementById('tweets-container');

const modalTweet = document.getElementById('modal-tweet');
const tweetInput = document.getElementById('tweet-input');
const btnSendTweet = document.getElementById('btn-send-tweet');
const btnCancelTweet = document.getElementById('btn-cancel-tweet');
const estadoToast = document.getElementById('estado-toast');

function renderSeleccion() {
  viewSelection.innerHTML = '';
  personajes.forEach(p => {
    const card = document.createElement('div');
    card.className = 'avatar-card';
    card.innerHTML = `<img src="${p.avatar}" alt="${p.nombre}" onerror="this.onerror=null; this.src='icon-192.png';">`;
    card.addEventListener('click', () => seleccionarPersonaje(p));
    viewSelection.appendChild(card);
  });
}

function seleccionarPersonaje(p) {
  personajeActual = p;
  viewSelection.style.display = 'none';
  viewFeed.style.display = 'block';
  
  headerTitle.innerHTML = `${p.username}`;
  btnBack.style.display = 'block';
  btnNotif.style.display = 'block';
  btnNewTweet.style.display = 'block';
  
  feedAvatarImg.src = p.avatar;
  feedAvatarImg.onerror = () => { feedAvatarImg.src = 'icon-192.png'; };
  renderTweets();
}

function renderTweets() {
  tweetsContainer.innerHTML = '';
  personajeActual.tweets.forEach(texto => {
    const tweetCard = document.createElement('div');
    tweetCard.className = 'tweet-card';
    tweetCard.innerHTML = `
      <div class="tweet-user">${personajeActual.username}</div>
      <div class="tweet-text">${texto}</div>
    `;
    tweetsContainer.appendChild(tweetCard);
  });
}

btnBack.addEventListener('click', () => {
  viewSelection.style.display = 'grid';
  viewFeed.style.display = 'none';
  headerTitle.textContent = 'Chatea con tu futbolista favorito';
  btnBack.style.display = 'none';
  btnNotif.style.display = 'none';
  btnNewTweet.style.display = 'none';
  personajeActual = null;
});

btnNotif.addEventListener('click', async () => {
  if ('Notification' in window) {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(`Mensaje de ${personajeActual.nombre}`, {
        body: personajeActual.tweets[0] || 'Nuevo post publicado',
        icon: personajeActual.avatar
      });
    }
  }
});

btnNewTweet.addEventListener('click', () => {
  tweetInput.value = '';
  modalTweet.style.display = 'flex';
});

btnCancelTweet.addEventListener('click', () => {
  modalTweet.style.display = 'none';
});

// Al pulsar publicar
btnSendTweet.addEventListener('click', async () => {
  const text = tweetInput.value.trim();
  if (text && personajeActual) {
    personajeActual.tweets.unshift(text);
    renderTweets();
    modalTweet.style.display = 'none';

    if (!navigator.onLine) {
      // Guardar marca de que hay una tarea pendiente
      localStorage.setItem('sync_pendiente', 'true');
      mostrarAlertaEstado('Pedido registrado. El navegador avisará cuando haya conexión.');
    }

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if ('sync' in reg) {
          await reg.sync.register('nuevo-post-sync');
          if (navigator.onLine) {
            mostrarAlertaEstado('✅ Publicación enviada con éxito');
          }
        }
      } catch (err) {
        console.error('Error registrando Sync:', err);
      }
    }
  }
});

function mostrarAlertaEstado(mensaje) {
  if (estadoToast) {
    estadoToast.textContent = mensaje;
    estadoToast.style.display = 'block';
    setTimeout(() => {
      estadoToast.style.display = 'none';
    }, 6000);
  }
}

renderSeleccion();