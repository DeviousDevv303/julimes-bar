// Julimes Bar - Admin JavaScript

const REVIEWS_KEY = 'julimes_reviews';
const PENDING_KEY = 'julimes_pending_reviews';
const EVENTS_KEY = 'julimes_events';
const MENU_KEY = 'julimes_menu';
const SETTINGS_KEY = 'julimes_settings';

const DEFAULT_SETTINGS = {
  phone: '639 167 9514',
  whatsapp: '526391679514',
  hours: 'Jueves a Lunes: 5:00 PM - 12:00 AM\nMartes y Miércoles: Cerrado',
  facebook: ''
};

const MENU_CATEGORY_LABELS = {
  cervezas: 'Cervezas',
  cocteles: 'Cócteles',
  destilados: 'Destilados',
  botanas: 'Botanas'
};

// ─── Helpers ──────────────────────────────────────────────────
function safeJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed === null ? fallback : parsed;
  } catch (error) {
    return fallback;
  }
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clampRating(value) {
  const rating = Number.parseInt(value, 10);
  if (Number.isNaN(rating)) return 5;
  return Math.min(5, Math.max(1, rating));
}

function formatPrice(value) {
  const price = Number.parseFloat(value);
  if (Number.isNaN(price)) return '$0';
  return `$${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}`;
}

// ─── Auth ────────────────────────────────────────────────────
function isAdminLoggedIn() {
  return sessionStorage.getItem('admin_logged_in') === 'true';
}

const SALT = 'julimes_bar_2024_chihuahua';
const ADMIN_HASH = '3f56441ffab78e79b76b7411653f85d21e73398b05cfdf05693b976ff9c0d857';

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function adminLogin(password) {
  if (!window.crypto?.subtle) {
    alert('Este navegador requiere HTTPS para iniciar sesión en el panel.');
    return false;
  }

  const salted = SALT + password;
  const hash = await sha256(salted);
  if (hash === ADMIN_HASH) {
    sessionStorage.setItem('admin_logged_in', 'true');
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem('admin_logged_in');
  window.location.reload();
}

// ─── Login Screen ────────────────────────────────────────────
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;

    if (await adminLogin(password)) {
      loginScreen.style.display = 'none';
      dashboard.style.display = 'block';
      loadDashboard();
    } else {
      alert('Contraseña incorrecta');
    }
  });
}

// ─── Tab Navigation ──────────────────────────────────────────
const tabButtons = document.querySelectorAll('.admin-nav button[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;

    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
  });
});

// ─── Stats ───────────────────────────────────────────────────
function updateStats() {
  const pending = safeJSON(PENDING_KEY, []);
  const approved = safeJSON(REVIEWS_KEY, []);
  const events = safeJSON(EVENTS_KEY, []);

  document.getElementById('stat-pending').textContent = Array.isArray(pending) ? pending.length : 0;
  document.getElementById('stat-approved').textContent = Array.isArray(approved) ? approved.length : 0;
  document.getElementById('stat-total').textContent = (Array.isArray(pending) ? pending.length : 0) + (Array.isArray(approved) ? approved.length : 0);
  document.getElementById('stat-events').textContent = Array.isArray(events) ? events.length : 0;
}

// ─── Reviews ─────────────────────────────────────────────────
function loadPendingReviews() {
  const pending = safeJSON(PENDING_KEY, []);
  const tbody = document.getElementById('pending-reviews-table');

  if (!tbody) return;

  if (!Array.isArray(pending) || pending.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No hay reseñas pendientes</td></tr>';
    return;
  }

  tbody.innerHTML = pending.map(review => `
    <tr>
      <td>${escapeHTML(review.name)}</td>
      <td>${'⭐'.repeat(clampRating(review.rating))}</td>
      <td>${escapeHTML(review.text).substring(0, 80)}${String(review.text || '').length > 80 ? '...' : ''}</td>
      <td>${escapeHTML(review.date)}</td>
      <td>
        <button class="action-btn btn-approve" onclick="approveReview(${Number(review.id)})">Aprobar</button>
        <button class="action-btn btn-reject" onclick="rejectReview(${Number(review.id)})">Rechazar</button>
      </td>
    </tr>
  `).join('');
}

