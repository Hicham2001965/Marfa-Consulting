/**
 * MARFA CONSULTING - Form Handler
 * Booking Form Management & Validation
 * ============================================
 */

const form = document.getElementById('booking-form');
const statusBox = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

// Email configuration
const BOOKING_EMAIL = 'atertourhich@gmail.com';

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic)
 */
function isValidPhone(phone) {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 8;
}

/**
 * Validate form fields
 */
function validateForm(formData) {
  const errors = [];

  // Name validation
  if (!formData.name || formData.name.trim().length < 2) {
    errors.push('الاسم يجب أن يكون على الأقل حرفين');
  }

  // Email validation
  if (!formData.email || !isValidEmail(formData.email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }

  // Message validation
  if (!formData.message || formData.message.trim().length < 10) {
    errors.push('نبذة الطلب يجب أن تكون على الأقل 10 أحرف');
  }

  // Phone validation (if provided)
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.push('رقم الهاتف غير صحيح');
  }

  return errors;
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Clear previous status
    statusBox.className = 'form-status';
    statusBox.textContent = '';

    // Get form data
    const name = form.querySelector('#f-name').value.trim();
    const email = form.querySelector('#f-email').value.trim();
    const phone = form.querySelector('#f-phone').value.trim();
    const company = form.querySelector('#f-company').value.trim();
    const message = form.querySelector('#f-message').value.trim();

    // Validate form
    const errors = validateForm({ name, email, phone, message });

    if (errors.length > 0) {
      statusBox.className = 'form-status err';
      statusBox.textContent = errors.join(' • ');
      return;
    }

    // Show sending status
    statusBox.className = 'form-status sending';
    statusBox.textContent = 'جاري إرسال الطلب...';
    submitBtn.disabled = true;

    // Prepare email content
    const subject = `طلب حجز جلسة تقييم أولية — ${name}`;
    const bodyLines = [
      `الاسم: ${name}`,
      `البريد الإلكتروني: ${email}`,
      phone ? `الهاتف: ${phone}` : null,
      company ? `الشركة: ${company}` : null,
      '',
      'نبذة عن الطلب:',
      message,
      '',
      '---',
      `تاريخ الإرسال: ${new Date().toLocaleString('ar-SA')}`,
      'من موقع: مرفأ للاستشارات'
    ].filter(Boolean);

    const mailtoUrl =
      'mailto:' +
      BOOKING_EMAIL +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(bodyLines.join('\n'));

    // Log the submission (for analytics)
    logFormSubmission({
      name,
      email,
      phone,
      company,
      messageLength: message.length,
      timestamp: new Date().toISOString()
    });

    // Show success message
    statusBox.className = 'form-status ok';
    statusBox.textContent =
      'جاري فتح تطبيق البريد ديالك معبّى بالمعلومات — غير ضغط "إرسال" من هناك لإتمام الطلب.';

    // Reset form
    form.reset();
    submitBtn.disabled = false;

    // Try multiple methods to send the email
    setTimeout(() => {
      // Method 1: Try mailto first
      window.location.href = mailtoUrl;
      
      // Method 2: Fallback - Try to send via API if mailto fails
      setTimeout(() => {
        sendEmailViaAPI({
          name,
          email,
          phone,
          company,
          message
        });
      }, 2000);
    }, 500);

    // Clear status message after 5 seconds
    setTimeout(() => {
      if (statusBox.classList.contains('ok')) {
        statusBox.textContent = '';
        statusBox.className = 'form-status';
      }
    }, 5000);
  });
}

// ============================================
// FORM FIELD ENHANCEMENTS
// ============================================

// Add real-time validation feedback
const formFields = document.querySelectorAll('.field input, .field textarea');

formFields.forEach((field) => {
  field.addEventListener('blur', () => {
    validateField(field);
  });

  field.addEventListener('focus', () => {
    field.classList.remove('error');
  });
});

/**
 * Validate individual field
 */
function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;

  switch (fieldName) {
    case 'name':
      isValid = value.length >= 2;
      break;
    case 'email':
      isValid = isValidEmail(value);
      break;
    case 'phone':
      isValid = !value || isValidPhone(value);
      break;
    case 'message':
      isValid = value.length >= 10;
      break;
    default:
      isValid = true;
  }

  if (!isValid) {
    field.classList.add('error');
  } else {
    field.classList.remove('error');
  }

  return isValid;
}

// ============================================
// CHARACTER COUNTER FOR TEXTAREA
// ============================================

const messageField = document.querySelector('#f-message');

if (messageField) {
  // Create character counter
  const counter = document.createElement('div');
  counter.className = 'char-counter';
  counter.style.cssText = `
    font-size: 12px;
    color: #6E6A5F;
    margin-top: 6px;
    text-align: right;
  `;
  messageField.parentNode.appendChild(counter);

  messageField.addEventListener('input', () => {
    const count = messageField.value.length;
    const maxLength = 1000;

    counter.textContent = `${count} / ${maxLength} حرف`;

    if (count > maxLength) {
      messageField.value = messageField.value.substring(0, maxLength);
      counter.textContent = `${maxLength} / ${maxLength} حرف (الحد الأقصى)`;
    }
  });

  // Initialize counter
  counter.textContent = `0 / 1000 حرف`;
}

// ============================================
// AUTO-SAVE FORM DATA
// ============================================

const AUTO_SAVE_KEY = 'marfa_form_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds

let autoSaveTimeout;

