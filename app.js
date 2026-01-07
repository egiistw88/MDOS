function buildMapsUrl(name, lat, lng) {
  const query = encodeURIComponent(`${name} ${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

const spotSeed = [
  {
    id: 'A-1',
    mode: 'A',
    order: 1,
    code: 'S1',
    name: 'Stasiun Kiaracondong',
    lat: -6.9158827,
    lng: 107.6429562,
    mapsUrl: buildMapsUrl('Stasiun Kiaracondong', -6.9158827, 107.6429562),
  },
  {
    id: 'A-2',
    mode: 'A',
    order: 2,
    code: 'S2',
    name: 'Kebon Jayanti',
    lat: -6.9272222,
    lng: 107.6469444,
    mapsUrl: buildMapsUrl('Kebon Jayanti', -6.9272222, 107.6469444),
  },
  {
    id: 'A-3',
    mode: 'A',
    order: 3,
    code: 'S3',
    name: 'Babakan Sari',
    lat: -6.9244758,
    lng: 107.6497426,
    mapsUrl: buildMapsUrl('Babakan Sari', -6.9244758, 107.6497426),
  },
  {
    id: 'A-4',
    mode: 'A',
    order: 4,
    code: 'S4',
    name: 'Terminal Cicaheum',
    lat: -6.896992,
    lng: 107.652608,
    mapsUrl: buildMapsUrl('Terminal Cicaheum', -6.896992, 107.652608),
  },
  {
    id: 'A-5',
    mode: 'A',
    order: 5,
    code: 'S5',
    name: 'Alun-alun Antapani',
    lat: -6.9166667,
    lng: 107.6613889,
    mapsUrl: buildMapsUrl('Alun-alun Antapani', -6.9166667, 107.6613889),
  },
  {
    id: 'A-6',
    mode: 'A',
    order: 6,
    code: 'S6',
    name: 'RS Hermina Arcamanik',
    lat: -6.904909,
    lng: 107.666749,
    mapsUrl: buildMapsUrl('RS Hermina Arcamanik', -6.904909, 107.666749),
  },
  {
    id: 'A-7',
    mode: 'A',
    order: 7,
    code: 'S7',
    name: 'Summarecon Mall Bandung (Gedebage)',
    lat: -6.9541417,
    lng: 107.6992526,
    mapsUrl: buildMapsUrl(
      'Summarecon Mall Bandung (Gedebage)',
      -6.9541417,
      107.6992526
    ),
  },
  {
    id: 'A-8',
    mode: 'A',
    order: 8,
    code: 'S8',
    name: 'Transmart Buah Batu Bandung',
    lat: -6.96681,
    lng: 107.63862,
    mapsUrl: buildMapsUrl('Transmart Buah Batu Bandung', -6.96681, 107.63862),
  },
  {
    id: 'B-1',
    mode: 'B',
    order: 1,
    code: 'P1',
    name: 'Stasiun Bandung',
    lat: -6.91417,
    lng: 107.6025,
    mapsUrl: buildMapsUrl('Stasiun Bandung', -6.91417, 107.6025),
  },
  {
    id: 'B-2',
    mode: 'B',
    order: 2,
    code: 'P2',
    name: 'Alun-alun Bandung',
    lat: -6.9219444,
    lng: 107.6071667,
    mapsUrl: buildMapsUrl('Alun-alun Bandung', -6.9219444, 107.6071667),
  },
  {
    id: 'B-3',
    mode: 'B',
    order: 3,
    code: 'P3',
    name: 'Jalan Braga',
    lat: -6.915819,
    lng: 107.609445,
    mapsUrl: buildMapsUrl('Jalan Braga', -6.915819, 107.609445),
  },
  {
    id: 'B-4',
    mode: 'B',
    order: 4,
    code: 'P4',
    name: 'ITB Ganesha',
    lat: -6.89148,
    lng: 107.61064,
    mapsUrl: buildMapsUrl('ITB Ganesha', -6.89148, 107.61064),
  },
  {
    id: 'B-5',
    mode: 'B',
    order: 5,
    code: 'P5',
    name: 'Dipatiukur',
    lat: -6.890877,
    lng: 107.61702,
    mapsUrl: buildMapsUrl('Dipatiukur', -6.890877, 107.61702),
  },
  {
    id: 'B-6',
    mode: 'B',
    order: 6,
    code: 'P6',
    name: 'Gedung Sate',
    lat: -6.902459,
    lng: 107.61873,
    mapsUrl: buildMapsUrl('Gedung Sate', -6.902459, 107.61873),
  },
  {
    id: 'B-7',
    mode: 'B',
    order: 7,
    code: 'P7',
    name: 'Cihampelas Walk',
    lat: -6.8844444,
    lng: 107.6086111,
    mapsUrl: buildMapsUrl('Cihampelas Walk', -6.8844444, 107.6086111),
  },
  {
    id: 'B-8',
    mode: 'B',
    order: 8,
    code: 'P8',
    name: 'Paris Van Java',
    lat: -6.88925,
    lng: 107.5960278,
    mapsUrl: buildMapsUrl('Paris Van Java', -6.88925, 107.5960278),
  },
  {
    id: 'B-9',
    mode: 'B',
    order: 9,
    code: 'P9',
    name: 'Gerbang Tol Pasteur',
    lat: -6.896309,
    lng: 107.5889,
    mapsUrl: buildMapsUrl('Gerbang Tol Pasteur', -6.896309, 107.5889),
  },
  {
    id: 'B-10',
    mode: 'B',
    order: 10,
    code: 'P10',
    name: 'POLBAN',
    lat: -6.872759,
    lng: 107.573916,
    mapsUrl: buildMapsUrl('POLBAN', -6.872759, 107.573916),
  },
  {
    id: 'B-11',
    mode: 'B',
    order: 11,
    code: 'P11',
    name: 'Terminal Ledeng',
    lat: -6.8583333,
    lng: 107.5944444,
    mapsUrl: buildMapsUrl('Terminal Ledeng', -6.8583333, 107.5944444),
  },
];

const tabIds = ['sesi', 'rotasi', 'log', 'setelan'];
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
const tabLinks = Array.from(document.querySelectorAll('[data-tab-link]'));
const toggleButtons = Array.from(document.querySelectorAll('.toggle-button'));
const spotList = document.getElementById('spot-list');
const rotasiMeta = document.getElementById('rotasi-meta');

const state = {
  mode: 'A',
};

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

function renderSpots() {
  const filtered = spotSeed
    .filter((spot) => spot.mode === state.mode)
    .sort((a, b) => a.order - b.order);

  spotList.replaceChildren();

  filtered.forEach((spot, index) => {
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

  rotasiMeta.textContent = `Mode ${state.mode} - ${filtered.length} spot`;
}

function setMode(mode) {
  state.mode = mode;
  toggleButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  renderSpots();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

syncRoute();
window.addEventListener('hashchange', syncRoute);

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

setMode('A');
registerServiceWorker();
