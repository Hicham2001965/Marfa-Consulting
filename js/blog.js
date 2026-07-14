/**
 * MARFA CONSULTING - Blog JavaScript
 * Blog Filtering, Newsletter, and Interactions
 * ============================================
 */

// ============================================
// BLOG FILTERING
// ============================================

const filterBtns = document.querySelectorAll('.filter-btn');
const blogPosts = document.querySelectorAll('.blog-post');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    filterBtns.forEach((b) => b.classList.remove('active'));

    // Add active class to clicked button
    btn.classList.add('active');

    // Get filter value
    const filterValue = btn.getAttribute('data-filter');

    // Filter posts
    blogPosts.forEach((post) => {
      const postCategory = post.getAttribute('data-category');

      if (filterValue === 'all' || postCategory === filterValue) {
        post.style.display = 'block';
        post.style.animation = 'slideUp 0.4s ease';
      } else {
        post.style.display = 'none';
      }
    });

    // Track event
    if (window.MarfaConsulting && window.MarfaConsulting.trackEvent) {
      window.MarfaConsulting.trackEvent('blog_filter', {
        filter: filterValue
      });
    }
  });
});

// ============================================
// NEWSLETTER SUBSCRIPTION
// ============================================

const newsletterForm = document.getElementById('newsletter-form');
const newsletterStatus = document.getElementById('newsletter-status');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = newsletterForm.querySelector('input[type="email"]').value.trim();

    // Validate email
    if (!email || !isValidEmail(email)) {
      newsletterStatus.className = 'newsletter-status error';
      newsletterStatus.textContent = 'البريد الإلكتروني غير صحيح';
      return;
    }

    // Show loading state
    newsletterStatus.className = 'newsletter-status';
    newsletterStatus.textContent = 'جاري الاشتراك...';

    // Simulate subscription (in production, this would call an API)
    setTimeout(() => {
      newsletterStatus.className = 'newsletter-status success';
      newsletterStatus.textContent = 'شكراً! تم اشتراكك بنجاح. سترسل لك أحدث المقالات قريباً.';

      // Reset form
      newsletterForm.reset();

      // Clear message after 5 seconds
      setTimeout(() => {
        newsletterStatus.textContent = '';
        newsletterStatus.className = 'newsletter-status';
      }, 5000);

      // Track event
      if (window.MarfaConsulting && window.MarfaConsulting.trackEvent) {
        window.MarfaConsulting.trackEvent('newsletter_subscription', {
          email: email
        });
      }
    }, 1000);
  });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// PAGINATION
// ============================================

const paginationBtns = document.querySelectorAll('.pagination-btn');

paginationBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    paginationBtns.forEach((b) => b.classList.remove('active'));

    // Add active class to clicked button
    btn.classList.add('active');

    // Scroll to blog grid
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid) {
      blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Track event
    if (window.MarfaConsulting && window.MarfaConsulting.trackEvent) {
      window.MarfaConsulting.trackEvent('blog_pagination', {
        page: btn.textContent
      });
    }
  });
});

// ============================================
// BLOG POST TRACKING
// ============================================

const readMoreLinks = document.querySelectorAll('.read-more');

readMoreLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const postTitle = link.closest('.blog-post').querySelector('h3').textContent;

    if (window.MarfaConsulting && window.MarfaConsulting.trackEvent) {
      window.MarfaConsulting.trackEvent('blog_post_click', {
        post_title: postTitle
      });
    }
  });
});

// ============================================
// MOBILE MENU FOR BLOG
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
// SEARCH FUNCTIONALITY (Future Enhancement)
// ============================================

function searchBlogPosts(query) {
  const searchQuery = query.toLowerCase();

  blogPosts.forEach((post) => {
    const title = post.querySelector('h3').textContent.toLowerCase();
    const content = post.querySelector('p').textContent.toLowerCase();

    if (title.includes(searchQuery) || content.includes(searchQuery)) {
      post.style.display = 'block';
    } else {
      post.style.display = 'none';
    }
  });
}

// ============================================
// SHARE FUNCTIONALITY
// ============================================

function shareBlogPost(title, url) {
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).catch((err) => console.log('Error sharing:', err));
  } else {
    // Fallback: Copy to clipboard
    const text = `${title}\n${url}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('تم نسخ الرابط إلى الحافظة');
    });
  }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.BlogFunctions = {
  searchBlogPosts,
  shareBlogPost,
  isValidEmail
};
