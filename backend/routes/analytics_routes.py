from flask import Blueprint, jsonify, request
from middleware.auth import token_required
from models.analysis import Analysis
import numpy as np
from datetime import datetime, timedelta

bp = Blueprint('analytics', __name__)

@bp.route('/insights', methods=['GET'])
@token_required
def get_insights(current_user):
    """Get advanced analytics insights"""
    try:
        user_id = str(current_user['_id'])
        
        # Get all user analyses
        analyses = Analysis.find_by_user_id(user_id, limit=1000)
        
        if not analyses:
            return jsonify({
                "message": "No analyses found",
                "insights": {}
            }), 200
        
        # Calculate insights
        insights = {
            "performance": _calculate_performance_metrics(analyses),
            "accuracy": _calculate_accuracy_metrics(analyses),
            "trends": _calculate_trends(analyses),
            "model_comparison": _compare_models(analyses),
            "file_analysis": _analyze_file_patterns(analyses)
        }
        
        return jsonify(insights), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/model-performance', methods=['GET'])
@token_required
def get_model_performance(current_user):
    """Compare performance of different detection models"""
    try:
        user_id = str(current_user['_id'])
        analyses = Analysis.find_by_user_id(user_id, limit=1000)
        
        if not analyses:
            return jsonify({"message": "No data available"}), 200
        
        performance = _compare_models(analyses)
        
        return jsonify(performance), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/detection-trends', methods=['GET'])
@token_required
def get_detection_trends(current_user):
    """Get detection trends over time"""
    try:
        user_id = str(current_user['_id'])
        days = int(request.args.get('days', 30))
        
        analyses = Analysis.find_by_user_id(user_id, limit=1000)
        
        if not analyses:
            return jsonify({"message": "No data available"}), 200
        
        trends = _calculate_time_series_trends(analyses, days)
        
        return jsonify(trends), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/file-statistics', methods=['GET'])
@token_required
def get_file_statistics(current_user):
    """Get file-based statistics"""
    try:
        user_id = str(current_user['_id'])
        analyses = Analysis.find_by_user_id(user_id, limit=1000)
        
        if not analyses:
            return jsonify({"message": "No data available"}), 200
        
        stats = _analyze_file_patterns(analyses)
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/ai-keyword-trends', methods=['GET'])
@token_required
def get_ai_keyword_trends(current_user):
    """Get AI keyword detection trends"""
    try:
        user_id = str(current_user['_id'])
        analyses = Analysis.find_by_user_id(user_id, limit=1000)
        
        if not analyses:
            return jsonify({"message": "No data available"}), 200
        
        # Count AI keyword detections
        ai_detected = sum(1 for a in analyses if a.get('analysis_result', {}).get('ai_name_detected', False))
        
        keywords = {}
        for analysis in analyses:
            keyword = analysis.get('analysis_result', {}).get('detected_ai_keyword')
            if keyword:
                keywords[keyword] = keywords.get(keyword, 0) + 1
        
        trends = {
            "total_ai_detected": ai_detected,
            "detection_rate": round(ai_detected / len(analyses) * 100, 2) if analyses else 0,
            "keyword_distribution": keywords,
            "top_keywords": sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:5]
        }
        
        return jsonify(trends), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions

def _calculate_performance_metrics(analyses):
    """Calculate performance metrics"""
    if not analyses:
        return {}
    
    processing_times = []
    file_sizes = []
    
    for analysis in analyses:
        # Estimate processing time (placeholder)
        result = analysis.get('analysis_result', {})
        method_count = result.get('method_count', 0)
        processing_times.append(method_count * 0.5)  # Estimate
    
    return {
        "avg_processing_time": round(np.mean(processing_times), 2) if processing_times else 0,
        "min_processing_time": round(np.min(processing_times), 2) if processing_times else 0,
        "max_processing_time": round(np.max(processing_times), 2) if processing_times else 0,
        "total_analyses": len(analyses)
    }

