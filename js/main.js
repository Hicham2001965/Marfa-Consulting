/**
 * MARFA CONSULTING - Main JavaScript
 * Professional Business Consulting Website
 * ============================================
 */

// ============================================
// HEADER SCROLL STATE MANAGEMENT
// ============================================

const header = document.getElementById('site-header');
let lastScrollY = 0;

const handleHeaderScroll = () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  lastScrollY = currentScrollY;
};

window.addEventListener('scroll', handleHeaderScroll, { passive: true });

// ============================================
// INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
// ============================================

const revealEls = document.querySelectorAll('.reveal:not(.in)');

const revealOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, revealOptions);

revealEls.forEach((el) => revealObserver.observe(el));

// ============================================
// MOBILE MENU TOGGLE
// ============================================

const menuBtn = document.querySelector('.menu-btn');
const navDesktop = document.querySelector('.nav-desktop');

if (menuBtn && navDesktop) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navDesktop.style.display === 'flex';

    if (isOpen) {
      navDesktop.style.display = 'none';
      menuBtn.setAttribute('aria-expanded', 'false');
    } else {
      navDesktop.style.cssText = `
        display: flex;
        position: fixed;
        top: 70px;
        right: 22px;
        left: 22px;
        background: #141F29;
        flex-direction: column;
        align-items: flex-start;
        padding: 24px;
        gap: 18px;
        border-radius: 2px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        z-index: 99;
      `;

      const nav = navDesktop.querySelector('nav');
      if (nav) {
        nav.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        `;
      }

      menuBtn.setAttribute('aria-expanded', 'true');
    }
  });

  // Close menu when clicking on a link
  const navLinks = navDesktop.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navDesktop.style.display = 'none';
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navDesktop.contains(e.target) && !menuBtn.contains(e.target)) {
      navDesktop.style.display = 'none';
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    if (href === '#' || href === '') {
      return;
    }

    e.preventDefault();

    const target = document.querySelector(href);
    if (target) {
      const headerHeight = header.offsetHeight;
      const targetPosition = target.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// PERFORMANCE MONITORING
// ============================================

if ('PerformanceObserver' in window) {
  try {
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`${entry.name}: ${entry.duration}ms`);
      }
    });

    perfObserver.observe({ entryTypes: ['measure', 'navigation'] });
  } catch (e) {
    console.log('Performance monitoring not available');
  }
}

// ============================================
// LAZY LOADING FOR IMAGES
// ============================================

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;

        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }

        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

document.addEventListener('keydown', (e) => {
  // Close mobile menu on Escape
  if (e.key === 'Escape' && navDesktop && navDesktop.style.display === 'flex') {
    navDesktop.style.display = 'none';
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  // Skip to main content on Alt + M
  if (e.altKey && e.key === 'm') {
    const mainContent = document.querySelector('main, section.hero');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

// Add skip to main content link
const skipLink = document.createElement('a');
skipLink.href = '#main';
skipLink.textContent = 'Skip to main content';
skipLink.style.cssText = `
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
`;

skipLink.addEventListener('focus', () => {
  skipLink.style.top = '0';
});

skipLink.addEventListener('blur', () => {
  skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// ============================================
// ANALYTICS TRACKING (Optional)
// ============================================

function trackEvent(eventName, eventData = {}) {
  if (window.gtag) {
    gtag('event', eventName, eventData);
  }

  // Custom event logging
  console.log(`Event: ${eventName}`, eventData);
}

// Track page view
trackEvent('page_view', {
  page_title: document.title,
  page_location: window.location.href
});

// Track button clicks
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    trackEvent('button_click', {
      button_text: btn.textContent,
      button_class: btn.className
    });
  });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 */
function throttle(func, limit) {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scroll to element smoothly
 */
function scrollToElement(element, offset = 0) {
  const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  });
}

// ============================================
// DOCUMENT READY INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Marfa Consulting website loaded successfully');

  // Initialize any additional features here
  initializeAccessibility();
  initializePerformance();
});

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
  // Ensure all interactive elements are keyboard accessible
  const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');

  interactiveElements.forEach((element) => {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
  });

  // Add focus visible styles
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
}

/**
 * Initialize performance optimizations
 */
function initializePerformance() {
  // Preload critical resources
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap';
  document.head.appendChild(link);

  // Optimize images
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.alt) {
      img.alt = 'Marfa Consulting';
    }
  });
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
  console.error('Error:', event.error);
  // Send error to logging service if available
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Send error to logging service if available
});

// ============================================
// EXPORT FUNCTIONS FOR EXTERNAL USE
// ============================================

window.MarfaConsulting = {
  trackEvent,
  debounce,
  throttle,
  isInViewport,
  scrollToElement
};
