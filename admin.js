// Julimes Bar - Admin JavaScript

const REVIEWS_KEY = 'julimes_reviews';
const PENDING_KEY = 'julimes_pending_reviews';
const EVENTS_KEY = 'julimes_events';
const MENU_KEY = 'julimes_menu';
const SETTINGS_KEY = 'julimes_settings';

// ─── Auth ────────────────────────────────────────────────────
function isAdminLoggedIn() {
  return sessionStorage.getItem('admin_logged_in') === 'true';
}

// SHA-256 helper for password verification (synchronous via cached hash)
const SALT = 'julimes_bar_2024_chihuahua';
const ADMIN_HASH = 'a8f5f167f44f4964e6c998dee827110c9a0c5e1e7a5b6e5f9d8c7b6a5f4e3d2c';

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function adminLogin(password) {
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

// Check auth on load
if (isAdminLoggedIn()) {
  if (loginScreen) loginScreen.style.display = 'none';
  if (dashboard) dashboard.style.display = 'block';
  loadDashboard();
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
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  const approved = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  
  document.getElementById('stat-pending').textContent = pending.length;
  document.getElementById('stat-approved').textContent = approved.length;
  document.getElementById('stat-total').textContent = pending.length + approved.length;
  document.getElementById('stat-events').textContent = events.length;
}

// ─── Reviews ─────────────────────────────────────────────────
function loadPendingReviews() {
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  const tbody = document.getElementById('pending-reviews-table');
  
  if (!tbody) return;
  
  if (pending.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No hay reseñas pendientes</td></tr>';
    return;
  }
  
  tbody.innerHTML = pending.map(review => `
    <tr>
      <td>${review.name.replace(/<[^>]*>/g, '')}</td>
      <td>${'⭐'.repeat(review.rating)}</td>
      <td>${review.text.replace(/<[^>]*>/g, '').substring(0, 50)}${review.text.length > 50 ? '...' : ''}</td>
      <td>${review.date}</td>
      <td>
        <button class="action-btn btn-approve" onclick="approveReview(${review.id})">Aprobar</button>
        <button class="action-btn btn-reject" onclick="rejectReview(${review.id})">Rechazar</button>
      </td>
    </tr>
  `).join('');
}

function loadApprovedReviews() {
  const approved = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  const tbody = document.getElementById('approved-reviews-table');
  
  if (!tbody) return;
  
  if (approved.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No hay reseñas aprobadas</td></tr>';
    return;
  }
  
  tbody.innerHTML = approved.map(review => `
    <tr>
      <td>${review.name.replace(/<[^>]*>/g, '')}</td>
      <td>${'⭐'.repeat(review.rating)}</td>
      <td>${review.text.replace(/<[^>]*>/g, '').substring(0, 50)}${review.text.length > 50 ? '...' : ''}</td>
      <td>${review.date}</td>
      <td>
        <button class="action-btn btn-delete" onclick="deleteReview(${review.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function approveReview(id) {
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  const approved = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  
  const review = pending.find(r => r.id === id);
  if (review) {
    review.status = 'approved';
    approved.push(review);
    
    const newPending = pending.filter(r => r.id !== id);
    
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(approved));
    localStorage.setItem(PENDING_KEY, JSON.stringify(newPending));
    
    loadPendingReviews();
    loadApprovedReviews();
    updateStats();
  }
}

function rejectReview(id) {
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  const newPending = pending.filter(r => r.id !== id);
  localStorage.setItem(PENDING_KEY, JSON.stringify(newPending));
  
  loadPendingReviews();
  updateStats();
}

function deleteReview(id) {
  if (!confirm('¿Eliminar esta reseña permanentemente?')) return;
  
  const approved = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  const newApproved = approved.filter(r => r.id !== id);
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
      name: document.getElementById('event-name').value,
      date: document.getElementById('event-date').value,
      time: document.getElementById('event-time').value,
      description: document.getElementById('event-desc').value,
      type: document.getElementById('event-type').value
    };
    
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    events.push(event);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    
    eventForm.reset();
    loadEvents();
    updateStats();
    alert('Evento agregado');
  });
}

function loadEvents() {
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  const tbody = document.getElementById('events-table');
  
  if (!tbody) return;
  
  if (events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No hay eventos programados</td></tr>';
    return;
  }
  
  tbody.innerHTML = events.map(event => `
    <tr>
      <td>${event.name}</td>
      <td>${event.date}</td>
      <td>${event.time}</td>
      <td><span class="status-badge status-${event.type === 'music' ? 'approved' : 'pending'}">${event.type}</span></td>
      <td>
        <button class="action-btn btn-delete" onclick="deleteEvent(${event.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function deleteEvent(id) {
  if (!confirm('¿Eliminar este evento?')) return;
  
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  const newEvents = events.filter(e => e.id !== id);
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
      name: document.getElementById('item-name').value,
      price: parseFloat(document.getElementById('item-price').value),
      category: document.getElementById('item-category').value,
      description: document.getElementById('item-desc').value
    };
    
    const menu = JSON.parse(localStorage.getItem(MENU_KEY) || '[]');
    menu.push(item);
    localStorage.setItem(MENU_KEY, JSON.stringify(menu));
    
    menuForm.reset();
    alert('Producto agregado al menú');
  });
}

// ─── Settings ────────────────────────────────────────────────
const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
  // Load current settings
  const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  document.getElementById('setting-phone').value = settings.phone || '';
  document.getElementById('setting-whatsapp').value = settings.whatsapp || '';
  document.getElementById('setting-hours').value = settings.hours || '';
  document.getElementById('setting-facebook').value = settings.facebook || '';
  
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const settings = {
      phone: document.getElementById('setting-phone').value,
      whatsapp: document.getElementById('setting-whatsapp').value,
      hours: document.getElementById('setting-hours').value,
      facebook: document.getElementById('setting-facebook').value
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
}

// ─── Demo Data ─────────────────────────────────────────────────
function addDemoData() {
  // Add sample approved reviews
  const approved = [
    {
      id: 1,
      name: 'María González',
      text: 'Excelente ambiente y muy buen servicio. Las cervezas bien frías. Volveré pronto.',
      rating: 5,
      date: '15/05/2024',
      status: 'approved'
    },
    {
      id: 2,
      name: 'Carlos Ramírez',
      text: 'Buen lugar para pasar el rato con amigos. La música estuvo genial.',
      rating: 4,
      date: '10/05/2024',
      status: 'approved'
    }
  ];
  
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(approved));
  
  // Add sample events
  const events = [
    {
      id: 1,
      name: 'Noche de Karaoke',
      date: '2024-06-15',
      time: '20:00',
      description: 'Ven a cantar tus canciones favoritas',
      type: 'music'
    }
  ];
  
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

// Uncomment to add demo data:
// addDemoData();