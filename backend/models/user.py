from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import bcrypt

class User:
    def __init__(self, db):
        self.collection = db['users']
    
    def create(self, name, email, password):
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_data = {
            'name': name,
            'email': email.lower(),
            'password': hashed_password.decode('utf-8'),  # Store as string for MongoDB compatibility
            'verified': False,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        return self.collection.insert_one(user_data)
    
    def find_by_email(self, email):
        return self.collection.find_one({'email': email.lower()})
    
    def find_by_id(self, user_id):
        return self.collection.find_one({'_id': ObjectId(user_id)})
    
    def verify_email(self, email):
        return self.collection.update_one(
            {'email': email.lower()},
            {'$set': {'verified': True, 'updated_at': datetime.now()}}
        )
    
    def update_password(self, email, password):
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        return self.collection.update_one(
            {'email': email.lower()},
            {'$set': {'password': hashed_password.decode('utf-8'), 'updated_at': datetime.now()}}
        )
    
    def update_profile(self, user_id, data):
        data['updated_at'] = datetime.now()
        return self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': data}
        )
    
    def delete_by_id(self, user_id):
        return self.collection.delete_one({'_id': ObjectId(user_id)})
    
    def create_advanced(self, name, email, password, additional_fields=None):
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_data = {
            'name': name,
            'email': email.lower(),
            'password': hashed_password.decode('utf-8'),  # Store as string for MongoDB compatibility
            'verified': False,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        if additional_fields:
            user_data.update(additional_fields)
            
        return self.collection.insert_one(user_data)