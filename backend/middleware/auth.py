import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from bson import ObjectId
import os

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-this')

def generate_token(user_id, email):
    """Generate JWT token for user"""
    payload = {
        'user_id': str(user_id),
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def token_required(db_param=None):
    """Decorator to require valid JWT token"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'error': 'Token is missing'}), 401
            
            try:
                # Remove 'Bearer ' prefix if present
                if token.startswith('Bearer '):
                    token = token[7:]
                
                print(f"[DEBUG] Decoding token: {token[:20]}...")
                data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                print(f"[DEBUG] Token decoded successfully")
                print(f"[DEBUG] User ID: {data.get('user_id')}")
                print(f"[DEBUG] Email: {data.get('email')}")
                
                # Get database
                database = db_param
                if database is None:
                    from flask import current_app
                    database = getattr(current_app, 'db', None)
                
                print(f"[DEBUG] Database available: {database is not None}")
                
                if database is None:
                    return jsonify({'error': 'Database not available'}), 500
                
                user_id = ObjectId(data['user_id'])
                print(f"[DEBUG] Looking for user with ID: {user_id}")
                
                current_user = database['users'].find_one({'_id': user_id})
                
                if not current_user:
                    print(f"[ERROR] User not found in database")
                    return jsonify({'error': 'User not found'}), 401
                
                print(f"[DEBUG] User found: {current_user.get('email')}")
                    
            except jwt.ExpiredSignatureError:
                print(f"[ERROR] Token expired")
                return jsonify({'error': 'Token has expired'}), 401
            except jwt.InvalidTokenError as e:
                print(f"[ERROR] Invalid token: {e}")
                return jsonify({'error': 'Invalid token'}), 401
            except Exception as e:
                print(f"[ERROR] Token validation failed: {str(e)}")
                import traceback
                traceback.print_exc()
                return jsonify({'error': f'Token validation failed: {str(e)}'}), 401
                
            return f(current_user, *args, **kwargs)
        return decorated
    
    # Support both @token_required and @token_required(db) syntax
    if callable(db_param):
        # Called as @token_required (without parentheses)
        func = db_param
        db_param = None
        return decorator(func)
    else:
        # Called as @token_required(db) (with parentheses)
        return decorator