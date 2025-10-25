from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from detectors.simple_pretrained_detector import SimplePretrainedDetector

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_file():
    """Simple analysis without authentication"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
        file.save(temp_file.name)
        temp_path = temp_file.name
    
    try:
        # Analyze with AI detector
        detector = SimplePretrainedDetector()
        
        ext = file.filename.lower().split('.')[-1]
        if ext in ['jpg', 'jpeg', 'png', 'bmp', 'webp', 'gif']:
            result = detector.analyze_image(temp_path, original_filename=file.filename)
        elif ext in ['mp4', 'avi', 'mov', 'webm', 'mkv']:
            result = detector.analyze_video(temp_path, original_filename=file.filename)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
        
        # Clean response
        response = {
            'filename': file.filename,
            'authenticity_score': result['authenticity_score'],
            'confidence': result['confidence'],
            'classification': result['classification'],
            'risk_level': result['risk_level'],
            'individual_scores': result['individual_scores'],
            'method_count': result['method_count'],
            'is_deepfake': result['classification'] in ['AI_GENERATED', 'SUSPICIOUS'],
            'detector_version': 'AI Text Detection v1.0'
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500
    
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.unlink(temp_path)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'detector': 'ai_text_detection'})

if __name__ == '__main__':
    app.run(debug=True, port=8001)