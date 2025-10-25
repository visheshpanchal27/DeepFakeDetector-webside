from pymongo import MongoClient
from datetime import datetime, timedelta
import random

class OTP:
    def __init__(self, db):
        self.collection = db['otps']
    
    def generate_otp(self):
        return str(random.randint(100000, 999999))
    
    def create(self, email, otp_type='verification', expires_in_minutes=10):
        otp = self.generate_otp()
        otp_data = {
            'email': email.lower(),
            'otp': otp,
            'type': otp_type,
            'expires_at': datetime.now() + timedelta(minutes=expires_in_minutes),
            'created_at': datetime.now()
        }
        self.collection.insert_one(otp_data)
        return otp
    
    def verify(self, email, otp, otp_type='verification'):
        otp_record = self.collection.find_one({
            'email': email.lower(),
            'otp': otp,
            'type': otp_type,
            'expires_at': {'$gt': datetime.now()}
        })
        
        if otp_record:
            self.collection.delete_one({'_id': otp_record['_id']})
            return True
        return False
    
    def cleanup_expired(self):
        return self.collection.delete_many({
            'expires_at': {'$lt': datetime.now()}
        })