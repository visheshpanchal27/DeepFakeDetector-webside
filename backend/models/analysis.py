from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

class Analysis:
    def __init__(self, db):
        self.collection = db['analyses']
    
    def create(self, user_id, file_id, filename, analysis_result, cloudinary_url=None):
        try:
            analysis_data = {
                'user_id': str(user_id),
                'file_id': file_id,
                'original_filename': filename,
                'cloudinary_url': cloudinary_url,
                'analysis_result': analysis_result,
                'created_at': datetime.now()
            }
            print(f"[DEBUG] Inserting analysis data for user {user_id}: {filename}")
            result = self.collection.insert_one(analysis_data)
            print(f"[DEBUG] Analysis inserted with ID: {result.inserted_id}")
            return result
        except Exception as e:
            print(f"[ERROR] Failed to create analysis record: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
    
    def find_by_user_id(self, user_id, limit=50):
        try:
            print(f"[DEBUG] Finding analyses for user: {user_id}")
            query = {'user_id': str(user_id)}
            cursor = self.collection.find(query).sort('created_at', -1).limit(limit)
            results = list(cursor)
            print(f"[DEBUG] Found {len(results)} analyses for user {user_id}")
            
            # Convert ObjectId to string for JSON serialization
            for result in results:
                if '_id' in result:
                    result['id'] = str(result['_id'])
                    del result['_id']
            
            return results
        except Exception as e:
            print(f"[ERROR] Failed to find analyses for user {user_id}: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    def delete_by_user_id(self, user_id):
        return self.collection.delete_many({'user_id': str(user_id)})
    
    def get_user_history(self, user_id, limit=50):
        print(f"[DEBUG] Getting user history for: {user_id}")
        return self.find_by_user_id(user_id, limit)
    
    def get_user_stats(self, user_id):
        pipeline = [
            {'$match': {'user_id': str(user_id)}},
            {'$group': {
                '_id': None,
                'total_analyses': {'$sum': 1},
                'avg_authenticity': {'$avg': '$analysis_result.authenticity_score'},
                'avg_confidence': {'$avg': '$analysis_result.confidence'}
            }}
        ]
        return list(self.collection.aggregate(pipeline))
    
    def delete_analysis(self, user_id, analysis_id):
        try:
            result = self.collection.delete_one({
                'user_id': str(user_id),
                'file_id': analysis_id
            })
            return result.deleted_count > 0
        except Exception as e:
            print(f"Delete analysis error: {e}")
            return False
    
    def get_global_stats(self):
        total = self.collection.count_documents({})
        
        # Count by classification
        pipeline = [
            {'$group': {
                '_id': '$analysis_result.classification',
                'count': {'$sum': 1}
            }}
        ]
        classifications = list(self.collection.aggregate(pipeline))
        
        # Calculate averages
        avg_pipeline = [
            {'$group': {
                '_id': None,
                'avg_authenticity': {'$avg': '$analysis_result.authenticity_score'},
                'avg_confidence': {'$avg': '$analysis_result.confidence'}
            }}
        ]
        averages = list(self.collection.aggregate(avg_pipeline))
        
        return {
            'total_analyses': total,
            'classifications': {item['_id']: item['count'] for item in classifications if item['_id']},
            'averages': averages[0] if averages else {'avg_authenticity': 0, 'avg_confidence': 0}
        }