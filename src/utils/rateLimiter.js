// Advanced Rate Limiter with Queue, Exponential Backoff, and Circuit Breaker

class RateLimiter {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.lastRequestTime = 0;
    this.minDelay = 1000; // 1 second between requests (faster for better UX)
    this.retryAttempts = new Map();
    this.maxRetries = 2; // Reduced retries for faster failure
    this.baseBackoff = 2000; // 2 seconds base backoff (reduced)
    
    // Circuit breaker pattern
    this.failureCount = 0;
    this.failureThreshold = 3; // Reduced threshold
    this.circuitBreakerTimeout = 20000; // 20 seconds (reduced)
    this.circuitOpen = false;
    this.circuitOpenTime = 0;
    
    // Performance monitoring
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      queueWaitTimes: [],
    };
  }

  // Add request to queue with priority
  async enqueue(requestFn, priority = 'normal') {
    return new Promise((resolve, reject) => {
      const request = {
        fn: requestFn,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
        retries: 0,
        id: Math.random().toString(36).substr(2, 9),
      };

      // Check circuit breaker
      if (this.circuitOpen) {
        const timeSinceOpen = Date.now() - this.circuitOpenTime;
        if (timeSinceOpen < this.circuitBreakerTimeout) {
          const waitSeconds = Math.ceil((this.circuitBreakerTimeout - timeSinceOpen) / 1000);
          reject(new Error(`Service temporarily unavailable. Please wait ${waitSeconds} seconds.`));
          return;
        } else {
          // Try to close circuit
          this.circuitOpen = false;
          this.failureCount = 0;
        }
      }

      // Priority queue: high priority requests go first
      if (priority === 'high') {
        this.queue.unshift(request);
      } else {
        this.queue.push(request);
      }

      // Show queue position if there are many requests
      if (this.queue.length > 3) {
        const position = this.queue.findIndex(r => r.id === request.id) + 1;
        console.log(`Request queued. Position: ${position}/${this.queue.length}`);
      }

      this.processQueue();
    });
  }

  // Process queue with rate limiting
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      
      // Calculate wait time for metrics
      const waitTime = Date.now() - request.timestamp;
      this.metrics.queueWaitTimes.push(waitTime);
      if (this.metrics.queueWaitTimes.length > 100) {
        this.metrics.queueWaitTimes.shift();
      }
      
      // Calculate delay based on last request
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const delay = Math.max(0, this.minDelay - timeSinceLastRequest);

      if (delay > 0) {
        await this.sleep(delay);
      }

      const startTime = Date.now();
      this.metrics.totalRequests++;

      try {
        this.lastRequestTime = Date.now();
        const result = await request.fn();
        
        // Success metrics
        const responseTime = Date.now() - startTime;
        this.metrics.successfulRequests++;
        this.updateAverageResponseTime(responseTime);
        
        // Reset failure count on success
        this.failureCount = Math.max(0, this.failureCount - 1);
        this.retryAttempts.delete(request.id);
        
        request.resolve(result);
      } catch (error) {
        this.metrics.failedRequests++;
        this.failureCount++;
        
        // Open circuit breaker if too many failures
        if (this.failureCount >= this.failureThreshold) {
          this.circuitOpen = true;
          this.circuitOpenTime = Date.now();
        }
        
        // Handle rate limit errors with exponential backoff
        if (this.isRateLimitError(error)) {
          const retryCount = (this.retryAttempts.get(request.id) || 0) + 1;
          this.retryAttempts.set(request.id, retryCount);

          if (retryCount <= this.maxRetries) {
            const backoffDelay = this.calculateBackoff(retryCount);
            
            // Re-queue with higher priority
            setTimeout(() => {
              request.retries = retryCount;
              this.queue.unshift(request);
              this.processing = false;
              this.processQueue();
            }, backoffDelay);

            continue; // Skip reject, will retry
          }
        }

        request.reject(error);
      }
    }

    this.processing = false;
  }

  // Calculate exponential backoff with jitter
  calculateBackoff(retryCount) {
    const exponentialDelay = this.baseBackoff * Math.pow(2, retryCount - 1);
    const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
    return exponentialDelay + jitter;
  }

  // Check if error is rate limit related
  isRateLimitError(error) {
    const message = error.message?.toLowerCase() || '';
    return (
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('quota') ||
      message.includes('too many requests')
    );
  }

  // Update average response time
  updateAverageResponseTime(newTime) {
    const alpha = 0.2; // Exponential moving average factor
    this.metrics.averageResponseTime = 
      this.metrics.averageResponseTime * (1 - alpha) + newTime * alpha;
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get queue status and metrics
  getStatus() {
    const avgWaitTime = this.metrics.queueWaitTimes.length > 0
      ? this.metrics.queueWaitTimes.reduce((a, b) => a + b, 0) / this.metrics.queueWaitTimes.length
      : 0;
      
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      lastRequestTime: this.lastRequestTime,
      circuitOpen: this.circuitOpen,
      metrics: {
        ...this.metrics,
        averageWaitTime: Math.round(avgWaitTime),
        successRate: this.metrics.totalRequests > 0 
          ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2) + '%'
          : '100%',
      },
    };
  }

  // Clear queue
  clear() {
    this.queue = [];
    this.processing = false;
    this.retryAttempts.clear();
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      queueWaitTimes: [],
    };
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;

// Helper function to wrap API calls
export const withRateLimit = async (apiCall, priority = 'normal') => {
  return rateLimiter.enqueue(apiCall, priority);
};

// Get rate limiter status
export const getRateLimiterStatus = () => {
  return rateLimiter.getStatus();
};
