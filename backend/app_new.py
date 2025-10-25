from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import cloudinary
import os
import sys
from dotenv import load_dotenv
from middleware.security_headers import add_security_headers
from utils.logger import logger

# Import models and services
from models.user import User
from models.analysis import Analysis
from models.otp import OTP
from services.email_service import EmailService
from services.file_service import FileService

# Import routes
from routes.auth import create_auth_routes
from routes.analysis import create_analysis_routes

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'your_cloud_name'),
    api_key=os.getenv('CLOUDINARY_API_KEY', 'your_api_key'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', 'your_api_secret')
)

app = Flask(__name__)

# CORS configuration
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

# Add security headers to all responses
@app.after_request
def after_request(response):
    return add_security_headers(response)

# Database connection with proper cleanup
db = None
mongo_client = None
try:
    mongodb_uri = os.getenv('MONGODB_URI')
    if mongodb_uri:
        mongo_client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        mongo_client.admin.command('ping')
        db = mongo_client['deepfake_detector']
        logger.info("Connected to MongoDB")
    else:
        # Fallback to local MongoDB
        mongo_client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=3000)
        mongo_client.admin.command('ping')
        db = mongo_client['deepfake_detector']
        print("[OK] Connected to local MongoDB")
except Exception as e:
    logger.error(f"MongoDB connection failed: {e}")
    db = None

# Cleanup on shutdown
import atexit
def cleanup():
    if mongo_client:
        mongo_client.close()
        logger.info("MongoDB connection closed")
atexit.register(cleanup)

# Initialize detector with AI text/watermark detection
from detectors.simple_pretrained_detector import SimplePretrainedDetector
detector = SimplePretrainedDetector()
logger.info("AI Detection system initialized with text/watermark detection")

# Create database indexes
if db is not None:
    from utils.db_indexes import create_indexes
    create_indexes(db)

# Register blueprints
if db is not None:
    app.register_blueprint(create_auth_routes(db), url_prefix='/api')
    app.register_blueprint(create_analysis_routes(db, detector), url_prefix='/api')
    
    # Register progress streaming routes
    try:
        from routes.analysis_stream import analysis_stream_bp
        app.register_blueprint(analysis_stream_bp, url_prefix='/api')
        logger.info("Progress streaming routes registered")
    except Exception as e:
        logger.error(f"Failed to register streaming routes: {e}")
    
    # Register advanced analysis routes
    try:
        from routes.advanced_analysis import create_advanced_analysis_routes
        app.register_blueprint(create_advanced_analysis_routes(db, detector), url_prefix='/api')
        logger.info("Advanced analysis routes registered")
    except Exception as e:
        logger.error(f"Failed to register advanced routes: {e}")

@app.route('/api/health', methods=['GET'])
def health_check():
    detector_info = 'AI Text/Watermark Detector'
    detector_type = 'ai_text_detection'
    
    if detector:
        detector_info = 'AI Detection with Text/Watermark Analysis'
        detector_type = 'ai_enhanced'
    
    return jsonify({
        'status': 'healthy',
        'mongodb': 'connected' if db is not None else 'disconnected',
        'detector': detector_info,
        'detector_type': detector_type,
        'cloudinary': 'configured',
        'enhanced_features': {
            'ai_text_detection': True,
            'watermark_detection': True,
            'filename_analysis': True,
            'image_analysis': True,
            'texture_analysis': True,
            'edge_detection': True,
            'color_analysis': True,
            'frequency_analysis': True,
            'skin_tone_analysis': True,
            'total_methods': '8 AI indicators + text detection'
        }
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting DeepFake Detection API...")
    logger.info("API available at: http://localhost:8000")
    app.run(debug=True, host='0.0.0.0', port=8000, threaded=True)