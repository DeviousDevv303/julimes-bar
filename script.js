// Julimes Bar - Main JavaScript

// ─── Storage Keys ─────────────────────────────────────────────
const REVIEWS_KEY = 'julimes_reviews';
const PENDING_KEY = 'julimes_pending_reviews';
const EVENTS_KEY = 'julimes_events';
const MENU_KEY = 'julimes_menu';
const SETTINGS_KEY = 'julimes_settings';

// ─── Default Public Content ───────────────────────────────────
const DEFAULT_MENU = [
  { id: 'beer-1', name: 'Cuartito XX', price: 10, category: 'cervezas', description: '' },
  { id: 'beer-2', name: 'Cerveza Nacional', nameEn: 'Domestic Beer', price: 25, category: 'cervezas', description: '' },
  { id: 'beer-3', name: 'Cerveza Importada', nameEn: 'Imported Beer', price: 35, category: 'cervezas', description: '' },
  { id: 'cocktail-1', name: 'Margarita', price: 60, category: 'cocteles', description: '' },
  { id: 'cocktail-2', name: 'Paloma', price: 55, category: 'cocteles', description: '' },
  { id: 'cocktail-3', name: 'Michelada', price: 45, category: 'cocteles', description: '' },
  { id: 'spirit-1', name: 'Don Julio 70', price: 120, category: 'destilados', description: '' },
  { id: 'spirit-2', name: '1800 Reposado', price: 100, category: 'destilados', description: '' },
  { id: 'spirit-3', name: 'Johnnie Walker Black Label', price: 150, category: 'destilados', description: '' },
  { id: 'spirit-4', name: 'Hennessy VS', price: 140, category: 'destilados', description: '' },
  { id: 'spirit-5', name: 'Hornitos Reposado', price: 90, category: 'destilados', description: '' },
  { id: 'snack-1', name: 'Pozole', price: 80, category: 'botanas', description: '' },
  { id: 'snack-2', name: 'Tacos de Birria', nameEn: 'Birria Tacos', price: 70, category: 'botanas', description: '' },
  { id: 'snack-3', name: 'Alitas BBQ', nameEn: 'BBQ Wings', price: 90, category: 'botanas', description: '' },
  { id: 'snack-4', name: 'Papas a la Francesa', nameEn: 'French Fries', price: 50, category: 'botanas', description: '' }
];

const DEFAULT_EVENTS = [
  {
    id: 'karaoke-weekly',
    name: 'Noche de Karaoke',
    nameEn: 'Karaoke Night',
    date: 'SÁB',
    dateEn: 'SAT',
    month: 'CADA SEMANA',
    monthEn: 'EVERY WEEK',
    time: '8:00 PM - 12:00 AM',
    description: '',
    descriptionEn: '',
    type: 'music'
  },
  {
    id: 'saturday-promo',
    name: 'Sábado de Promo',
    nameEn: 'Saturday Promo',
    date: 'SÁB',
    dateEn: 'SAT',
    month: 'PROMO',
    monthEn: 'PROMO',
    time: '5:00 PM - 12:00 AM',
    description: 'Cuartito XX a solo $10 pesitos. ¡La mejor promo de la semana!',
    descriptionEn: 'Cuartito XX for just $10 pesos. The best deal of the week!',
    type: 'promo'
  }
];

const DEFAULT_SETTINGS = {
  phone: '639 167 9514',
  whatsapp: '526391679514',
  hours: 'Jueves a Lunes: 5:00 PM - 12:00 AM\nMartes y Miércoles: Cerrado',
  hoursEn: 'Thursday to Monday: 5:00 PM - 12:00 AM\nTuesday & Wednesday: Closed',
  facebook: ''
};

const MENU_CATEGORIES = {
  cervezas: { icon: '🍺', es: 'Cervezas', en: 'Beers' },
  cocteles: { icon: '🍹', es: 'Cócteles', en: 'Cocktails' },
  destilados: { icon: '🥃', es: 'Destilados', en: 'Spirits' },
  botanas: { icon: '🌮', es: 'Botanas', en: 'Snacks' }
};

// ─── Helpers ──────────────────────────────────────────────────
let currentLanguage = 'es';

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

