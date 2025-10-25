class RequestQueue {
  constructor() {
    this.queue = new Map();
    this.pending = new Set();
  }

  async request(key, requestFn) {
    if (this.pending.has(key)) {
      return this.queue.get(key);
    }

    if (this.queue.has(key)) {
      const cached = this.queue.get(key);
      if (Date.now() - cached.timestamp < 30000) {
        return cached.data;
      }
    }

    this.pending.add(key);
    
    try {
      const data = await requestFn();
      this.queue.set(key, { data, timestamp: Date.now() });
      return data;
    } finally {
      this.pending.delete(key);
    }
  }

  invalidate(key) {
    this.queue.delete(key);
  }

  clear() {
    this.queue.clear();
    this.pending.clear();
  }
}

export const requestQueue = new RequestQueue();