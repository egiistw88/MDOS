const tabIds = ['sesi', 'rotasi', 'log', 'setelan'];
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
const tabLinks = Array.from(document.querySelectorAll('[data-tab-link]'));
const rotasiModeButtons = Array.from(document.querySelectorAll('[data-rotasi-mode]'));
const sessionModeButtons = Array.from(document.querySelectorAll('[data-session-mode]'));
const spotList = document.getElementById('spot-list');
const rotasiMeta = document.getElementById('rotasi-meta');
const resetButton = document.getElementById('reset-data');

const sessionStatus = document.getElementById('session-status');
const activeSpotEl = document.getElementById('active-spot');
const timerDisplay = document.getElementById('timer-display');
const timerHint = document.getElementById('timer-hint');
const timerProgress = document.getElementById('timer-progress');
const startSessionButton = document.getElementById('start-session');
const endSessionButton = document.getElementById('end-session');
const arriveSpotButton = document.getElementById('arrive-spot');
const moveNextButton = document.getElementById('move-next');
const openMapsButton = document.getElementById('open-maps');
const logAcceptButton = document.getElementById('log-accept');
const logSkipButton = document.getElementById('log-skip');
const logDropoffButton = document.getElementById('log-dropoff');
const eventList = document.getElementById('event-list');
const logMeta = document.getElementById('log-meta');
const notifEnabledToggle = document.getElementById('notif-enabled');
const notifRequestButton = document.getElementById('notif-request');
const notifTestButton = document.getElementById('notif-test');
const vapidKeyInput = document.getElementById('vapid-key');
const saveVapidButton = document.getElementById('save-vapid');
const pushSubscribeButton = document.getElementById('push-subscribe');
const pushExportButton = document.getElementById('push-export');
const notifStatus = document.getElementById('notif-status');
const quietStartInput = document.getElementById('quiet-start');
const quietEndInput = document.getElementById('quiet-end');
const quietSaveButton = document.getElementById('quiet-save');

const state = {
  rotasiMode: 'A',
  sessionMode: 'A',
  activeSession: null,
  activeSpot: null,
  actionBusy: false,
};

const notificationDefaults = {
  quietStart: '22:00',
  quietEnd: '05:30',
};

const notificationState = {
  enabled: false,
  permission: 'default',
  quietStart: notificationDefaults.quietStart,
  quietEnd: notificationDefaults.quietEnd,
  vapidKey: '',
  hasSubscription: false,
};

let seedPromise = null;
let rotasiLoadToken = 0;
let timerIntervalId = null;
let tickBusy = false;

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