function textFor(item, key) {
  if (currentLanguage === 'en') {
    return item[`${key}En`] || item[key] || '';
  }
  return item[key] || '';
}

function textWithBreaks(value) {
  return escapeHTML(value).replace(/\n/g, '<br>');
}

function safeExternalURL(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch (error) {
    return '';
  }
}

// ─── Language Toggle ─────────────────────────────────────────
function toggleLanguage() {
  currentLanguage = currentLanguage === 'es' ? 'en' : 'es';

  document.querySelectorAll('[data-es][data-en]').forEach(el => {
    if (el.querySelector('strong, br, a, span')) {
      el.innerHTML = el.getAttribute(`data-${currentLanguage}`);
    } else {
      el.textContent = el.getAttribute(`data-${currentLanguage}`);
    }
  });

  const langIndicator = document.getElementById('current-lang');
  if (langIndicator) {
    langIndicator.textContent = currentLanguage.toUpperCase();
  }

  document.documentElement.lang = currentLanguage;
  localStorage.setItem('julimes_language', currentLanguage);

  renderMenu();
  renderEvents();
  applySettings();
  loadApprovedReviews();
}

// ─── Mobile Navigation ───────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', isActive);
    hamburger.setAttribute('aria-expanded', String(isActive));
  });
}

// ─── Smooth Scroll ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const selector = this.getAttribute('href');
    if (!selector || selector === '#') return;

    e.preventDefault();
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navLinks && hamburger) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

// ─── Navbar Scroll Effect ────────────────────────────────────
const navbar = document.querySelector('.navbar');

if (navbar) {
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.style.background = 'rgba(15, 15, 15, 0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
    } else {
      navbar.style.background = 'rgba(15, 15, 15, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });
}

// ─── Menu Rendering ──────────────────────────────────────────
function getMenuItems() {
  const savedMenu = safeJSON(MENU_KEY, []);
  return Array.isArray(savedMenu) && savedMenu.length > 0 ? savedMenu : DEFAULT_MENU;
}

