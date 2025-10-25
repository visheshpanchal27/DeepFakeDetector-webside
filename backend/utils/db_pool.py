from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os

class DatabasePool:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def initialize(self, uri=None, db_name='deepfake_detector'):
        if self._client is None:
            mongodb_uri = uri or os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            self._client = MongoClient(
                mongodb_uri,
                maxPoolSize=50,
                minPoolSize=10,
                maxIdleTimeMS=45000,
                serverSelectionTimeoutMS=5000
            )
            try:
                self._client.admin.command('ping')
                self._db = self._client[db_name]
                print(f"[OK] MongoDB pool initialized with {db_name}")
            except ConnectionFailure as e:
                print(f"[ERROR] MongoDB connection failed: {e}")
                self._client = None
                self._db = None
        return self._db
    
    def get_db(self):
        return self._db
    
    def close(self):
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            print("[OK] MongoDB connection pool closed")

db_pool = DatabasePool()
