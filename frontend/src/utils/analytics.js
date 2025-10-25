class Analytics {
  constructor() {
    this.events = [];
    this.startTime = performance.now();
  }

  track(event, properties = {}) {
    const eventData = {
      event,
      properties,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.events.push(eventData);
    console.log('Analytics:', eventData);
  }

  trackPerformance(name, duration) {
    this.track('performance', { name, duration });
  }

  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  getWebVitals() {
    if ('web-vitals' in window) {
      return window.webVitals;
    }
    return null;
  }
}

export const analytics = new Analytics();