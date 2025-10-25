"""
Database index creation for performance optimization
"""

def create_indexes(db):
    """Create indexes for all collections"""
    
    try:
        # Users collection indexes
        db.users.create_index('email', unique=True)
        db.users.create_index('verified')
        db.users.create_index('created_at')
        
        # Analysis collection indexes
        db.analyses.create_index('user_id')
        db.analyses.create_index('timestamp')
        db.analyses.create_index([('user_id', 1), ('timestamp', -1)])
        db.analyses.create_index('file_id')
        
        # OTP collection indexes
        db.otps.create_index('email')
        db.otps.create_index('expires_at', expireAfterSeconds=0)
        db.otps.create_index([('email', 1), ('type', 1)])
        
        # Security logs indexes
        db.security_logs.create_index('email')
        db.security_logs.create_index('ip_address')
        db.security_logs.create_index('timestamp')
        db.security_logs.create_index('event_type')
        
        print("[OK] Database indexes created successfully")
        return True
        
    except Exception as e:
        print(f"[WARN] Index creation error: {e}")
        return False