function renderMenu() {
  const container = document.getElementById('menu-categories');
  if (!container) return;

  const grouped = getMenuItems().reduce((acc, item) => {
    const category = item.category || 'botanas';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  container.innerHTML = Object.entries(MENU_CATEGORIES).map(([category, meta]) => {
    const items = grouped[category] || [];
    if (items.length === 0) return '';

    return `
      <div class="menu-category">
        <h3>${meta.icon} <span>${escapeHTML(meta[currentLanguage])}</span></h3>
        <ul class="menu-list">
          ${items.map(item => `
            <li class="menu-item">
              <span class="item-name">
                ${escapeHTML(textFor(item, 'name'))}
                ${item.description ? `<small>${escapeHTML(textFor(item, 'description'))}</small>` : ''}
              </span>
              <span class="item-price">${escapeHTML(formatPrice(item.price))}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }).join('');
}

// ─── Events Rendering ────────────────────────────────────────
function getEvents() {
  const savedEvents = safeJSON(EVENTS_KEY, []);
  return Array.isArray(savedEvents) && savedEvents.length > 0 ? savedEvents : DEFAULT_EVENTS;
}

function renderEvents() {
  const container = document.getElementById('events-grid');
  if (!container) return;

  container.innerHTML = getEvents().map(event => {
    const hasCalendarDate = /^\d{4}-\d{2}-\d{2}$/.test(String(event.date || ''));
    const eventDate = hasCalendarDate ? new Date(`${event.date}T00:00:00`) : null;
    const locale = currentLanguage === 'es' ? 'es-MX' : 'en-US';
    const dateLabel = eventDate
      ? eventDate.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()
      : (currentLanguage === 'en' ? event.dateEn || event.date || 'SAT' : event.date || 'SÁB');
    const monthLabel = eventDate
      ? eventDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' }).toUpperCase()
      : (currentLanguage === 'en' ? event.monthEn || event.month || 'PROMO' : event.month || 'PROMO');

    return `
      <div class="event-card">
        <div class="event-date">
          <span class="day">${escapeHTML(dateLabel)}</span>
          <span class="month">${escapeHTML(monthLabel)}</span>
        </div>
        <div class="event-info">
          <h3>${escapeHTML(textFor(event, 'name'))}</h3>
          ${textFor(event, 'description') ? `<p>${escapeHTML(textFor(event, 'description'))}</p>` : ''}
          ${event.time ? `<span class="event-time">🕐 ${escapeHTML(event.time)}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ─── Review System ───────────────────────────────────────────
function loadApprovedReviews() {
  const reviews = safeJSON(REVIEWS_KEY, []);
  const container = document.getElementById('approved-reviews');

  if (!container) return;

  if (!Array.isArray(reviews) || reviews.length === 0) {
    const emptyText = currentLanguage === 'es'
      ? 'Sé el primero en dejar una reseña. Tu opinión nos ayuda a crecer.'
      : 'Be the first to leave a review. Your opinion helps us grow.';

    container.innerHTML = `
      <div class="review-card">
        <div class="review-stars">⭐⭐⭐⭐⭐</div>
        <p class="review-text">"${escapeHTML(emptyText)}"</p>
        <div class="review-author">
          <span>${currentLanguage === 'es' ? 'Equipo Julimes Bar' : 'Julimes Bar Team'}</span>
          <span class="review-date">${currentLanguage === 'es' ? 'Ahora' : 'Now'}</span>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-stars">${'⭐'.repeat(clampRating(review.rating))}</div>
      <p class="review-text">"${escapeHTML(review.text)}"</p>
      <div class="review-author">
        <span>${escapeHTML(review.name)}</span>
        <span class="review-date">${escapeHTML(review.date)}</span>
      </div>
    </div>
  `).join('');
}

const reviewForm = document.getElementById('review-form');
if (reviewForm) {
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reviewer-name').value.trim();
    const text = document.getElementById('review-text').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;

    if (!name || !text) return;

    const review = {
      id: Date.now(),
      name,
      text,
      rating: clampRating(rating),
      date: new Date().toLocaleDateString(currentLanguage === 'es' ? 'es-MX' : 'en-US'),
      status: 'pending'
    };

    const pending = safeJSON(PENDING_KEY, []);
    pending.push(review);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));

    const confirmMsg = currentLanguage === 'es'
      ? '¡Gracias por tu reseña! Será revisada antes de publicarse.'
      : 'Thank you for your review! It will be checked before publishing.';
    alert(confirmMsg);
    reviewForm.reset();
  });
}

// ─── Settings Rendering ──────────────────────────────────────
function getSettings() {
  return { ...DEFAULT_SETTINGS, ...safeJSON(SETTINGS_KEY, {}) };
}

function applySettings() {
  const settings = getSettings();
  const phoneText = document.getElementById('contact-phone-text');
  const phoneLink = document.getElementById('contact-phone-link');
  const whatsappLink = document.getElementById('whatsapp-link');
  const hoursText = document.getElementById('contact-hours');
  const facebookLink = document.getElementById('facebook-link');

  if (phoneText) phoneText.textContent = settings.phone;
  if (phoneLink) phoneLink.href = `tel:${String(settings.phone).replace(/[^+\d]/g, '')}`;
  if (whatsappLink) whatsappLink.href = `https://wa.me/${String(settings.whatsapp || settings.phone).replace(/\D/g, '')}`;
  if (hoursText) hoursText.innerHTML = textWithBreaks(currentLanguage === 'en' ? settings.hoursEn || settings.hours : settings.hours);

  if (facebookLink) {
    const facebookURL = safeExternalURL(settings.facebook);
    if (facebookURL) {
      facebookLink.href = facebookURL;
      facebookLink.style.display = '';
    } else {
      facebookLink.removeAttribute('href');
      facebookLink.style.display = 'none';
    }
  }
}

// ─── Admin Helpers ───────────────────────────────────────────
function isAdminLoggedIn() {
  return sessionStorage.getItem('admin_logged_in') === 'true';
}

function adminLogout() {
  sessionStorage.removeItem('admin_logged_in');
  window.location.href = 'admin.html';
}

// ─── Intersection Observer for Animations ────────────────────
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions)
  : null;

// ─── Page Boot ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('julimes_language');
  if (savedLang === 'en') {
    toggleLanguage();
  } else {
    renderMenu();
    renderEvents();
    applySettings();
    loadApprovedReviews();
  }

  document.querySelectorAll('section').forEach(section => {
    section.classList.add('animate');
    if (observer) observer.observe(section);
  });
});