function loadApprovedReviews() {
  const approved = safeJSON(REVIEWS_KEY, []);
  const tbody = document.getElementById('approved-reviews-table');

  if (!tbody) return;

  if (!Array.isArray(approved) || approved.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No hay reseñas aprobadas</td></tr>';
    return;
  }

  tbody.innerHTML = approved.map(review => `
    <tr>
      <td>${escapeHTML(review.name)}</td>
      <td>${'⭐'.repeat(clampRating(review.rating))}</td>
      <td>${escapeHTML(review.text).substring(0, 80)}${String(review.text || '').length > 80 ? '...' : ''}</td>
      <td>${escapeHTML(review.date)}</td>
      <td>
        <button class="action-btn btn-delete" onclick="deleteReview(${Number(review.id)})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function approveReview(id) {
  const pending = safeJSON(PENDING_KEY, []);
  const approved = safeJSON(REVIEWS_KEY, []);

  const review = pending.find(r => Number(r.id) === Number(id));
  if (review) {
    review.status = 'approved';
    approved.push(review);

    const newPending = pending.filter(r => Number(r.id) !== Number(id));

    localStorage.setItem(REVIEWS_KEY, JSON.stringify(approved));
    localStorage.setItem(PENDING_KEY, JSON.stringify(newPending));

    loadPendingReviews();
    loadApprovedReviews();
    updateStats();
  }
}

function rejectReview(id) {
  const pending = safeJSON(PENDING_KEY, []);
  const newPending = pending.filter(r => Number(r.id) !== Number(id));
  localStorage.setItem(PENDING_KEY, JSON.stringify(newPending));

  loadPendingReviews();
  updateStats();
}

function deleteReview(id) {
  if (!confirm('¿Eliminar esta reseña permanentemente?')) return;

  const approved = safeJSON(REVIEWS_KEY, []);
  const newApproved = approved.filter(r => Number(r.id) !== Number(id));
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(newApproved));

  loadApprovedReviews();
  updateStats();
}

// ─── Events ──────────────────────────────────────────────────
const eventForm = document.getElementById('event-form');
if (eventForm) {
  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const event = {
      id: Date.now(),
      name: document.getElementById('event-name').value.trim(),
      date: document.getElementById('event-date').value,
      time: document.getElementById('event-time').value,
      description: document.getElementById('event-desc').value.trim(),
      type: document.getElementById('event-type').value
    };

    const events = safeJSON(EVENTS_KEY, []);
    events.push(event);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    eventForm.reset();
    loadEvents();
    updateStats();
    alert('Evento agregado');
  });
}

function loadEvents() {
  const events = safeJSON(EVENTS_KEY, []);
  const tbody = document.getElementById('events-table');

  if (!tbody) return;

  if (!Array.isArray(events) || events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No hay eventos programados</td></tr>';
    return;
  }

  tbody.innerHTML = events.map(event => `
    <tr>
      <td>${escapeHTML(event.name)}</td>
      <td>${escapeHTML(event.date)}</td>
      <td>${escapeHTML(event.time)}</td>
      <td><span class="status-badge status-${event.type === 'music' ? 'approved' : 'pending'}">${escapeHTML(event.type)}</span></td>
      <td>
        <button class="action-btn btn-delete" onclick="deleteEvent(${Number(event.id)})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function deleteEvent(id) {
  if (!confirm('¿Eliminar este evento?')) return;

  const events = safeJSON(EVENTS_KEY, []);
  const newEvents = events.filter(e => Number(e.id) !== Number(id));
  localStorage.setItem(EVENTS_KEY, JSON.stringify(newEvents));

  loadEvents();
  updateStats();
}

// ─── Menu ────────────────────────────────────────────────────
const menuForm = document.getElementById('menu-form');
if (menuForm) {
  menuForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const item = {
      id: Date.now(),
      name: document.getElementById('item-name').value.trim(),
      price: Number.parseFloat(document.getElementById('item-price').value),
      category: document.getElementById('item-category').value,
      description: document.getElementById('item-desc').value.trim()
    };

    const menu = safeJSON(MENU_KEY, []);
    menu.push(item);
    localStorage.setItem(MENU_KEY, JSON.stringify(menu));

    menuForm.reset();
    loadMenuItems();
    alert('Producto agregado al menú');
  });
}

function loadMenuItems() {
  const menu = safeJSON(MENU_KEY, []);
  const tbody = document.getElementById('menu-table');

  if (!tbody) return;

  if (!Array.isArray(menu) || menu.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No hay productos personalizados. El sitio mostrará el menú base.</td></tr>';
    return;
  }

  tbody.innerHTML = menu.map(item => `
    <tr>
      <td>${escapeHTML(item.name)}</td>
      <td>${escapeHTML(MENU_CATEGORY_LABELS[item.category] || item.category)}</td>
      <td>${escapeHTML(formatPrice(item.price))}</td>
      <td>${escapeHTML(item.description || '')}</td>
      <td>
        <button class="action-btn btn-delete" onclick="deleteMenuItem(${Number(item.id)})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function deleteMenuItem(id) {
  if (!confirm('¿Eliminar este producto del menú?')) return;

  const menu = safeJSON(MENU_KEY, []);
  const newMenu = menu.filter(item => Number(item.id) !== Number(id));
  localStorage.setItem(MENU_KEY, JSON.stringify(newMenu));

  loadMenuItems();
}

// ─── Settings ────────────────────────────────────────────────
const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
  const settings = { ...DEFAULT_SETTINGS, ...safeJSON(SETTINGS_KEY, {}) };
  document.getElementById('setting-phone').value = settings.phone || '';
  document.getElementById('setting-whatsapp').value = settings.whatsapp || '';
  document.getElementById('setting-hours').value = settings.hours || '';
  document.getElementById('setting-facebook').value = settings.facebook || '';

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const settings = {
      phone: document.getElementById('setting-phone').value.trim(),
      whatsapp: document.getElementById('setting-whatsapp').value.trim(),
      hours: document.getElementById('setting-hours').value.trim(),
      facebook: document.getElementById('setting-facebook').value.trim()
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    alert('Configuración guardada');
  });
}

// ─── Load Dashboard ──────────────────────────────────────────
function loadDashboard() {
  updateStats();
  loadPendingReviews();
  loadApprovedReviews();
  loadEvents();
  loadMenuItems();
}

if (isAdminLoggedIn()) {
  if (loginScreen) loginScreen.style.display = 'none';
  if (dashboard) dashboard.style.display = 'block';
  loadDashboard();
}
