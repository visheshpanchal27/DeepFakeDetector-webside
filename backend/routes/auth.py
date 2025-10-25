from flask import Blueprint, request, jsonify
import bcrypt
import re
import time
from datetime import datetime, timedelta
from models.user import User
from models.otp import OTP
from services.email_service import EmailService
from middleware.auth import generate_token, token_required
from middleware.rate_limiter import rate_limit
from collections import defaultdict

def create_auth_routes(db):
    auth_bp = Blueprint('auth', __name__)
    user_model = User(db)
    otp_model = OTP(db)
    email_service = EmailService()
    
    # Rate limiting storage
    rate_limits = defaultdict(list)
    failed_attempts = defaultdict(int)
    
    def check_rate_limit(ip, limit=5, window=300):
        now = time.time()
        rate_limits[ip] = [req_time for req_time in rate_limits[ip] if now - req_time < window]
        if len(rate_limits[ip]) >= limit:
            return False
        rate_limits[ip].append(now)
        return True
    
    def validate_password_strength(password):
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain lowercase letter"
        if not re.search(r'\d', password):
            return False, "Password must contain number"
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "Password must contain special character"
        return True, "Password is strong"
    
    def validate_email_domain(email):
        blocked_domains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com']
        domain = email.split('@')[1].lower()
        return domain not in blocked_domains
    
    def log_security_event(event_type, email, ip, details=None):
        security_log = db['security_logs']
        security_log.insert_one({
            'event_type': event_type,
            'email': email,
            'ip_address': ip,
            'timestamp': datetime.now(),
            'details': details or {}
        })
    
    @auth_bp.route('/register', methods=['POST'])
    def register():
        try:
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            
            # Rate limiting
            if not check_rate_limit(client_ip, limit=3, window=300):
                log_security_event('RATE_LIMIT_EXCEEDED', '', client_ip)
                return jsonify({'error': 'Too many registration attempts. Try again later.'}), 429
            
            data = request.get_json()
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            # Advanced validation
            if not name or len(name) < 2 or len(name) > 100:
                return jsonify({'error': 'Name must be 2-100 characters'}), 400
            
            if not email or '@' not in email:
                return jsonify({'error': 'Invalid email format'}), 400
            
            if not validate_email_domain(email):
                log_security_event('BLOCKED_EMAIL_DOMAIN', email, client_ip)
                return jsonify({'error': 'Email domain not allowed'}), 400
            
            # Password strength validation
            is_strong, password_msg = validate_password_strength(password)
            if not is_strong:
                return jsonify({'error': password_msg}), 400
            
            # Check if user exists
            existing_user = user_model.find_by_email(email)
            if existing_user:
                log_security_event('DUPLICATE_REGISTRATION', email, client_ip)
                return jsonify({'error': 'Email already registered'}), 409
            
            # Create user with additional security fields
            result = user_model.create_advanced(name, email, password, {
                'display_name': name,
                'registration_ip': client_ip,
                'registration_date': datetime.now(),
                'account_status': 'pending_verification',
                'login_attempts': 0,
                'last_login': None
            })
            
            # Generate and send OTP
            otp = otp_model.create(email, 'verification')
            
            # Log successful registration
            log_security_event('USER_REGISTERED', email, client_ip, {
                'user_id': str(result.inserted_id),
                'name': name
            })
            
            if email_service.send_verification_email(email, otp):
                return jsonify({
                    'message': 'Registration successful. Check email for OTP.',
                    'email_sent': True
                })
            else:
                log_security_event('EMAIL_SEND_FAILED', email, client_ip)
                return jsonify({'error': 'Failed to send verification email'}), 500
                
        except Exception as e:
            log_security_event('REGISTRATION_ERROR', email if 'email' in locals() else '', client_ip, {
                'error': str(e)
            })
            print(f"Registration error: {e}")
            return jsonify({'error': 'Registration failed'}), 500
    
    @auth_bp.route('/verify-otp', methods=['POST'])
    def verify_otp():
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            otp = data.get('otp', '').strip()
            
            if not email or not otp:
                return jsonify({'error': 'Email and OTP required'}), 400
            
            if otp_model.verify(email, otp, 'verification'):
                user_model.verify_email(email)
                user = user_model.find_by_email(email)
                token = generate_token(user['_id'], user['email'])
                
                return jsonify({
                    'message': 'Email verified successfully',
                    'token': token,
                    'user': {
                        'id': str(user['_id']),
                        'name': user['name'],
                        'email': user['email'],
                        'display_name': user.get('display_name', '')
                    }
                })
            else:
                return jsonify({'error': 'Invalid or expired OTP'}), 400
                
        except Exception as e:
            print(f"Verify OTP error: {e}")
            return jsonify({'error': 'Verification failed'}), 500
    
    @auth_bp.route('/login', methods=['POST'])
    @rate_limit(limit=5, window=300)
    def login():
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            if not email or not password:
                return jsonify({'error': 'Email and password required'}), 400
            
            user = user_model.find_by_email(email)
            if not user:
                return jsonify({'error': 'Invalid credentials'}), 401
            
            if not user.get('verified', False):
                return jsonify({'error': 'Please verify your email first'}), 401
            
            # Password is stored as string, convert to bytes for bcrypt
            stored_password = user['password']
            if isinstance(stored_password, str):
                stored_password = stored_password.encode('utf-8')
            
            if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
                return jsonify({'error': 'Invalid credentials'}), 401
            
            # Update last login
            user_model.collection.update_one(
                {'_id': user['_id']},
                {'$set': {'last_login': datetime.now()}}
            )
            
            token = generate_token(user['_id'], user['email'])
            
            return jsonify({
                'token': token,
                'user': {
                    'id': str(user['_id']),
                    'name': user['name'],
                    'email': user['email'],
                    'display_name': user.get('display_name', '')
                }
            })
            
        except Exception as e:
            print(f"Login error: {e}")
            return jsonify({'error': 'Login failed'}), 500
    
    @auth_bp.route('/forgot-password', methods=['POST'])
    @rate_limit(limit=3, window=600)
    def forgot_password():
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            
            if not email:
                return jsonify({'error': 'Email required'}), 400
            
            user = user_model.find_by_email(email)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            otp = otp_model.create(email, 'password_reset')
            
            if email_service.send_password_reset_email(email, otp):
                return jsonify({'message': 'Password reset OTP sent'})
            else:
                return jsonify({'error': 'Failed to send reset email'}), 500
                
        except Exception as e:
            print(f"Forgot password error: {e}")
            return jsonify({'error': 'Request failed'}), 500
    
    @auth_bp.route('/reset-password', methods=['POST'])
    @rate_limit(limit=3, window=300)
    def reset_password():
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            otp = data.get('otp', '').strip()
            password = data.get('password', '')
            
            if not email or not otp or not password:
                return jsonify({'error': 'All fields required'}), 400
            
            if len(password) < 8:
                return jsonify({'error': 'Password must be at least 8 characters'}), 400
            
            if otp_model.verify(email, otp, 'password_reset'):
                user_model.update_password(email, password)
                return jsonify({'message': 'Password reset successfully'})
            else:
                return jsonify({'error': 'Invalid or expired OTP'}), 400
                
        except Exception as e:
            print(f"Reset password error: {e}")
            return jsonify({'error': 'Password reset failed'}), 500
    
    @auth_bp.route('/change-password', methods=['POST'])
    @token_required(db)
    def change_password(current_user):
        try:
            data = request.get_json()
            current_password = data.get('current_password', '')
            new_password = data.get('new_password', '')
            
            if not current_password or not new_password:
                return jsonify({'error': 'All fields required'}), 400
            
            user = user_model.find_by_id(current_user['_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if not bcrypt.checkpw(current_password.encode('utf-8'), user['password']):
                return jsonify({'error': 'Current password is incorrect'}), 401
            
            is_strong, password_msg = validate_password_strength(new_password)
            if not is_strong:
                return jsonify({'error': password_msg}), 400
            
            user_model.update_password(user['email'], new_password)
            
            return jsonify({'message': 'Password changed successfully'})
            
        except Exception as e:
            print(f"Change password error: {e}")
            return jsonify({'error': 'Failed to change password'}), 500
    
    @auth_bp.route('/update-profile', methods=['PUT'])
    @token_required(db)
    def update_profile(current_user):
        try:
            data = request.get_json()
            display_name = data.get('display_name', '').strip()
            
            if not display_name or len(display_name) < 2 or len(display_name) > 50:
                return jsonify({'error': 'Display name must be 2-50 characters'}), 400
            
            user_model.update_profile(current_user['_id'], {'display_name': display_name})
            
            updated_user = user_model.find_by_id(current_user['_id'])
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': {
                    'id': str(updated_user['_id']),
                    'name': updated_user['name'],
                    'email': updated_user['email'],
                    'display_name': updated_user.get('display_name', '')
                }
            })
            
        except Exception as e:
            print(f"Update profile error: {e}")
            return jsonify({'error': 'Failed to update profile'}), 500
    
    @auth_bp.route('/delete-account', methods=['DELETE'])
    @token_required(db)
    def delete_account(current_user):
        try:
            user_id = current_user['_id']
            
            # Delete user's analyses first
            from models.analysis import Analysis
            analysis_model = Analysis(db)
            analysis_model.delete_by_user_id(user_id)
            
            # Delete user
            user_model.delete_by_id(user_id)
            
            return jsonify({'message': 'Account deleted successfully'})
            
        except Exception as e:
            print(f"Delete account error: {e}")
            return jsonify({'error': 'Failed to delete account'}), 500
    
    return auth_bp