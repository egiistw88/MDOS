const DB_NAME = 'mdos';
const DB_VERSION = 2;
const STORE = 'spots';
const SESSION_STORE = 'sessions';
const EVENTS_STORE = 'events';
const KV_STORE = 'kv';
const ACTIVE_SESSION_KEY = 'activeSessionId';

const TIMER_LIMITS = {
  A: { softMs: 12 * 60 * 1000, hardMs: 15 * 60 * 1000 },
  B: { softMs: 10 * 60 * 1000, hardMs: 12 * 60 * 1000 },
};

let dbPromise = null;
let dbInstance = null;

const SEED_SPOTS = [
  {
    id: 'A-S1',
    mode: 'A',
    order: 1,
    code: 'S1',
    name: 'Stasiun Kiaracondong',
    lat: -6.9158827,
    lng: 107.6429562,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.9158827,107.6429562',
  },
  {
    id: 'A-S2',
    mode: 'A',
    order: 2,
    code: 'S2',
    name: 'Kebon Jayanti',
    lat: -6.9272222,
    lng: 107.6469444,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.9272222,107.6469444',
  },
  {
    id: 'A-S3',
    mode: 'A',
    order: 3,
    code: 'S3',
    name: 'Babakan Sari',
    lat: -6.9244758,
    lng: 107.6497426,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.9244758,107.6497426',
  },
  {
    id: 'A-S4',
    mode: 'A',
    order: 4,
    code: 'S4',
    name: 'Terminal Cicaheum',
    lat: -6.896992,
    lng: 107.652608,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.896992,107.652608',
  },
  {
    id: 'A-S5',
    mode: 'A',
    order: 5,
    code: 'S5',
    name: 'Alun-alun Antapani',
    lat: -6.9166667,
    lng: 107.6613889,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.9166667,107.6613889',
  },
  {
    id: 'A-S6',
    mode: 'A',
    order: 6,
    code: 'S6',
    name: 'RS Hermina Arcamanik',
    lat: -6.904909,
    lng: 107.666749,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.904909,107.666749',
  },
  {
    id: 'A-S7',
    mode: 'A',
    order: 7,
    code: 'S7',
    name: 'Summarecon Mall Bandung (Gedebage)',
    lat: -6.9541417,
    lng: 107.6992526,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.9541417,107.6992526',
  },
  {
    id: 'A-S8',
    mode: 'A',
    order: 8,
    code: 'S8',
    name: 'Transmart Buah Batu Bandung',
    lat: -6.96681,
    lng: 107.63862,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.96681,107.63862',
  },
  {
    id: 'B-P1',
    mode: 'B',
    order: 1,
    code: 'P1',
    name: 'Stasiun Bandung',
    lat: -6.91417,
    lng: 107.6025,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.91417,107.60250',
  },
  {
    id: 'B-P2',
    mode: 'B',
    order: 2,
    code: 'P2',
    name: 'Alun-alun Bandung',
    lat: -6.9219444,
    lng: 107.6071667,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.9219444,107.6071667',
  },
  {
    id: 'B-P3',
    mode: 'B',
    order: 3,
    code: 'P3',
    name: 'Jalan Braga',
    lat: -6.915819,
    lng: 107.609445,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.915819,107.609445',
  },
  {
    id: 'B-P4',
    mode: 'B',
    order: 4,
    code: 'P4',
    name: 'ITB Ganesha',
    lat: -6.89148,
    lng: 107.61064,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.89148,107.61064',
  },
  {
    id: 'B-P5',
    mode: 'B',
    order: 5,
    code: 'P5',
    name: 'Dipatiukur',
    lat: -6.890877,
    lng: 107.61702,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.890877,107.61702',
  },
  {
    id: 'B-P6',
    mode: 'B',
    order: 6,
    code: 'P6',
    name: 'Gedung Sate',
    lat: -6.902459,
    lng: 107.61873,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.902459,107.618730',
  },
  {
    id: 'B-P7',
    mode: 'B',
    order: 7,
    code: 'P7',
    name: 'Cihampelas Walk',
    lat: -6.8844444,
    lng: 107.6086111,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.8844444,107.6086111',
  },
  {
    id: 'B-P8',
    mode: 'B',
    order: 8,
    code: 'P8',
    name: 'Paris Van Java (PVJ)',
    lat: -6.88925,
    lng: 107.5960278,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.88925,107.5960278',
  },
  {
    id: 'B-P9',
    mode: 'B',
    order: 9,
    code: 'P9',
    name: 'Gerbang Tol Pasteur',
    lat: -6.896309,
    lng: 107.5889,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.896309,107.5889',
  },
  {
    id: 'B-P10',
    mode: 'B',
    order: 10,
    code: 'P10',
    name: 'POLBAN',
    lat: -6.872759,
    lng: 107.573916,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.872759,107.573916',
  },
  {
    id: 'B-P11',
    mode: 'B',
    order: 11,
    code: 'P11',
    name: 'Terminal Ledeng',
    lat: -6.8583333,
    lng: 107.5944444,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.8583333,107.5944444',
  },
];

function openMdosDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      const tx = request.transaction;
      let spotStore;

      if (!db.objectStoreNames.contains(STORE)) {
        spotStore = db.createObjectStore(STORE, { keyPath: 'id' });
      } else {
        spotStore = tx.objectStore(STORE);
      }

      if (!spotStore.indexNames.contains('by_mode_order')) {
        spotStore.createIndex('by_mode_order', ['mode', 'order']);
      }

      let sessionStore;
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        sessionStore = db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
      } else {
        sessionStore = tx.objectStore(SESSION_STORE);
      }

      if (!sessionStore.indexNames.contains('by_status')) {
        sessionStore.createIndex('by_status', 'status');
      }
      if (!sessionStore.indexNames.contains('by_startedAt')) {
        sessionStore.createIndex('by_startedAt', 'startedAt');
      }

      let eventStore;
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        eventStore = db.createObjectStore(EVENTS_STORE, { keyPath: 'id' });
      } else {
        eventStore = tx.objectStore(EVENTS_STORE);
      }

      if (!eventStore.indexNames.contains('by_session_at')) {
        eventStore.createIndex('by_session_at', ['sessionId', 'at']);
      }
      if (!eventStore.indexNames.contains('by_type_at')) {
        eventStore.createIndex('by_type_at', ['type', 'at']);
      }

      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstance = null;
        dbPromise = null;
      };
      resolve(dbInstance);
    };
    request.onerror = () => {
      const error = request.error || new Error('Gagal membuka database.');
      dbPromise = null;
      reject(error);
    };
    request.onblocked = () => {
      const error = new Error('Database upgrade blocked. Close other tabs and retry.');
      dbPromise = null;
      reject(error);
    };
  });
  return dbPromise;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request gagal.'));
  });
}

function transactionComplete(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Transaksi IndexedDB gagal.'));
    tx.onabort = () => reject(tx.error || new Error('Transaksi IndexedDB dibatalkan.'));
  });
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

async function seedSpotsIfEmpty() {
  const db = await openMdosDB();
  const checkTx = db.transaction(STORE, 'readonly');
  const count = await requestToPromise(checkTx.objectStore(STORE).count());
  await transactionComplete(checkTx);

  if (count > 0) {
    return;
  }

  const seedTx = db.transaction(STORE, 'readwrite');
  const store = seedTx.objectStore(STORE);
  for (const spot of SEED_SPOTS) {
    store.put(spot);
  }
  await transactionComplete(seedTx);
}

async function getSpotsByMode(mode) {
  const db = await openMdosDB();
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.objectStore(STORE).index('by_mode_order');
  const range = IDBKeyRange.bound([mode, 0], [mode, Number.MAX_SAFE_INTEGER]);
  const results = await requestToPromise(index.getAll(range));
  await transactionComplete(tx);
  return results.slice().sort((a, b) => a.order - b.order);
}

async function getSpotById(spotId) {
  if (!spotId) {
    return null;
  }
  const db = await openMdosDB();
  const tx = db.transaction(STORE, 'readonly');
  const spot = await requestToPromise(tx.objectStore(STORE).get(spotId));
  await transactionComplete(tx);
  return spot || null;
}

