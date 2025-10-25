import time
from functools import wraps
from flask import request, g
from utils.logger import logger

def monitor_performance(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        g.start_time = time.time()
        
        result = f(*args, **kwargs)
        
        duration = time.time() - g.start_time
        
        logger.info(f"Request: {request.method} {request.path} - Duration: {duration:.3f}s")
        
        if duration > 5.0:
            logger.warning(f"Slow request detected: {request.method} {request.path} - {duration:.3f}s")
        
        return result
    return wrapper

def track_request_metrics():
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            start = time.time()
            result = f(*args, **kwargs)
            duration = time.time() - start
            
            metrics = {
                'endpoint': request.endpoint,
                'method': request.method,
                'duration': duration,
                'status': result[1] if isinstance(result, tuple) else 200
            }
            
            logger.info(f"Metrics: {metrics}")
            return result
        return wrapper
    return decorator
