const tabIds = ['sesi', 'rotasi', 'log', 'setelan'];
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
const tabLinks = Array.from(document.querySelectorAll('[data-tab-link]'));
const toggleButtons = Array.from(document.querySelectorAll('.toggle-button'));
const spotList = document.getElementById('spot-list');
const rotasiMeta = document.getElementById('rotasi-meta');
const resetButton = document.getElementById('reset-data');

const state = {
  mode: 'A',
};

let seedPromise = null;
let loadToken = 0;

function ensureSeedReady() {
  if (!seedPromise) {
    seedPromise = seedSpotsIfEmpty().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

function setActiveTab(tab) {
  tabPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.tab === tab);
  });
  tabLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.tabLink === tab);
  });
}

function syncRoute() {
  const raw = window.location.hash.replace('#', '');
  const tab = tabIds.includes(raw) ? raw : 'sesi';
  if (raw !== tab) {
    history.replaceState(null, '', `#${tab}`);
  }
  setActiveTab(tab);
}

function showLoading() {
  spotList.replaceChildren();
  const item = document.createElement('li');
  item.className = 'spot-card';
  item.setAttribute('aria-busy', 'true');
  item.textContent = 'Memuat spot...';
  spotList.appendChild(item);
  rotasiMeta.textContent = 'Memuat data rotasi...';
}

function showError(message) {
  spotList.replaceChildren();
  const item = document.createElement('li');
  item.className = 'spot-card';
  item.setAttribute('role', 'alert');
  item.textContent = message;
  spotList.appendChild(item);
  rotasiMeta.textContent = 'Gagal memuat spot';
}

function renderSpots(spots) {
  spotList.replaceChildren();

  if (!spots.length) {
    const empty = document.createElement('li');
    empty.className = 'spot-card';
    empty.textContent = 'Belum ada spot untuk mode ini.';
    spotList.appendChild(empty);
  } else {
    spots.forEach((spot, index) => {
      const item = document.createElement('li');
      item.className = 'spot-card';
      item.style.setProperty('--i', index);
      item.dataset.spotId = spot.id;

      const header = document.createElement('div');
      header.className = 'spot-header';

      const code = document.createElement('span');
      code.className = 'spot-code';
      code.textContent = spot.code;

      const name = document.createElement('div');
      name.className = 'spot-name';
      name.textContent = spot.name;

      header.append(code, name);

      const coords = document.createElement('div');
      coords.className = 'spot-coords';
      coords.textContent = `${spot.lat}, ${spot.lng}`;

      const button = document.createElement('a');
      button.className = 'maps-button';
      button.href = spot.mapsUrl;
      button.target = '_blank';
      button.rel = 'noopener';
      button.textContent = 'Buka Maps';

      item.append(header, coords, button);
      spotList.appendChild(item);
    });
  }

  rotasiMeta.textContent = `Mode ${state.mode} - ${spots.length} spot`;
}

async function loadSpotsForMode(mode) {
  const requestId = ++loadToken;
  showLoading();

  try {
    await ensureSeedReady();
    const spots = await getSpotsByMode(mode);
    if (requestId !== loadToken) {
      return;
    }
    renderSpots(spots);
  } catch (error) {
    console.error('Gagal memuat spot', error);
    if (requestId !== loadToken) {
      return;
    }
    showError('Gagal memuat spot. Coba refresh.');
  }
}

function setMode(mode) {
  state.mode = mode;
  toggleButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  loadSpotsForMode(mode);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => {
        console.info('SW registered');
      })
      .catch((error) => {
        console.error('SW registration failed', error);
      });
  });
}

if (resetButton) {
  resetButton.addEventListener('click', async () => {
    const confirmed = window.confirm('Reset data spot di perangkat ini?');
    if (!confirmed) {
      return;
    }
    try {
      await clearAllData();
      seedPromise = null;
      window.location.reload();
    } catch (error) {
      console.error('Gagal reset data', error);
      window.alert('Gagal reset data. Coba refresh halaman.');
    }
  });
}

syncRoute();
window.addEventListener('hashchange', syncRoute);

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

setMode('A');
registerServiceWorker();