function updateRotasiModeButtons() {
  rotasiModeButtons.forEach((button) => {
    const isActive = button.dataset.rotasiMode === state.rotasiMode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateSessionModeButtons() {
  const mode = state.activeSession ? state.activeSession.mode : state.sessionMode;
  sessionModeButtons.forEach((button) => {
    const isActive = button.dataset.sessionMode === mode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
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

  rotasiMeta.textContent = `Mode ${state.rotasiMode} - ${spots.length} spot`;
}

async function loadSpotsForMode(mode) {
  const requestId = ++rotasiLoadToken;
  showLoading();

  try {
    await ensureSeedReady();
    const spots = await getSpotsByMode(mode);
    if (requestId !== rotasiLoadToken) {
      return;
    }
    renderSpots(spots);
  } catch (error) {
    console.error('Gagal memuat spot', error);
    if (requestId !== rotasiLoadToken) {
      return;
    }
    showError('Gagal memuat spot. Coba refresh.');
  }
}

function setRotasiMode(mode) {
  state.rotasiMode = mode;
  updateRotasiModeButtons();
  loadSpotsForMode(mode);
}

function setSessionMode(mode) {
  if (state.activeSession) {
    return;
  }
  state.sessionMode = mode;
  updateSessionModeButtons();
}

function parseTimeToMinutes(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const parts = value.split(':');
  if (parts.length !== 2) {
    return null;
  }
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

function normalizeTimeValue(value, fallback) {
  return parseTimeToMinutes(value) === null ? fallback : value;
}

async function getKVOrDefault(key, defaultValue) {
  const value = await getKV(key);
  if (value === null || value === undefined || value === '') {
    await setKV(key, defaultValue);
    return defaultValue;
  }
  return value;
}

async function isQuietHoursNow() {
  const startValue = await getKVOrDefault('quietHoursStart', notificationDefaults.quietStart);
  const endValue = await getKVOrDefault('quietHoursEnd', notificationDefaults.quietEnd);
  const startMinutes = parseTimeToMinutes(startValue);
  const endMinutes = parseTimeToMinutes(endValue);
  if (startMinutes === null || endMinutes === null) {
    return false;
  }
  if (startMinutes === endMinutes) {
    return false;
  }
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

async function ensureNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }
  const permission = Notification.permission;
  if (permission === 'granted') {
    return true;
  }
  if (permission === 'denied') {
    return false;
  }
  const result = await Notification.requestPermission();
  return result === 'granted';
}

async function showLocalNotification(title, body, data = {}, options = {}) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return false;
  }
  const enabled = await getKV('notificationsEnabled');
  if (!enabled) {
    return false;
  }
  if (!options.ignoreQuietHours && (await isQuietHoursNow())) {
    return false;
  }
  const permission = getNotificationPermission();
  if (permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const payload = {
      body,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      data,
      renotify: false,
    };
    if (options.tag) {
      payload.tag = options.tag;
    }
    if (options.requireInteraction) {
      payload.requireInteraction = true;
    }
    await registration.showNotification(title, payload);
    return true;
  } catch (error) {
    console.error('Gagal menampilkan notifikasi', error);
    return false;
  }
}

function updateNotificationUI() {
  const permissionLabel = 'Notification' in window ? notificationState.permission : 'tidak didukung';
  const enabledLabel = notificationState.enabled ? 'aktif' : 'nonaktif';
  const subscriptionLabel = notificationState.hasSubscription ? 'ada' : 'belum ada';
  const pushSupportLabel = 'PushManager' in window ? 'didukung' : 'tidak didukung';

  if (notifEnabledToggle) {
    notifEnabledToggle.checked = notificationState.enabled;
    notifEnabledToggle.disabled = !('Notification' in window);
  }
  if (quietStartInput) {
    quietStartInput.value = notificationState.quietStart;
  }
  if (quietEndInput) {
    quietEndInput.value = notificationState.quietEnd;
  }
  if (vapidKeyInput) {
    vapidKeyInput.value = notificationState.vapidKey;
  }
  if (notifStatus) {
    notifStatus.textContent = `Status: ${enabledLabel}, izin ${permissionLabel}, push ${pushSupportLabel}, subscription ${subscriptionLabel}.`;
  }
  if (notifRequestButton) {
    notifRequestButton.disabled = !('Notification' in window);
  }
  if (notifTestButton) {
    notifTestButton.disabled = !('Notification' in window);
  }
  if (pushSubscribeButton) {
    pushSubscribeButton.disabled = !('Notification' in window) || !('PushManager' in window);
  }
  if (pushExportButton) {
    pushExportButton.disabled = !notificationState.hasSubscription;
  }
}

async function loadNotificationSettings() {
  notificationState.enabled = !!(await getKV('notificationsEnabled'));
  const startValue = await getKVOrDefault('quietHoursStart', notificationDefaults.quietStart);
  const endValue = await getKVOrDefault('quietHoursEnd', notificationDefaults.quietEnd);
  notificationState.quietStart = normalizeTimeValue(startValue, notificationDefaults.quietStart);
  notificationState.quietEnd = normalizeTimeValue(endValue, notificationDefaults.quietEnd);
  notificationState.vapidKey = (await getKV('vapidPublicKey')) || '';
  notificationState.hasSubscription = !!(await getKV('pushSubscription'));
  notificationState.permission = getNotificationPermission();
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToPushIfPossible() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    window.alert('Push tidak didukung di browser ini.');
    return;
  }
  const vapidKey = (await getKV('vapidPublicKey')) || '';
  if (!vapidKey.trim()) {
    window.alert('Isi VAPID public key dulu.');
    return;
  }
  const permissionGranted = await ensureNotificationPermission();
  notificationState.permission = getNotificationPermission();
  if (!permissionGranted) {
    updateNotificationUI();
    window.alert('Izin notifikasi belum diberikan.');
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey.trim()),
      });
    }
    await setKV('pushSubscription', subscription.toJSON());
    notificationState.hasSubscription = true;
    updateNotificationUI();
    window.alert('Push subscription tersimpan.');
  } catch (error) {
    console.error('Gagal membuat subscription', error);
    window.alert('Gagal membuat subscription. Periksa VAPID key.');
  }
}

