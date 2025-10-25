from flask import request
from functools import wraps
import gzip
import io
from flask_compress import Compress

# Flask-Compress instance
compress = Compress()

def compress_response(f):
    """Compress response if client accepts gzip"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = f(*args, **kwargs)
        
        # Check if client accepts gzip
        accept_encoding = request.headers.get('Accept-Encoding', '')
        
        if 'gzip' not in accept_encoding.lower():
            return response
        
        # Only compress if response is large enough
        if hasattr(response, 'data') and len(response.data) > 1024:
            gzip_buffer = io.BytesIO()
            with gzip.GzipFile(mode='wb', fileobj=gzip_buffer) as gzip_file:
                gzip_file.write(response.data)
            
            response.data = gzip_buffer.getvalue()
            response.headers['Content-Encoding'] = 'gzip'
            response.headers['Content-Length'] = len(response.data)
        
        return response
    
    return decorated_function