async function getNextSpotId(mode, currentSpotId) {
  const spots = await getSpotsByMode(mode);
  if (!spots.length) {
    return null;
  }
  const currentIndex = spots.findIndex((spot) => spot.id === currentSpotId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % spots.length : 0;
  return spots[nextIndex].id;
}

async function setActiveSessionId(sessionId) {
  const db = await openMdosDB();
  const tx = db.transaction(KV_STORE, 'readwrite');
  tx.objectStore(KV_STORE).put({ key: ACTIVE_SESSION_KEY, value: sessionId });
  await transactionComplete(tx);
}

async function clearActiveSessionId() {
  const db = await openMdosDB();
  const tx = db.transaction(KV_STORE, 'readwrite');
  tx.objectStore(KV_STORE).delete(ACTIVE_SESSION_KEY);
  await transactionComplete(tx);
}

async function getActiveSessionId() {
  const db = await openMdosDB();
  const tx = db.transaction(KV_STORE, 'readonly');
  const record = await requestToPromise(tx.objectStore(KV_STORE).get(ACTIVE_SESSION_KEY));
  await transactionComplete(tx);
  return record ? record.value : null;
}

async function createSession(mode) {
  const now = Date.now();
  const limits = TIMER_LIMITS[mode] || TIMER_LIMITS.A;
  const spots = await getSpotsByMode(mode);
  const firstSpotId = spots.length ? spots[0].id : null;

  const session = {
    id: generateId(),
    mode,
    status: 'active',
    startedAt: now,
    endedAt: null,
    activeSpotId: firstSpotId,
    timer: {
      state: 'idle',
      startedAt: null,
      softMs: limits.softMs,
      hardMs: limits.hardMs,
      softEmitted: false,
      hardEmitted: false,
    },
  };

  const db = await openMdosDB();
  const tx = db.transaction([SESSION_STORE, KV_STORE], 'readwrite');
  tx.objectStore(SESSION_STORE).put(session);
  tx.objectStore(KV_STORE).put({ key: ACTIVE_SESSION_KEY, value: session.id });
  await transactionComplete(tx);
  return session;
}

async function getActiveSession() {
  const db = await openMdosDB();
  const activeId = await getActiveSessionId();
  if (activeId) {
    const tx = db.transaction(SESSION_STORE, 'readonly');
    const session = await requestToPromise(tx.objectStore(SESSION_STORE).get(activeId));
    await transactionComplete(tx);
    if (session && session.status === 'active') {
      return session;
    }
  }

  const fallbackTx = db.transaction(SESSION_STORE, 'readonly');
  const index = fallbackTx.objectStore(SESSION_STORE).index('by_status');
  const sessions = await requestToPromise(index.getAll('active'));
  await transactionComplete(fallbackTx);

  if (!sessions.length) {
    if (activeId) {
      await clearActiveSessionId();
    }
    return null;
  }

  sessions.sort((a, b) => b.startedAt - a.startedAt);
  const session = sessions[0];
  await setActiveSessionId(session.id);
  return session;
}

async function updateSession(sessionUpdate) {
  if (!sessionUpdate || !sessionUpdate.id) {
    throw new Error('Session update membutuhkan id.');
  }

  const db = await openMdosDB();
  const tx = db.transaction(SESSION_STORE, 'readwrite');
  const store = tx.objectStore(SESSION_STORE);
  const existing = await requestToPromise(store.get(sessionUpdate.id));
  if (!existing) {
    throw new Error('Session tidak ditemukan.');
  }

  const merged = {
    ...existing,
    ...sessionUpdate,
    timer: {
      ...(existing.timer || {}),
      ...(sessionUpdate.timer || {}),
    },
  };

  store.put(merged);
  await transactionComplete(tx);
}

async function endActiveSession() {
  const session = await getActiveSession();
  if (!session) {
    return;
  }
  session.status = 'ended';
  session.endedAt = Date.now();
  await updateSession(session);
  await clearActiveSessionId();
}

async function addEvent(event) {
  if (!event || !event.sessionId || !event.type) {
    throw new Error('Event membutuhkan sessionId dan type.');
  }
  const record = {
    id: event.id || generateId(),
    sessionId: event.sessionId,
    type: event.type,
    at: event.at || Date.now(),
    payload: event.payload || {},
  };

  const db = await openMdosDB();
  const tx = db.transaction(EVENTS_STORE, 'readwrite');
  tx.objectStore(EVENTS_STORE).add(record);
  await transactionComplete(tx);
}

async function getEventsForSession(sessionId, limit = 200) {
  const db = await openMdosDB();
  const tx = db.transaction(EVENTS_STORE, 'readonly');
  const index = tx.objectStore(EVENTS_STORE).index('by_session_at');
  const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
  const results = await requestToPromise(index.getAll(range));
  await transactionComplete(tx);
  results.sort((a, b) => a.at - b.at);
  return results.slice(0, limit);
}

async function clearAllData() {
  const db = await openMdosDB();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).clear();
  await transactionComplete(tx);
}
