from pymongo import MongoClient
import os

_db = None

def get_db(app=None):
    """Get MongoDB database instance"""
    global _db
    
    if _db is None:
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongo_uri)
        _db = client['deepfake_detector']
    
    return _db

def init_db(app):
    """Initialize database with app context"""
    return get_db(app)