if (form) {
  // Load saved data on page load
  loadFormDraft();

  // Auto-save form data
  form.addEventListener('input', () => {
    clearTimeout(autoSaveTimeout);

    autoSaveTimeout = setTimeout(() => {
      saveFormDraft();
    }, AUTO_SAVE_DELAY);
  });

  // Clear saved data on successful submission
  form.addEventListener('submit', () => {
    localStorage.removeItem(AUTO_SAVE_KEY);
  });
}

/**
 * Save form data to localStorage
 */
function saveFormDraft() {
  const formData = {
    name: form.querySelector('#f-name').value,
    email: form.querySelector('#f-email').value,
    phone: form.querySelector('#f-phone').value,
    company: form.querySelector('#f-company').value,
    message: form.querySelector('#f-message').value,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(formData));
  } catch (e) {
    console.warn('Could not save form draft:', e);
  }
}

/**
 * Load form data from localStorage
 */
function loadFormDraft() {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);

    if (saved) {
      const formData = JSON.parse(saved);
      const savedTime = new Date(formData.savedAt);
      const now = new Date();
      const hoursDiff = (now - savedTime) / (1000 * 60 * 60);

      // Only restore if saved less than 24 hours ago
      if (hoursDiff < 24) {
        form.querySelector('#f-name').value = formData.name || '';
        form.querySelector('#f-email').value = formData.email || '';
        form.querySelector('#f-phone').value = formData.phone || '';
        form.querySelector('#f-company').value = formData.company || '';
        form.querySelector('#f-message').value = formData.message || '';

        // Show notification about restored data
        console.log('Form data restored from draft');
      } else {
        localStorage.removeItem(AUTO_SAVE_KEY);
      }
    }
  } catch (e) {
    console.warn('Could not load form draft:', e);
  }
}

// ============================================
// FORM ANALYTICS
// ============================================

/**
 * Log form submission for analytics
 */
function logFormSubmission(data) {
  // Send to analytics service
  if (window.MarfaConsulting && window.MarfaConsulting.trackEvent) {
    window.MarfaConsulting.trackEvent('form_submission', {
      form_name: 'booking_form',
      has_phone: !!data.phone,
      has_company: !!data.company,
      message_length: data.messageLength,
      timestamp: data.timestamp
    });
  }

  console.log('Form submission logged:', data);
}

// ============================================
// FORM ACCESSIBILITY
// ============================================

// Add ARIA labels and descriptions
const formFields2 = document.querySelectorAll('.field');

formFields2.forEach((field) => {
  const label = field.querySelector('label');
  const input = field.querySelector('input, textarea');

  if (label && input) {
    const labelId = `label-${input.id}`;
    label.id = labelId;
    input.setAttribute('aria-labelledby', labelId);

    // Add description for optional fields
    if (input.hasAttribute('required') === false && input.name !== 'phone' && input.name !== 'company') {
      const description = document.createElement('span');
      description.className = 'field-description';
      description.textContent = '(اختياري)';
      description.style.cssText = `
        font-size: 12px;
        color: #6E6A5F;
        margin-right: 4px;
      `;
      label.appendChild(description);
    }
  }
});

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('form.js')) {
    console.error('Form script error:', event.error);
    statusBox.className = 'form-status err';
    statusBox.textContent = 'حدث خطأ في معالجة النموذج. يرجى المحاولة لاحقاً.';
  }
});

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Send email via API (Fallback method)
 */
function sendEmailViaAPI(data) {
  const emailData = {
    to: BOOKING_EMAIL,
    from: data.email,
    name: data.name,
    subject: `طلب حجز جلسة تقييم أولية — ${data.name}`,
    message: `
الاسم: ${data.name}
البريد الإلكتروني: ${data.email}
${data.phone ? `الهاتف: ${data.phone}` : ''}
${data.company ? `الشركة: ${data.company}` : ''}

نبذة عن الطلب:
${data.message}

---
تاريخ الإرسال: ${new Date().toLocaleString('ar-SA')}
من موقع: مرفأ للاستشارات
    `
  };

  // Try to send via FormSubmit (free service)
  fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  }).catch(() => {
    // If API fails, show alternative contact method
    console.warn('Email API failed, showing alternative contact method');
    showAlternativeContact();
  });
}

/**
 * Show alternative contact method if email fails
 */
function showAlternativeContact() {
  const altMessage = document.createElement('div');
  altMessage.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fff;
    border: 2px solid #A9824C;
    border-radius: 4px;
    padding: 20px;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 10000;
    direction: rtl;
    text-align: right;
  `;
  
  altMessage.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #141F29;">تم حفظ طلبك بنجاح</h3>
    <p style="margin: 0 0 15px 0; color: #6E6A5F; font-size: 14px;">
      إذا لم تتمكن من إرسال البريد تلقائياً، يمكنك نسخ البيانات أدناه وإرسالها مباشرة إلى:
    </p>
    <div style="background: #F6F2EA; padding: 10px; border-radius: 2px; margin-bottom: 15px; font-size: 14px; word-break: break-all;">
      <strong>البريد:</strong> atertourhich@gmail.com
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: #A9824C;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 2px;
      cursor: pointer;
      font-family: inherit;
    ">حسناً، فهمت</button>
  `;
  
  document.body.appendChild(altMessage);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (altMessage.parentElement) {
      altMessage.remove();
    }
  }, 10000);
}

window.MarfaForm = {
  validateForm,
  validateField,
  isValidEmail,
  isValidPhone,
  saveFormDraft,
  loadFormDraft,
  logFormSubmission,
  sendEmailViaAPI,
  showAlternativeContact
};
