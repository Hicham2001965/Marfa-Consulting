/**
 * MARFA CONSULTING - Analytics & Tracking
 * Google Analytics Integration & Custom Tracking
 * ============================================
 */

// ============================================
// GOOGLE ANALYTICS SETUP
// ============================================

// Google Analytics 4 (GA4) Configuration
window.dataLayer = window.dataLayer || [];

function gtag() {
  dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA4 ID

// ============================================
// CUSTOM ANALYTICS TRACKING
// ============================================

class MarfaAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.pageLoadTime = performance.now();
    this.events = [];
    this.init();
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize analytics
   */
  init() {
    this.trackPageView();
    this.trackUserBehavior();
    this.trackPerformance();
    this.trackErrors();
  }

  /**
   * Track page view
   */
  trackPageView() {
    const pageData = {
      page_title: document.title,
      page_url: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId
    };

    this.sendEvent('page_view', pageData);

    if (window.gtag) {
      gtag('event', 'page_view', {
        page_title: pageData.page_title,
        page_location: pageData.page_url
      });
    }
  }

  /**
   * Track user behavior
   */
  trackUserBehavior() {
    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        const element = e.target;
        const eventData = {
          element_type: element.tagName,
          element_text: element.textContent.substring(0, 100),
          element_class: element.className,
          element_id: element.id,
          timestamp: new Date().toISOString()
        };

        this.sendEvent('element_click', eventData);
      }
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        if (maxScroll % 25 === 0) {
          this.sendEvent('scroll_depth', {
            scroll_percent: Math.round(maxScroll),
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Track time on page
    setInterval(() => {
      const timeOnPage = Math.round((performance.now() - this.pageLoadTime) / 1000);

      if (timeOnPage % 30 === 0) {
        this.sendEvent('time_on_page', {
          seconds: timeOnPage,
          timestamp: new Date().toISOString()
        });
      }
    }, 1000);
  }

  /**
   * Track performance metrics
   */
  trackPerformance() {
    window.addEventListener('load', () => {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

      const performanceData = {
        page_load_time: pageLoadTime,
        dns_time: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp_time: perfData.connectEnd - perfData.connectStart,
        request_time: perfData.responseStart - perfData.requestStart,
        response_time: perfData.responseEnd - perfData.responseStart,
        dom_interactive_time: perfData.domInteractive - perfData.navigationStart,
        dom_complete_time: perfData.domComplete - perfData.navigationStart,
        timestamp: new Date().toISOString()
      };

      this.sendEvent('performance_metrics', performanceData);

      if (window.gtag) {
        gtag('event', 'page_view', {
          page_load_time: pageLoadTime
        });
      }
    });

    // Core Web Vitals
    if ('web-vital' in window) {
      const vitals = window['web-vital'];

      vitals.getCLS((metric) => {
        this.sendEvent('web_vital_cls', {
          value: metric.value,
          rating: metric.rating,
          timestamp: new Date().toISOString()
        });
      });

      vitals.getFID((metric) => {
        this.sendEvent('web_vital_fid', {
          value: metric.value,
          rating: metric.rating,
          timestamp: new Date().toISOString()
        });
      });

      vitals.getLCP((metric) => {
        this.sendEvent('web_vital_lcp', {
          value: metric.value,
          rating: metric.rating,
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  /**
   * Track errors
   */
  trackErrors() {
    window.addEventListener('error', (event) => {
      const errorData = {
        error_message: event.message,
        error_source: event.filename,
        error_line: event.lineno,
        error_column: event.colno,
        error_stack: event.error ? event.error.stack : 'No stack trace',
        timestamp: new Date().toISOString()
      };

      this.sendEvent('javascript_error', errorData);

      if (window.gtag) {
        gtag('event', 'exception', {
          description: event.message
        });
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      const errorData = {
        error_type: 'unhandled_promise_rejection',
        error_reason: event.reason,
        timestamp: new Date().toISOString()
      };

      this.sendEvent('promise_rejection', errorData);
    });
  }

  /**
   * Send event to analytics
   */
  sendEvent(eventName, eventData = {}) {
    const event = {
      event_name: eventName,
      event_data: eventData,
      session_id: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.events.push(event);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }

    // Send to server (implement your own endpoint)
    this.sendToServer(event);
  }

  /**
   * Send event to server
   */
  sendToServer(event) {
    // Use beacon API for reliability
    if (navigator.sendBeacon) {
      const data = JSON.stringify(event);
      navigator.sendBeacon('/api/analytics', data);
    } else {
      // Fallback to fetch
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event),
        keepalive: true
      }).catch((err) => {
        console.warn('Failed to send analytics:', err);
      });
    }
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName, formData) {
    const data = {
      form_name: formName,
      form_fields: Object.keys(formData),
      timestamp: new Date().toISOString()
    };

    this.sendEvent('form_submission', data);

    if (window.gtag) {
      gtag('event', 'generate_lead', {
        value: 1,
        currency: 'USD'
      });
    }
  }

  /**
   * Track conversion
   */
  trackConversion(conversionName, value = 1) {
    const data = {
      conversion_name: conversionName,
      conversion_value: value,
      timestamp: new Date().toISOString()
    };

    this.sendEvent('conversion', data);

    if (window.gtag) {
      gtag('event', 'conversion', {
        conversion_name: conversionName,
        conversion_value: value
      });
    }
  }

  /**
   * Get session data
   */
  getSessionData() {
    return {
      session_id: this.sessionId,
      events_count: this.events.length,
      page_load_time: performance.now() - this.pageLoadTime,
      user_agent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}

// Initialize analytics
const marfaAnalytics = new MarfaAnalytics();

// Export for external use
window.MarfaAnalytics = marfaAnalytics;

// ============================================
// HEATMAP TRACKING (Optional)
// ============================================

class HeatmapTracker {
  constructor() {
    this.heatmapData = [];
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      this.recordClick(e);
    });

    document.addEventListener('mousemove', (e) => {
      this.recordMouseMove(e);
    });
  }

  recordClick(event) {
    const clickData = {
      x: event.clientX,
      y: event.clientY,
      target: event.target.tagName,
      timestamp: new Date().toISOString()
    };

    this.heatmapData.push(clickData);
  }

  recordMouseMove(event) {
    // Throttle mouse move tracking
    if (Math.random() > 0.9) {
      const moveData = {
        x: event.clientX,
        y: event.clientY,
        timestamp: new Date().toISOString()
      };

      this.heatmapData.push(moveData);
    }
  }

  getHeatmapData() {
    return this.heatmapData;
  }
}

// Initialize heatmap tracker
const heatmapTracker = new HeatmapTracker();
window.HeatmapTracker = heatmapTracker;

// ============================================
// USER IDENTIFICATION
// ============================================

function identifyUser(userId, userData = {}) {
  if (window.gtag) {
    gtag('config', 'G-XXXXXXXXXX', {
      'user_id': userId
    });

    gtag('event', 'user_identification', {
      user_id: userId,
      ...userData
    });
  }

  marfaAnalytics.sendEvent('user_identified', {
    user_id: userId,
    user_data: userData,
    timestamp: new Date().toISOString()
  });
}

window.identifyUser = identifyUser;
