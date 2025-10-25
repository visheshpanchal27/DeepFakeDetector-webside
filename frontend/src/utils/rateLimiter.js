class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getRemainingTime() {
    if (this.requests.length < this.maxRequests) {
      return 0;
    }
    
    const oldestRequest = this.requests[0];
    const timeUntilReset = this.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, timeUntilReset);
  }
}

export const analysisRateLimiter = new RateLimiter(5, 60000);
export const authRateLimiter = new RateLimiter(10, 300000);
