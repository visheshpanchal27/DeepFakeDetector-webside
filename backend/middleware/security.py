from functools import wraps
from flask import request, jsonify
import time
from collections import defaultdict
import hashlib

# Global storage for rate limiting and security
rate_limits = defaultdict(list)
blocked_ips = set()
suspicious_activities = defaultdict(int)

def rate_limit(max_requests=10, window=60):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            
            if client_ip in blocked_ips:
                return jsonify({'error': 'IP blocked due to suspicious activity'}), 403
            
            now = time.time()
            # Clean old requests
            rate_limits[client_ip] = [req_time for req_time in rate_limits[client_ip] if now - req_time < window]
            
            if len(rate_limits[client_ip]) >= max_requests:
                suspicious_activities[client_ip] += 1
                if suspicious_activities[client_ip] > 5:
                    blocked_ips.add(client_ip)
                return jsonify({'error': 'Rate limit exceeded'}), 429
            
            rate_limits[client_ip].append(now)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_input_security(data):
    """Advanced input validation for security"""
    dangerous_patterns = [
        '<script', 'javascript:', 'onload=', 'onerror=',
        'DROP TABLE', 'SELECT *', 'UNION SELECT',
        '../', '..\\', '/etc/passwd'
    ]
    
    for key, value in data.items():
        if isinstance(value, str):
            for pattern in dangerous_patterns:
                if pattern.lower() in value.lower():
                    return False, f"Potentially dangerous input detected in {key}"
    
    return True, "Input validation passed"

def generate_csrf_token():
    """Generate CSRF token"""
    import secrets
    return secrets.token_urlsafe(32)

def validate_csrf_token(token, session_token):
    """Validate CSRF token"""
    return token == session_token

def hash_sensitive_data(data):
    """Hash sensitive data for logging"""
    return hashlib.sha256(data.encode()).hexdigest()[:8]