async function exportPushSubscription() {
  const subscription = await getKV('pushSubscription');
  if (!subscription) {
    window.alert('Belum ada subscription.');
    return;
  }
  const text = JSON.stringify(subscription, null, 2);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      window.alert('Subscription disalin ke clipboard.');
      return;
    } catch (error) {
      console.error('Gagal menyalin subscription', error);
    }
  }
  window.prompt('Salin subscription berikut:', text);
}

function formatDuration(ms) {
  const clamped = Math.max(ms, 0);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatClock(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getTimerHint(stateValue) {
  if (stateValue === 'soft_reached') {
    return 'Soft limit tercapai (kering).';
  }
  if (stateValue === 'hard_reached') {
    return 'Hard limit tercapai - pindah spot.';
  }
  if (stateValue === 'running') {
    return 'Timer berjalan.';
  }
  return 'Timer belum mulai.';
}

function renderSessionStatus() {
  if (!sessionStatus) {
    return;
  }
  if (!state.activeSession) {
    sessionStatus.textContent = 'Belum mulai';
    return;
  }
  sessionStatus.textContent = `Aktif - Mode ${state.activeSession.mode}`;
}

function renderActiveSpot() {
  if (!activeSpotEl) {
    return;
  }
  activeSpotEl.replaceChildren();

  if (!state.activeSpot) {
    const title = document.createElement('div');
    title.className = 'active-spot-title';
    title.textContent = 'Belum ada spot aktif';

    const meta = document.createElement('div');
    meta.className = 'active-spot-meta';
    meta.textContent = 'Mulai sesi untuk melihat spot.';

    activeSpotEl.append(title, meta);
    return;
  }

  const title = document.createElement('div');
  title.className = 'active-spot-title';
  title.textContent = `${state.activeSpot.code} - ${state.activeSpot.name}`;

  const meta = document.createElement('div');
  meta.className = 'active-spot-meta';
  meta.textContent = `${state.activeSpot.lat}, ${state.activeSpot.lng}`;

  activeSpotEl.append(title, meta);
}

function renderTimerDisplay() {
  if (!timerDisplay || !timerHint) {
    return;
  }

  const session = state.activeSession;
  if (!session || !session.timer) {
    timerDisplay.textContent = '00:00';
    timerHint.textContent = 'Timer belum mulai.';
    if (timerProgress) {
      timerProgress.max = 1;
      timerProgress.value = 0;
    }
    return;
  }

  const timer = session.timer;
  let elapsed = 0;
  let remaining = 0;

  if (timer.startedAt) {
    elapsed = Date.now() - timer.startedAt;
    remaining = Math.max(timer.hardMs - elapsed, 0);
  }

  timerDisplay.textContent = formatDuration(remaining);
  timerHint.textContent = getTimerHint(timer.state);
  if (timerProgress) {
    timerProgress.max = timer.hardMs || 1;
    timerProgress.value = Math.min(elapsed, timer.hardMs || 1);
  }
}

function updateSessionControls() {
  const session = state.activeSession;
  const hasSession = !!session && session.status === 'active';
  const timerState = session?.timer?.state || 'idle';
  const isBusy = state.actionBusy;

  if (startSessionButton) {
    startSessionButton.disabled = isBusy || hasSession;
  }
  if (endSessionButton) {
    endSessionButton.disabled = isBusy || !hasSession;
  }
  if (arriveSpotButton) {
    arriveSpotButton.disabled = isBusy || !hasSession || timerState !== 'idle';
  }
  if (moveNextButton) {
    moveNextButton.disabled = isBusy || !hasSession;
  }
  if (openMapsButton) {
    openMapsButton.disabled = isBusy || !state.activeSpot;
  }
  if (logAcceptButton) {
    logAcceptButton.disabled = isBusy || !hasSession;
  }
  if (logSkipButton) {
    logSkipButton.disabled = isBusy || !hasSession;
  }
  if (logDropoffButton) {
    logDropoffButton.disabled = isBusy || !hasSession;
  }
  sessionModeButtons.forEach((button) => {
    button.disabled = isBusy || hasSession;
  });
}

function renderSessionUI() {
  updateSessionModeButtons();
  renderSessionStatus();
  renderActiveSpot();
  renderTimerDisplay();
  updateSessionControls();
}

async function refreshActiveSpot() {
  if (!state.activeSession || !state.activeSession.activeSpotId) {
    state.activeSpot = null;
    return;
  }
  state.activeSpot = await getSpotById(state.activeSession.activeSpotId);
}

function renderEvents(events) {
  if (!eventList || !logMeta) {
    return;
  }
  eventList.replaceChildren();

  if (!events.length) {
    const empty = document.createElement('li');
    empty.className = 'event-item';
    empty.textContent = 'Belum ada event untuk sesi ini.';
    eventList.appendChild(empty);
    logMeta.textContent = 'Event: 0';
    return;
  }

  events.forEach((event) => {
    const item = document.createElement('li');
    item.className = 'event-item';
    const time = formatClock(event.at);
    item.textContent = `${time} - ${event.type}`;
    eventList.appendChild(item);
  });

  logMeta.textContent = `Event: ${events.length}`;
}

async function refreshLog() {
  if (!eventList || !logMeta) {
    return;
  }
  if (!state.activeSession) {
    eventList.replaceChildren();
    const empty = document.createElement('li');
    empty.className = 'event-item';
    empty.textContent = 'Belum ada sesi aktif.';
    eventList.appendChild(empty);
    logMeta.textContent = 'Event: 0';
    return;
  }

  const events = await getEventsForSession(state.activeSession.id, 200);
  renderEvents(events);
}

async function addSessionEvent(type, payload) {
  const session = state.activeSession;
  if (!session) {
    return;
  }
  await addEvent({
    sessionId: session.id,
    type,
    payload,
  });
  await refreshLog();
}

async function saveSession(session) {
  await updateSession(session);
  state.activeSession = session;
}

function stopTicker() {
  if (timerIntervalId) {
    window.clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function startTicker() {
  stopTicker();
  timerIntervalId = window.setInterval(() => {
    tickTimer();
  }, 1000);
  tickTimer();
}

async function evaluateTimer(session, elapsed) {
  const timer = session.timer;
  if (!timer || timer.startedAt === null) {
    return;
  }

  let updated = false;
  let hardTriggeredNow = false;

  if (elapsed < timer.softMs) {
    if (timer.state !== 'running') {
      timer.state = 'running';
      updated = true;
    }
  }

  if (elapsed >= timer.softMs) {
    if (!timer.softEmitted) {
      timer.softEmitted = true;
      updated = true;
      await addSessionEvent('TIMER_SOFT_REACHED', { spotId: session.activeSpotId });
      await showLocalNotification(
        'MDOS: Soft limit tercapai',
        'Kalau masih sepi, siap pindah spot.',
        {
          route: '#sesi',
          kind: 'timer-soft',
          sessionId: session.id,
          spotId: session.activeSpotId,
        },
        { tag: 'mdos-timer-soft' }
      );
    }
    if (elapsed < timer.hardMs && timer.state !== 'soft_reached') {
      timer.state = 'soft_reached';
      updated = true;
    }
  }

  if (elapsed >= timer.hardMs) {
    if (!timer.hardEmitted) {
      timer.hardEmitted = true;
      updated = true;
      hardTriggeredNow = true;
      await addSessionEvent('TIMER_HARD_REACHED', { spotId: session.activeSpotId });
      await showLocalNotification(
        'MDOS: Hard limit tercapai',
        'Pindah spot sekarang sesuai SOP.',
        {
          route: '#sesi',
          kind: 'timer-hard',
          sessionId: session.id,
          spotId: session.activeSpotId,
        },
        { tag: 'mdos-timer-hard', requireInteraction: true }
      );
    }
    if (timer.state !== 'hard_reached') {
      timer.state = 'hard_reached';
      updated = true;
    }
  }

  if (updated) {
    await saveSession(session);
  }

  if (hardTriggeredNow && navigator.vibrate) {
    navigator.vibrate(200);
  }
}

async function tickTimer() {
  if (tickBusy) {
    return;
  }
  tickBusy = true;
  try {
    const session = state.activeSession;
    if (!session || session.status !== 'active' || !session.timer?.startedAt) {
      stopTicker();
      return;
    }

    const elapsed = Date.now() - session.timer.startedAt;
    await evaluateTimer(session, elapsed);
    renderTimerDisplay();

    if (session.timer.state === 'hard_reached') {
      stopTicker();
    }
  } finally {
    tickBusy = false;
  }
}

async function resumeTimerIfNeeded() {
  const session = state.activeSession;
  if (!session || !session.timer?.startedAt) {
    stopTicker();
    renderTimerDisplay();
    return;
  }

  const elapsed = Date.now() - session.timer.startedAt;
  await evaluateTimer(session, elapsed);
  renderTimerDisplay();

  if (session.timer.state === 'running' || session.timer.state === 'soft_reached') {
    startTicker();
  }
}

async function runSessionAction(action) {
  if (state.actionBusy) {
    return;
  }
  state.actionBusy = true;
  updateSessionControls();
  try {
    await action();
  } finally {
    state.actionBusy = false;
    updateSessionControls();
  }
}

async function handleStartSession() {
  await runSessionAction(async () => {
    if (state.activeSession) {
      window.alert('Sesi masih aktif.');
      return;
    }
    await ensureSeedReady();
    const session = await createSession(state.sessionMode);
    state.activeSession = session;
    state.sessionMode = session.mode;
    await refreshActiveSpot();
    await addSessionEvent('SESSION_STARTED', { mode: session.mode });
    if (session.activeSpotId) {
      await addSessionEvent('SPOT_SET_ACTIVE', { spotId: session.activeSpotId });
    }
    renderSessionUI();
  });
}

async function handleEndSession() {
  await runSessionAction(async () => {
    if (!state.activeSession) {
      window.alert('Belum ada sesi aktif.');
      return;
    }
    stopTicker();
    await addSessionEvent('SESSION_ENDED', {});
    await endActiveSession();
    state.activeSession = null;
    state.activeSpot = null;
    renderSessionUI();
    await refreshLog();
  });
}

async function handleArriveSpot() {
  await runSessionAction(async () => {
    const session = state.activeSession;
    if (!session) {
      window.alert('Belum ada sesi aktif.');
      return;
    }
    if (session.timer?.startedAt) {
      window.alert('Timer masih berjalan.');
      return;
    }
    const now = Date.now();
    session.timer = {
      ...(session.timer || {}),
      state: 'running',
      startedAt: now,
      softEmitted: false,
      hardEmitted: false,
    };
    await saveSession(session);
    await addSessionEvent('ARRIVED_AT_SPOT', { spotId: session.activeSpotId });
    await addSessionEvent('TIMER_STARTED', {
      spotId: session.activeSpotId,
      softMs: session.timer.softMs,
      hardMs: session.timer.hardMs,
    });
    renderSessionUI();
    startTicker();
  });
}

async function handleMoveNext() {
  await runSessionAction(async () => {
    const session = state.activeSession;
    if (!session) {
      window.alert('Belum ada sesi aktif.');
      return;
    }
    const nextSpotId = await getNextSpotId(session.mode, session.activeSpotId);
    if (!nextSpotId) {
      window.alert('Spot berikutnya tidak ditemukan.');
      return;
    }
    const previousSpotId = session.activeSpotId;
    session.activeSpotId = nextSpotId;
    session.timer = {
      ...(session.timer || {}),
      state: 'idle',
      startedAt: null,
      softEmitted: false,
      hardEmitted: false,
    };
    await saveSession(session);
    stopTicker();
    await addSessionEvent('MOVE_TO_NEXT_SPOT', {
      fromSpotId: previousSpotId,
      toSpotId: nextSpotId,
    });
    await addSessionEvent('SPOT_SET_ACTIVE', { spotId: nextSpotId });
    await refreshActiveSpot();
    renderSessionUI();
  });
}

async function handleOpenMaps() {
  if (!state.activeSpot) {
    window.alert('Belum ada spot aktif.');
    return;
  }
  window.open(state.activeSpot.mapsUrl, '_blank', 'noopener');
}

async function handleQuickLog(type) {
  await runSessionAction(async () => {
    if (!state.activeSession) {
      window.alert('Belum ada sesi aktif.');
      return;
    }
    const payload = { spotId: state.activeSession.activeSpotId || null };
    if (type === 'ORDER_SKIPPED') {
      const reason = window.prompt('Alasan skip?');
      if (reason === null) {
        return;
      }
      payload.reason = reason;
    }
    if (type === 'TRIP_DROPOFF_RECORDED') {
      const note = window.prompt('Catatan dropoff (opsional):');
      if (note) {
        payload.note = note;
      }
    }
    await addSessionEvent(type, payload);
  });
}

async function handleRotasiSpotClick(event) {
  const target = event.target;
  if (target.closest('a')) {
    return;
  }
  const card = target.closest('.spot-card');
  if (!card) {
    return;
  }
  const spotId = card.dataset.spotId;
  if (!spotId || !state.activeSession) {
    return;
  }
  if (spotId === state.activeSession.activeSpotId) {
    return;
  }

  await runSessionAction(async () => {
    const session = state.activeSession;
    if (!session) {
      return;
    }
    session.activeSpotId = spotId;
    session.timer = {
      ...(session.timer || {}),
      state: 'idle',
      startedAt: null,
      softEmitted: false,
      hardEmitted: false,
    };
    await saveSession(session);
    stopTicker();
    await addSessionEvent('SPOT_SET_ACTIVE', { spotId });
    await refreshActiveSpot();
    renderSessionUI();
  });
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

async function initSessionState() {
  const session = await getActiveSession();
  if (session && session.status === 'active') {
    state.activeSession = session;
    state.sessionMode = session.mode;
    await refreshActiveSpot();
    await refreshLog();
    renderSessionUI();
    await resumeTimerIfNeeded();
    return;
  }
  state.activeSession = null;
  state.activeSpot = null;
  renderSessionUI();
  await refreshLog();
}

syncRoute();
window.addEventListener('hashchange', syncRoute);

rotasiModeButtons.forEach((button) => {
  button.addEventListener('click', () => setRotasiMode(button.dataset.rotasiMode));
});

sessionModeButtons.forEach((button) => {
  button.addEventListener('click', () => setSessionMode(button.dataset.sessionMode));
});

if (spotList) {
  spotList.addEventListener('click', handleRotasiSpotClick);
}

if (startSessionButton) {
  startSessionButton.addEventListener('click', handleStartSession);
}
if (endSessionButton) {
  endSessionButton.addEventListener('click', handleEndSession);
}
if (arriveSpotButton) {
  arriveSpotButton.addEventListener('click', handleArriveSpot);
}
if (moveNextButton) {
  moveNextButton.addEventListener('click', handleMoveNext);
}
if (openMapsButton) {
  openMapsButton.addEventListener('click', handleOpenMaps);
}
if (logAcceptButton) {
  logAcceptButton.addEventListener('click', () => handleQuickLog('ORDER_ACCEPTED'));
}
if (logSkipButton) {
  logSkipButton.addEventListener('click', () => handleQuickLog('ORDER_SKIPPED'));
}
if (logDropoffButton) {
  logDropoffButton.addEventListener('click', () => handleQuickLog('TRIP_DROPOFF_RECORDED'));
}

if (notifEnabledToggle) {
  notifEnabledToggle.addEventListener('change', async (event) => {
    const enabled = event.target.checked;
    await setKV('notificationsEnabled', enabled);
    notificationState.enabled = enabled;
    updateNotificationUI();
  });
}

if (notifRequestButton) {
  notifRequestButton.addEventListener('click', async () => {
    const granted = await ensureNotificationPermission();
    notificationState.permission = getNotificationPermission();
    updateNotificationUI();
    if (!granted) {
      window.alert('Izin notifikasi belum diberikan.');
    }
  });
}

if (notifTestButton) {
  notifTestButton.addEventListener('click', async () => {
    const granted = await ensureNotificationPermission();
    notificationState.permission = getNotificationPermission();
    updateNotificationUI();
    if (!granted) {
      window.alert('Izin notifikasi belum diberikan.');
      return;
    }
    const shown = await showLocalNotification(
      'MDOS Test',
      'Notifikasi berfungsi.',
      { kind: 'test', route: '#setelan' },
      { tag: 'mdos-test', ignoreQuietHours: true }
    );
    if (!shown) {
      window.alert('Notifikasi tidak ditampilkan. Pastikan toggle aktif.');
    }
  });
}

if (saveVapidButton) {
  saveVapidButton.addEventListener('click', async () => {
    const value = vapidKeyInput ? vapidKeyInput.value.trim() : '';
    if (value) {
      await setKV('vapidPublicKey', value);
      notificationState.vapidKey = value;
    } else {
      await deleteKV('vapidPublicKey');
      notificationState.vapidKey = '';
    }
    updateNotificationUI();
  });
}

if (quietSaveButton) {
  quietSaveButton.addEventListener('click', async () => {
    const startValue = quietStartInput ? quietStartInput.value : '';
    const endValue = quietEndInput ? quietEndInput.value : '';
    if (parseTimeToMinutes(startValue) === null || parseTimeToMinutes(endValue) === null) {
      window.alert('Format jam tenang tidak valid.');
      return;
    }
    await setKV('quietHoursStart', startValue);
    await setKV('quietHoursEnd', endValue);
    notificationState.quietStart = startValue;
    notificationState.quietEnd = endValue;
    updateNotificationUI();
  });
}

if (pushSubscribeButton) {
  pushSubscribeButton.addEventListener('click', subscribeToPushIfPossible);
}

if (pushExportButton) {
  pushExportButton.addEventListener('click', exportPushSubscription);
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

async function initApp() {
  await ensureSeedReady();
  await loadNotificationSettings();
  updateNotificationUI();
  await initSessionState();
  updateRotasiModeButtons();
  updateSessionModeButtons();
  setRotasiMode(state.rotasiMode);
  registerServiceWorker();
}

initApp();
