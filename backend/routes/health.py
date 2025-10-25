from flask import Blueprint, jsonify
import psutil
import os
from datetime import datetime

def create_health_routes(db, detector):
    health_bp = Blueprint('health', __name__)
    
    start_time = datetime.now()
    
    @health_bp.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'uptime': str(datetime.now() - start_time),
            'services': {
                'mongodb': 'connected' if db else 'disconnected',
                'detector': 'ready' if detector else 'not initialized',
                'cloudinary': 'configured' if os.getenv('CLOUDINARY_CLOUD_NAME') else 'not configured'
            }
        })
    
    @health_bp.route('/health/detailed', methods=['GET'])
    def detailed_health():
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'uptime': str(datetime.now() - start_time),
            'system': {
                'cpu_usage': f'{cpu_percent}%',
                'memory_usage': f'{memory.percent}%',
                'memory_available': f'{memory.available / (1024**3):.2f} GB',
                'disk_usage': f'{disk.percent}%',
                'disk_free': f'{disk.free / (1024**3):.2f} GB'
            },
            'services': {
                'mongodb': {
                    'status': 'connected' if db else 'disconnected',
                    'collections': list(db.list_collection_names()) if db else []
                },
                'detector': {
                    'status': 'ready' if detector else 'not initialized',
                    'type': detector.__class__.__name__ if detector else None
                },
                'cloudinary': {
                    'status': 'configured' if os.getenv('CLOUDINARY_CLOUD_NAME') else 'not configured'
                }
            }
        })
    
    return health_bp
