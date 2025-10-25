from flask import Blueprint, request, jsonify
from datetime import datetime
import numpy as np
from models.analysis import Analysis
from services.file_service import FileService
from middleware.auth import token_required
from middleware.rate_limiter import rate_limit
from utils.ai_name_detector import detect_ai_in_filename

def create_analysis_routes(db, detector):
    analysis_bp = Blueprint('analysis', __name__)
    analysis_model = Analysis(db)
    file_service = FileService()
    
    @analysis_bp.route('/analyze', methods=['POST'])
    @token_required(db)
    @rate_limit(limit=10, window=60)
    def analyze_file(current_user):
        print("\n" + "="*60)
        print("[ANALYZE ROUTE] /api/analyze endpoint called!")
        print("="*60 + "\n")
        temp_file_path = None
        try:
            if not detector:
                return jsonify({'error': 'Analysis service unavailable'}), 503
            
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            
            # Validate file
            is_valid, validation_result = file_service.validate_file(file)
            if not is_valid:
                return jsonify({'error': validation_result}), 400
            
            file_info = validation_result
            file_id = file_service.generate_file_id()
            
            # Check for AI keywords in filename
            has_ai_name, detected_keyword = detect_ai_in_filename(file.filename)
            
            # Save temporary file
            temp_file_path = file_service.save_temp_file(file, file_info['extension'])
            if not temp_file_path:
                return jsonify({'error': 'Failed to process file'}), 500
            
            # Upload to Cloudinary
            cloudinary_url = file_service.upload_to_cloudinary(
                temp_file_path, file_info['type'], file_id
            )
            
            # Analyze file using physics-based detector with progress tracking
            try:
                import uuid
                session_id = str(uuid.uuid4())
                
                # Progress callback
                def progress_callback(progress, message):
                    from routes.analysis_stream import set_progress
                    set_progress(session_id, progress, message)
                    print(f"[PROGRESS] {progress}% - {message}")
                
                # Initialize progress
                progress_callback(10, 'Starting analysis...')
                
                # Run analysis using AI detector with text/watermark detection
                from detectors.simple_pretrained_detector import SimplePretrainedDetector
                ai_detector = SimplePretrainedDetector(progress_callback=progress_callback)
                
                if file_info['type'] == 'video':
                    result = ai_detector.analyze_video(temp_file_path, original_filename=file.filename)
                else:
                    result = ai_detector.analyze_image(temp_file_path, original_filename=file.filename)
                
                print(f"[DEBUG] Analysis completed for session: {session_id}")
                    
            except Exception as e:
                print(f"[ERROR] Detector error: {str(e)}")
                import traceback
                traceback.print_exc()
                return jsonify({'error': f'Analysis failed: {str(e)}'}), 500
            
            if not result:
                return jsonify({'error': 'Analysis could not be completed'}), 500
            
            # Handle both dict and object results
            if isinstance(result, dict):
                authenticity_score = result.get('authenticity_score', 50.0)
                confidence = result.get('confidence', 0.5)
                classification = result.get('classification', 'UNKNOWN')
                risk_level = result.get('risk_level', 'MEDIUM')
                individual_scores = result.get('individual_scores', {})
                group_scores = result.get('group_scores', {})
                method_count = result.get('method_count', 0)
                analysis_summary = result.get('analysis_summary', {})
            else:
                authenticity_score = float(getattr(result, 'authenticity_score', 50.0))
                confidence = float(getattr(result, 'confidence', 0.5))
                classification = str(getattr(result, 'classification', 'UNKNOWN'))
                risk_level = str(getattr(result, 'risk_level', 'MEDIUM'))
                individual_scores = getattr(result, 'individual_scores', {})
                group_scores = getattr(result, 'group_scores', {})
                method_count = getattr(result, 'method_count', 0)
                analysis_summary = getattr(result, 'analysis_summary', {})
            
            # Calculate overall average from all individual scores (skip nested dicts)
            overall_average = 0
            if individual_scores:
                scores_list = []
                for score in individual_scores.values():
                    if isinstance(score, (int, float)):
                        scores_list.append(float(score))
                if scores_list:
                    overall_average = sum(scores_list) / len(scores_list)
            
            # Override classification and scores if AI name detected OR if classification is AI_GENERATED
            is_ai_detected = has_ai_name or classification == 'AI_GENERATED'
            
            if is_ai_detected:
                # Invert scores for AI-generated content (100% AI = 0% authentic)
                final_authenticity = 100.0 - authenticity_score if authenticity_score > 50 else authenticity_score
                final_confidence = max(0.85, confidence)
                final_classification = 'AI_GENERATED'
                final_risk_level = 'HIGH'
                # Invert individual scores
                final_individual_scores = {k: (100.0 - v if isinstance(v, (int, float)) and v > 50 else v) for k, v in individual_scores.items()}
                final_group_scores = {k: (100.0 - v if isinstance(v, (int, float)) and v > 50 else v) for k, v in group_scores.items()}
                # Recalculate overall average from inverted scores
                scores_list = [v for v in final_individual_scores.values() if isinstance(v, (int, float))]
                final_overall_average = sum(scores_list) / len(scores_list) if scores_list else final_authenticity
            else:
                final_authenticity = authenticity_score
                final_confidence = confidence
                final_classification = classification
                final_risk_level = risk_level
                final_individual_scores = individual_scores
                final_group_scores = group_scores
                final_overall_average = overall_average
            
            # Prepare enhanced response with advanced features
            detailed_info = result.get('detailed_info', {}) if isinstance(result, dict) else getattr(result, 'detailed_info', {})
            
            # Convert scores safely and filter out watermark-related scores
            def safe_convert_scores(scores_dict):
                converted = {}
                for k, v in scores_dict.items():
                    # Skip watermark-related keys
                    if 'watermark' in str(k).lower() or 'ai_generator' in str(k).lower() or 'watermark_type' in str(k).lower():
                        continue
                        
                    if isinstance(v, dict):
                        # Flatten forensic dict - use 'combined' score
                        if k == 'forensic' and 'combined' in v:
                            converted[str(k)] = float(v.get('combined', 50.0))
                        else:
                            converted[str(k)] = safe_convert_scores(v)  # Recursive for nested
                    elif isinstance(v, (np.integer, np.floating)):
                        if np.isnan(v):
                            converted[str(k)] = 50.0  # Default for NaN
                        else:
                            converted[str(k)] = float(v)
                    elif isinstance(v, (int, float)):
                        if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
                            converted[str(k)] = 50.0  # Default for NaN/Inf
                        else:
                            converted[str(k)] = float(v)
                    elif isinstance(v, np.ndarray):
                        converted[str(k)] = v.tolist()
                    elif v is None:
                        converted[str(k)] = 50.0  # Default for None
                    elif isinstance(v, str):
                        if v.lower() in ['nan', 'none', 'null', '']:
                            converted[str(k)] = 50.0  # Default for string NaN
                        else:
                            converted[str(k)] = str(v)
                    else:
                        # Handle any other type safely
                        try:
                            if hasattr(v, '__float__'):
                                float_val = float(v)
                                if np.isnan(float_val) or np.isinf(float_val):
                                    converted[str(k)] = 50.0
                                else:
                                    converted[str(k)] = float_val
                            else:
                                converted[str(k)] = str(v)
                        except (ValueError, TypeError, OverflowError):
                            converted[str(k)] = str(v) if v is not None else 'unknown'
                return converted
            
            # Convert numpy types to Python types
            def convert_numpy(obj):
                if isinstance(obj, np.integer):
                    return int(obj)
                elif isinstance(obj, np.floating):
                    return float(obj)
                elif isinstance(obj, np.ndarray):
                    return obj.tolist()
                elif isinstance(obj, dict):
                    return {k: convert_numpy(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_numpy(item) for item in obj]
                return obj
            
            response_data = {
                'filename': str(file.filename),
                'authenticity_score': convert_numpy(final_authenticity),
                'confidence': convert_numpy(final_confidence),
                'classification': str(final_classification),
                'risk_level': str(final_risk_level),
                'individual_scores': safe_convert_scores(final_individual_scores),
                'group_scores': safe_convert_scores(final_group_scores),
                'overall_average': convert_numpy(final_overall_average),
                'method_count': int(method_count),
                'analysis_summary': convert_numpy(analysis_summary) if analysis_summary else {},
                'detailed_info': convert_numpy(detailed_info) if detailed_info else {},
                'is_deepfake': bool(has_ai_name or final_classification in ['AI_GENERATED', 'SUSPICIOUS']),
                'timestamp': datetime.now().isoformat(),
                'ai_name_detected': bool(has_ai_name),
                'detected_ai_keyword': str(detected_keyword) if detected_keyword else None,
                'detector_version': 'Physics-Based Detection v4',
                'reason': str(result.get('reason', 'Physics-based analysis completed')),
                'variance': convert_numpy(result.get('variance', 0.0))
            }
            
            # Save to database
            try:
                save_result = analysis_model.create(
                    user_id=current_user['_id'],
                    file_id=file_id,
                    filename=file.filename,
                    analysis_result=response_data,
                    cloudinary_url=cloudinary_url
                )
                print(f"[DEBUG] Analysis saved to database with ID: {save_result.inserted_id}")
                response_data['analysis_id'] = str(save_result.inserted_id)
            except Exception as db_error:
                print(f"[ERROR] Database save failed: {str(db_error)}")
                import traceback
                traceback.print_exc()
                # Don't fail the request, but log the error
                response_data['db_save_error'] = str(db_error)
            
            # Set final progress
            progress_callback(100, 'Analysis complete!')
            
            print(f"[DEBUG] Sending response: {response_data['classification']}")
            response_data['session_id'] = session_id
            return jsonify(response_data), 200
            
        except Exception as e:
            print(f"[ERROR] Analysis failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Analysis failed: {str(e)}'}), 500
        finally:
            file_service.cleanup_temp_file(temp_file_path)
    
    @analysis_bp.route('/history', methods=['GET'])
    @token_required(db)
    def get_history(current_user):
        try:
            print(f"[DEBUG] History request for user: {current_user['_id']}")
            limit = request.args.get('limit', 50, type=int)
            analyses = analysis_model.get_user_history(current_user['_id'], limit)
            
            print(f"[DEBUG] Returning {len(analyses)} analyses to frontend")
            
            return jsonify({
                'analyses': analyses,
                'total': len(analyses)
            })
            
        except Exception as e:
            print(f"[ERROR] History error: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': 'Failed to retrieve history'}), 500
    
    @analysis_bp.route('/stats', methods=['GET'])
    @token_required(db)
    def get_user_stats(current_user):
        try:
            stats = analysis_model.get_user_stats(current_user['_id'])
            user_stats = stats[0] if stats else {
                'total_analyses': 0,
                'avg_authenticity': 0,
                'avg_confidence': 0
            }
            
            return jsonify(user_stats)
            
        except Exception as e:
            print(f"Stats error: {e}")
            return jsonify({'error': 'Failed to retrieve stats'}), 500
    
    @analysis_bp.route('/global-stats', methods=['GET'])
    def get_global_stats():
        try:
            stats = analysis_model.get_global_stats()
            return jsonify(stats)
            
        except Exception as e:
            print(f"Global stats error: {e}")
            return jsonify({'error': 'Failed to retrieve global stats'}), 500
    
    @analysis_bp.route('/analysis/<analysis_id>', methods=['DELETE'])
    @token_required(db)
    def delete_analysis(current_user, analysis_id):
        try:
            result = analysis_model.delete_analysis(current_user['_id'], analysis_id)
            if result:
                return jsonify({'message': 'Analysis deleted successfully'}), 200
            return jsonify({'error': 'Analysis not found'}), 404
        except Exception as e:
            print(f"Delete error: {e}")
            return jsonify({'error': 'Failed to delete analysis'}), 500
    
    return analysis_bp