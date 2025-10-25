from datetime import datetime
import json
from bson import ObjectId

class AuditService:
    def __init__(self, db):
        self.audit_collection = db['audit_logs']
        self.security_collection = db['security_logs']
    
    def log_user_action(self, user_id, action, details=None, ip_address=None):
        """Log user actions for audit trail"""
        log_entry = {
            'user_id': str(user_id) if user_id else None,
            'action': action,
            'timestamp': datetime.now(),
            'ip_address': ip_address,
            'details': details or {},
            'session_id': self._generate_session_id()
        }
        return self.audit_collection.insert_one(log_entry)
    
    def log_security_event(self, event_type, severity, user_email=None, ip_address=None, details=None):
        """Log security events"""
        log_entry = {
            'event_type': event_type,
            'severity': severity,  # LOW, MEDIUM, HIGH, CRITICAL
            'user_email': user_email,
            'ip_address': ip_address,
            'timestamp': datetime.now(),
            'details': details or {},
            'resolved': False
        }
        return self.security_collection.insert_one(log_entry)
    
    def get_user_activity(self, user_id, limit=50):
        """Get user activity history"""
        return list(self.audit_collection.find(
            {'user_id': str(user_id)},
            {'_id': 0}
        ).sort('timestamp', -1).limit(limit))
    
    def get_security_alerts(self, severity=None, limit=100):
        """Get security alerts"""
        query = {'resolved': False}
        if severity:
            query['severity'] = severity
        
        return list(self.security_collection.find(query).sort('timestamp', -1).limit(limit))
    
    def mark_security_event_resolved(self, event_id):
        """Mark security event as resolved"""
        return self.security_collection.update_one(
            {'_id': ObjectId(event_id)},
            {'$set': {'resolved': True, 'resolved_at': datetime.now()}}
        )
    
    def _generate_session_id(self):
        """Generate unique session ID"""
        import secrets
        return secrets.token_hex(16)
    
    def analyze_suspicious_patterns(self, ip_address=None, user_id=None):
        """Analyze patterns for suspicious activity"""
        pipeline = []
        match_stage = {}
        
        if ip_address:
            match_stage['ip_address'] = ip_address
        if user_id:
            match_stage['user_id'] = str(user_id)
        
        if match_stage:
            pipeline.append({'$match': match_stage})
        
        pipeline.extend([
            {'$group': {
                '_id': {
                    'ip': '$ip_address',
                    'action': '$action'
                },
                'count': {'$sum': 1},
                'last_activity': {'$max': '$timestamp'}
            }},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ])
        
        return list(self.audit_collection.aggregate(pipeline))