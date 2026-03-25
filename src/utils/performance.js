// Performance Monitoring and Optimization Utilities

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
      apiCalls: [],
      componentRenders: new Map(),
    };
    
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Measure page load time
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        this.metrics.pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
      }
    });

    // Observe Web Vitals
    this.observeWebVitals();
    
    this.initialized = true;
  }

  observeWebVitals() {
    // First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    
    try {
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Paint timing not supported
    }

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
      }
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cumulativeLayoutShift = clsValue;
        }
      }
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }
  }

  // Track API call performance
  trackAPICall(endpoint, duration, success = true) {
    this.metrics.apiCalls.push({
      endpoint,
      duration,
      success,
      timestamp: Date.now(),
    });

    // Keep only last 100 API calls
    if (this.metrics.apiCalls.length > 100) {
      this.metrics.apiCalls.shift();
    }
  }

  // Track component render time
  trackComponentRender(componentName, duration) {
    if (!this.metrics.componentRenders.has(componentName)) {
      this.metrics.componentRenders.set(componentName, []);
    }
    
    const renders = this.metrics.componentRenders.get(componentName);
    renders.push({ duration, timestamp: Date.now() });
    
    // Keep only last 50 renders per component
    if (renders.length > 50) {
      renders.shift();
    }
  }

  // Get performance report
  getReport() {
    const apiCallStats = this.getAPICallStats();
    const componentStats = this.getComponentStats();
    
    return {
      webVitals: {
        pageLoadTime: Math.round(this.metrics.pageLoadTime),
        firstContentfulPaint: Math.round(this.metrics.firstContentfulPaint),
        largestContentfulPaint: Math.round(this.metrics.largestContentfulPaint),
        firstInputDelay: Math.round(this.metrics.firstInputDelay),
        cumulativeLayoutShift: this.metrics.cumulativeLayoutShift.toFixed(3),
        // Performance scores (Google Lighthouse thresholds)
        scores: {
          fcp: this.scoreMetric(this.metrics.firstContentfulPaint, 1800, 3000),
          lcp: this.scoreMetric(this.metrics.largestContentfulPaint, 2500, 4000),
          fid: this.scoreMetric(this.metrics.firstInputDelay, 100, 300),
          cls: this.scoreMetric(this.metrics.cumulativeLayoutShift, 0.1, 0.25, true),
        },
      },
      apiCalls: apiCallStats,
      components: componentStats,
    };
  }

  // Score metric based on thresholds
  scoreMetric(value, good, needsImprovement, inverse = false) {
    if (inverse) {
      if (value <= good) return 'good';
      if (value <= needsImprovement) return 'needs-improvement';
      return 'poor';
    } else {
      if (value <= good) return 'good';
      if (value <= needsImprovement) return 'needs-improvement';
      return 'poor';
    }
  }

  // Get API call statistics
  getAPICallStats() {
    if (this.metrics.apiCalls.length === 0) {
      return { count: 0, averageDuration: 0, successRate: 100 };
    }

    const totalDuration = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    const successCount = this.metrics.apiCalls.filter(call => call.success).length;

    return {
      count: this.metrics.apiCalls.length,
      averageDuration: Math.round(totalDuration / this.metrics.apiCalls.length),
      successRate: ((successCount / this.metrics.apiCalls.length) * 100).toFixed(2) + '%',
      recentCalls: this.metrics.apiCalls.slice(-10),
    };
  }

  // Get component render statistics
  getComponentStats() {
    const stats = {};
    
    this.metrics.componentRenders.forEach((renders, componentName) => {
      const totalDuration = renders.reduce((sum, r) => sum + r.duration, 0);
      stats[componentName] = {
        renderCount: renders.length,
        averageDuration: Math.round(totalDuration / renders.length),
        lastRender: renders[renders.length - 1]?.timestamp || 0,
      };
    });

    return stats;
  }

  // Clear metrics
  clear() {
    this.metrics.apiCalls = [];
    this.metrics.componentRenders.clear();
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;

// Helper functions
export const trackAPI = (endpoint, duration, success) => 
  performanceMonitor.trackAPICall(endpoint, duration, success);

export const trackRender = (componentName, duration) => 
  performanceMonitor.trackComponentRender(componentName, duration);

export const getPerformanceReport = () => 
  performanceMonitor.getReport();

// Image optimization helper
export const optimizeImage = async (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// Debounce helper for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle helper for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Lazy load images
export const lazyLoadImage = (imgElement) => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    imageObserver.observe(imgElement);
  } else {
    // Fallback for browsers without IntersectionObserver
    imgElement.src = imgElement.dataset.src;
  }
};
