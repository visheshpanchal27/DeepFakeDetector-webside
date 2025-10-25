from flask import Blueprint, Response, request, jsonify
from middleware.auth import token_required
from services.database import get_db
import json
import time

analysis_stream_bp = Blueprint('analysis_stream', __name__)

# Store progress for each analysis session
progress_store = {}

def set_progress(session_id, progress, message):
    """Update progress for a session"""
    progress_store[session_id] = {
        'progress': progress,
        'message': message,
        'timestamp': time.time()
    }

def get_progress(session_id):
    """Get progress for a session"""
    return progress_store.get(session_id, {'progress': 0, 'message': 'Starting...', 'timestamp': time.time()})

@analysis_stream_bp.route('/progress/<session_id>', methods=['GET'])
def stream_progress(session_id):
    """Stream progress updates using Server-Sent Events"""
    def generate():
        last_progress = -1
        timeout = 300  # 5 minutes timeout
        start_time = time.time()
        
        while True:
            if time.time() - start_time > timeout:
                yield f"data: {json.dumps({'progress': 100, 'message': 'Timeout', 'done': True})}\n\n"
                break
            
            progress_data = get_progress(session_id)
            current_progress = progress_data['progress']
            
            if current_progress != last_progress:
                yield f"data: {json.dumps(progress_data)}\n\n"
                last_progress = current_progress
                
                if current_progress >= 100:
                    # Cleanup
                    if session_id in progress_store:
                        del progress_store[session_id]
                    break
            
            time.sleep(0.5)  # Check every 500ms
    
    return Response(generate(), mimetype='text/event-stream')