def _calculate_accuracy_metrics(analyses):
    """Calculate accuracy-related metrics"""
    if not analyses:
        return {}
    
    scores = [a.get('analysis_result', {}).get('authenticity_score', 0) for a in analyses]
    confidences = [a.get('analysis_result', {}).get('confidence', 0) for a in analyses]
    
    return {
        "avg_authenticity_score": round(np.mean(scores), 2),
        "score_std_dev": round(np.std(scores), 2),
        "avg_confidence": round(np.mean(confidences), 3),
        "high_confidence_rate": round(sum(1 for c in confidences if c >= 0.7) / len(confidences) * 100, 2)
    }

def _calculate_trends(analyses):
    """Calculate detection trends"""
    if not analyses:
        return {}
    
    classifications = {}
    risk_levels = {}
    
    for analysis in analyses:
        result = analysis.get('analysis_result', {})
        
        classification = result.get('classification', 'UNKNOWN')
        classifications[classification] = classifications.get(classification, 0) + 1
        
        risk = result.get('risk_level', 'UNKNOWN')
        risk_levels[risk] = risk_levels.get(risk, 0) + 1
    
    return {
        "classification_distribution": classifications,
        "risk_distribution": risk_levels,
        "ai_generated_rate": round(classifications.get('AI_GENERATED', 0) / len(analyses) * 100, 2),
        "authentic_rate": round(classifications.get('AUTHENTIC_HUMAN', 0) / len(analyses) * 100, 2)
    }

def _compare_models(analyses):
    """Compare different detection models"""
    if not analyses:
        return {}
    
    model_scores = {
        'mobilenet_v2': [],
        'vision_transformer': [],
        'efficientnet': [],
        'resnet50': [],
        'forensic': []
    }
    
    for analysis in analyses:
        scores = analysis.get('analysis_result', {}).get('individual_scores', {})
        
        for model in model_scores.keys():
            if model in scores:
                model_scores[model].append(scores[model])
            elif model == 'forensic' and 'forensic' in scores:
                forensic_combined = scores['forensic'].get('combined', 0)
                model_scores[model].append(forensic_combined)
    
    comparison = {}
    for model, scores in model_scores.items():
        if scores:
            comparison[model] = {
                "avg_score": round(np.mean(scores), 2),
                "std_dev": round(np.std(scores), 2),
                "min_score": round(np.min(scores), 2),
                "max_score": round(np.max(scores), 2)
            }
    
    return comparison

def _analyze_file_patterns(analyses):
    """Analyze file-based patterns"""
    if not analyses:
        return {}
    
    file_types = {}
    
    for analysis in analyses:
        filename = analysis.get('original_filename', '')
        ext = filename.split('.')[-1].lower() if '.' in filename else 'unknown'
        file_types[ext] = file_types.get(ext, 0) + 1
    
    return {
        "file_type_distribution": file_types,
        "total_files": len(analyses),
        "unique_file_types": len(file_types)
    }

def _calculate_time_series_trends(analyses, days):
    """Calculate time-series trends"""
    if not analyses:
        return {}
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    daily_data = {}
    for analysis in analyses:
        created_at = analysis.get('created_at')
        if created_at and created_at >= cutoff_date:
            date_key = created_at.strftime('%Y-%m-%d')
            if date_key not in daily_data:
                daily_data[date_key] = {
                    'count': 0,
                    'scores': [],
                    'ai_generated': 0
                }
            
            daily_data[date_key]['count'] += 1
            score = analysis.get('analysis_result', {}).get('authenticity_score', 0)
            daily_data[date_key]['scores'].append(score)
            
            if analysis.get('analysis_result', {}).get('classification') == 'AI_GENERATED':
                daily_data[date_key]['ai_generated'] += 1
    
    # Calculate averages
    for date_key in daily_data:
        scores = daily_data[date_key]['scores']
        daily_data[date_key]['avg_score'] = round(np.mean(scores), 2) if scores else 0
        del daily_data[date_key]['scores']
    
    return {
        "time_range_days": days,
        "daily_data": daily_data,
        "total_in_range": sum(d['count'] for d in daily_data.values())
    }
