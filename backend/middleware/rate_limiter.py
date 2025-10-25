from functools import wraps
from flask import request, jsonify
from collections import defaultdict
import time
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Flask-Limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
        self.blocked = defaultdict(int)
    
    def is_rate_limited(self, key, limit=5, window=60):
        now = time.time()
        
        # Check if blocked
        if key in self.blocked and self.blocked[key] > now:
            return True
        
        # Clean old requests
        self.requests[key] = [req_time for req_time in self.requests[key] 
                             if now - req_time < window]
        
        # Check limit
        if len(self.requests[key]) >= limit:
            self.blocked[key] = now + window * 2
            return True
        
        self.requests[key].append(now)
        return False

# Legacy rate limiter
rate_limiter = RateLimiter()

def rate_limit(limit=5, window=60):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            key = f"{ip}:{request.endpoint}"
            
            if rate_limiter.is_rate_limited(key, limit, window):
                return jsonify({'error': 'Too many requests. Please try again later.'}), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
