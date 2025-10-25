import re
from functools import wraps
from flask import request, jsonify

def sanitize_string(value):
    if not isinstance(value, str):
        return value
    return re.sub(r'[<>\"\'&]', '', value).strip()

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_request(*required_fields):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = request.get_json() if request.is_json else request.form.to_dict()
            
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({'error': f'{field} is required'}), 400
                
                if isinstance(data[field], str):
                    data[field] = sanitize_string(data[field])
            
            if 'email' in data:
                if not validate_email(data['email']):
                    return jsonify({'error': 'Invalid email format'}), 400
            
            request.validated_data = data
            return f(*args, **kwargs)
        return wrapper
    return decorator
