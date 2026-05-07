// Julimes Bar - Main JavaScript

// ─── Language Toggle ─────────────────────────────────────────
let currentLanguage = 'es';

function toggleLanguage() {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
    
    // Update all elements with data-es and data-en attributes
    document.querySelectorAll('[data-es][data-en]').forEach(el => {
        // For elements with child elements (like paragraphs with <strong>), preserve HTML
        if (el.querySelector('strong, br, a, span')) {
            el.innerHTML = el.getAttribute(`data-${currentLanguage}`);
        } else {
            el.textContent = el.getAttribute(`data-${currentLanguage}`);
        }
    });
    
    // Update language indicator
    const langIndicator = document.getElementById('current-lang');
    if (langIndicator) {
        langIndicator.textContent = currentLanguage.toUpperCase();
    }
    
    // Update html lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Save preference
    localStorage.setItem('julimes_language', currentLanguage);
}

// Load saved language preference
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('julimes_language');
    if (savedLang && savedLang !== 'es') {
        currentLanguage = 'es'; // Start with ES, then toggle to saved
        toggleLanguage();
    }
});

// ─── Mobile Navigation ───────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

// ─── Smooth Scroll ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ─── Navbar Scroll Effect ────────────────────────────────────
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    navbar.style.background = 'rgba(15, 15, 15, 0.98)';
    navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
  } else {
    navbar.style.background = 'rgba(15, 15, 15, 0.95)';
    navbar.style.boxShadow = 'none';
  }
  
  lastScroll = currentScroll;
});

// ─── Review System ───────────────────────────────────────────
const REVIEWS_KEY = 'julimes_reviews';
const PENDING_KEY = 'julimes_pending_reviews';

// Load approved reviews
function loadApprovedReviews() {
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  const container = document.getElementById('approved-reviews');
  
  if (!container) return;
  
  if (reviews.length === 0) {
    const emptyText = currentLanguage === 'es' 
      ? '"Sé el primero en dejar una reseña. Tu opinión nos ayuda a crecer."'
      : '"Be the first to leave a review. Your opinion helps us grow."';
    
    container.innerHTML = `
      <div class="review-card">
        <div class="review-stars">⭐⭐⭐⭐⭐</div>
        <p class="review-text">${emptyText}</p>
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
      <div class="review-stars">${'⭐'.repeat(review.rating)}</div>
      <p class="review-text">"${review.text}"</p>
      <div class="review-author">
        <span>${review.name}</span>
        <span class="review-date">${review.date}</span>
      </div>
    </div>
  `).join('');
}

// Submit review
const reviewForm = document.getElementById('review-form');
if (reviewForm) {
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reviewer-name').value;
    const text = document.getElementById('review-text').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;
    
    const review = {
      id: Date.now(),
      name,
      text,
      rating: parseInt(rating),
      date: new Date().toLocaleDateString(currentLanguage === 'es' ? 'es-MX' : 'en-US'),
      status: 'pending'
    };
    
    // Save to pending
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    pending.push(review);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    
    // Show confirmation
    const confirmMsg = currentLanguage === 'es' 
      ? '¡Gracias por tu reseña! Será revisada antes de publicarse.'
      : 'Thank you for your review! It will be checked before publishing.';
    alert(confirmMsg);
    reviewForm.reset();
  });
}

// ─── Admin Functions ─────────────────────────────────────────
function isAdminLoggedIn() {
  return sessionStorage.getItem('admin_logged_in') === 'true';
}

function adminLogin(password) {
  // Default password: change this!
  const ADMIN_PASSWORD = 'julimes2024';
  
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('admin_logged_in', 'true');
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem('admin_logged_in');
  window.location.href = 'admin.html';
}

// ─── Load Reviews on Page Load ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadApprovedReviews();
});

// ─── Intersection Observer for Animations ────────────────────
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe sections for fade-in
document.querySelectorAll('section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});