from flask import Blueprint, jsonify, send_file
from middleware.auth import token_required
from models.analysis import Analysis
from detectors.explainability import explain_prediction
import cv2
import os

bp = Blueprint('explainability', __name__)

@bp.route('/analysis/<analysis_id>/explain', methods=['GET'])
@token_required
def get_explanation(current_user, analysis_id):
    """Get visual explanation for an analysis"""
    try:
        user_id = str(current_user['_id'])
        
        # Get analysis
        analyses = Analysis.find_by_user_id(user_id, limit=1000)
        analysis = next((a for a in analyses if str(a['_id']) == analysis_id), None)
        
        if not analysis:
            return jsonify({"error": "Analysis not found"}), 404
        
        # Get image from Cloudinary URL or local path
        image_url = analysis.get('cloudinary_url')
        if not image_url:
            return jsonify({"error": "Image not available"}), 404
        
        # Download image temporarily (if from Cloudinary)
        temp_path = f'/tmp/explain_{analysis_id}.jpg'
        # TODO: Download from Cloudinary
        
        # Generate explanation
        scores_dict = analysis.get('analysis_result', {}).get('individual_scores', {})
        explanation = explain_prediction(temp_path, scores_dict)
        
        return jsonify({
            "analysis_id": analysis_id,
            "explanation_url": f"/api/explainability/image/{os.path.basename(explanation['explanation_path'])}",
            "forensic_url": f"/api/explainability/image/{os.path.basename(explanation['forensic_path'])}",
            "scores": scores_dict
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/image/<filename>', methods=['GET'])
def get_explanation_image(filename):
    """Serve explanation image"""
    try:
        filepath = os.path.join('static/explanations', filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype='image/jpeg')
        else:
            return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/analysis/<analysis_id>/heatmap', methods=['GET'])
@token_required
def get_heatmap(current_user, analysis_id):
    """Get attention heatmap for analysis"""
    try:
        user_id = str(current_user['_id'])
        
        # Get analysis
        analyses = Analysis.find_by_user_id(user_id, limit=1000)
        analysis = next((a for a in analyses if str(a['_id']) == analysis_id), None)
        
        if not analysis:
            return jsonify({"error": "Analysis not found"}), 404
        
        # Generate heatmap
        from detectors.explainability import ExplainabilityEngine
        
        # TODO: Load actual image
        temp_path = f'/tmp/heatmap_{analysis_id}.jpg'
        image = cv2.imread(temp_path)
        
        scores_dict = analysis.get('analysis_result', {}).get('individual_scores', {})
        attention_map = ExplainabilityEngine.generate_attention_map(image, scores_dict)
        heatmap = ExplainabilityEngine.generate_gradcam_heatmap(image, attention_map)
        overlay = ExplainabilityEngine.overlay_heatmap(image, heatmap)
        
        # Save
        output_path = f'static/explanations/heatmap_{analysis_id}.jpg'
        cv2.imwrite(output_path, overlay)
        
        return jsonify({
            "heatmap_url": f"/api/explainability/image/heatmap_{analysis_id}.jpg"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
