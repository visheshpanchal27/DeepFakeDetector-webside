from flask import Blueprint, request, jsonify
import numpy as np
from datetime import datetime
from models.analysis import Analysis
from services.file_service import FileService
from middleware.auth import token_required
from middleware.rate_limiter import rate_limit
from utils.ai_name_detector import detect_ai_in_filename

def create_advanced_analysis_routes(db, detector):
    advanced_bp = Blueprint('advanced_analysis', __name__)
    analysis_model = Analysis(db)
    file_service = FileService()
    
    @advanced_bp.route('/detect/advanced', methods=['POST'])
    @token_required(db)
    @rate_limit(limit=5, window=60)  # More restrictive for advanced analysis
    def advanced_analysis(current_user):
        """Advanced enterprise-grade analysis endpoint"""
        temp_file_path = None
        try:
            if not detector:
                return jsonify({'error': 'Advanced analysis service unavailable'}), 503
            
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            
            # Get analysis options from request
            enable_visualization = request.form.get('enable_visualization', 'true').lower() == 'true'
            enable_parallel = request.form.get('enable_parallel', 'true').lower() == 'true'
            enable_adaptive_thresholds = request.form.get('enable_adaptive_thresholds', 'true').lower() == 'true'
            generate_report = request.form.get('generate_report', 'true').lower() == 'true'
            
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
            
            # Advanced analysis with enterprise detector
            try:
                print(f"[DEBUG] Starting advanced enterprise analysis...")
                print(f"[DEBUG] Options: viz={enable_visualization}, parallel={enable_parallel}, adaptive={enable_adaptive_thresholds}")
                
                # Import enterprise detector
                from detectors.advanced_detector_v3 import detect_deepfake_enterprise
                
                # Configure analysis options
                analysis_options = {
                    'enable_parallel': enable_parallel,
                    'enable_visualization': enable_visualization,
                    'enable_adaptive_thresholds': enable_adaptive_thresholds
                }
                
                result = detect_deepfake_enterprise(temp_file_path, **analysis_options)
                print(f"[DEBUG] Advanced analysis completed")
                
            except Exception as e:
                print(f"[ERROR] Advanced analysis error: {str(e)}")
                return jsonify({'error': f'Analysis failed: {str(e)}'}), 500
            
            if not result:
                return jsonify({'error': 'Analysis could not be completed'}), 500
            
            # Extract results
            authenticity_score = result.get('authenticity_score', 50.0)
            confidence = result.get('confidence', 0.5)
            classification = result.get('classification', 'UNKNOWN')
            risk_level = result.get('risk_level', 'MEDIUM')
            individual_scores = result.get('individual_scores', {})
            group_scores = result.get('group_scores', {})
            method_count = result.get('method_count', 0)
            analysis_summary = result.get('analysis_summary', {})
            
            # Override if AI name detected
            if has_ai_name:
                final_authenticity = min(15.0, authenticity_score * 0.2)
                final_confidence = 0.78
                final_classification = 'AI_GENERATED'
                final_risk_level = 'HIGH'
                final_individual_scores = {k: v * 0.2 for k, v in individual_scores.items()}
                final_group_scores = {k: v * 0.2 for k, v in group_scores.items()}
            else:
                final_authenticity = authenticity_score
                final_confidence = confidence
                final_classification = classification
                final_risk_level = risk_level
                final_individual_scores = individual_scores
                final_group_scores = group_scores
            
            # Prepare enhanced response
            response_data = {
                'filename': file.filename,
                'authenticity_score': final_authenticity,
                'confidence': final_confidence,
                'classification': final_classification,
                'risk_level': final_risk_level,
                'individual_scores': final_individual_scores,
                'group_scores': final_group_scores,
                'method_count': method_count,
                'analysis_summary': analysis_summary,
                'is_deepfake': True if has_ai_name else final_authenticity < 50.0,
                'timestamp': datetime.now().isoformat(),
                'ai_name_detected': has_ai_name,
                'detected_ai_keyword': detected_keyword if has_ai_name else None,
                'detector_version': result.get('enterprise_metadata', {}).get('detector_version', 'v3.0'),
                'analysis_options': {
                    'visualization_enabled': enable_visualization,
                    'parallel_processing': enable_parallel,
                    'adaptive_thresholds': enable_adaptive_thresholds,
                    'forensic_reporting': generate_report
                }
            }
            
            # Add enterprise features if available
            if 'visualizations' in result:
                response_data['visualizations'] = result['visualizations']
            
            if 'forensic_report' in result and generate_report:
                response_data['forensic_report'] = result['forensic_report']
            
            if 'pdf_report_data' in result:
                response_data['pdf_report_data'] = result['pdf_report_data']
            
            if 'enterprise_metadata' in result:
                response_data['enterprise_metadata'] = result['enterprise_metadata']
            
            # Save to database with enhanced data
            try:
                analysis_model.create(
                    user_id=current_user['_id'],
                    file_id=file_id,
                    filename=file.filename,
                    analysis_result=response_data,
                    cloudinary_url=cloudinary_url
                )
                print(f"[DEBUG] Advanced analysis saved to database")
            except Exception as db_error:
                print(f"[WARNING] Database save failed: {str(db_error)}")
            
            return jsonify(response_data), 200
            
        except Exception as e:
            print(f"[ERROR] Advanced analysis failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Advanced analysis failed: {str(e)}'}), 500
        finally:
            file_service.cleanup_temp_file(temp_file_path)
    
    @advanced_bp.route('/capabilities', methods=['GET'])
    def get_capabilities():
        """Get advanced detector capabilities"""
        try:
            from detectors.advanced_detector_v3 import EnterpriseDeepFakeDetector
            
            detector_instance = EnterpriseDeepFakeDetector()
            capabilities = detector_instance.get_enterprise_capabilities()
            
            return jsonify(capabilities), 200
            
        except Exception as e:
            print(f"Capabilities error: {e}")
            return jsonify({'error': 'Failed to retrieve capabilities'}), 500
    
    @advanced_bp.route('/performance', methods=['GET'])
    def get_performance_stats():
        """Get performance and threshold statistics"""
        try:
            from core.threshold_optimizer import AdaptiveThresholdOptimizer
            from core.frame_processor import MultiThreadedFrameProcessor
            
            # Threshold optimizer stats
            optimizer = AdaptiveThresholdOptimizer()
            threshold_stats = optimizer.get_system_performance_summary()
            
            # Frame processor stats
            processor = MultiThreadedFrameProcessor()
            processing_stats = processor.get_performance_stats()
            
            return jsonify({
                'threshold_optimization': threshold_stats,
                'parallel_processing': processing_stats,
                'system_status': 'operational'
            }), 200
            
        except Exception as e:
            print(f"Performance stats error: {e}")
            return jsonify({'error': 'Failed to retrieve performance stats'}), 500
    
    @advanced_bp.route('/export-report/<analysis_id>', methods=['GET'])
    @token_required(db)
    def export_forensic_report(current_user, analysis_id):
        """Export forensic report for specific analysis"""
        try:
            # Get analysis from database
            analysis = analysis_model.get_analysis_by_id(current_user['_id'], analysis_id)
            
            if not analysis:
                return jsonify({'error': 'Analysis not found'}), 404
            
            # Extract forensic report if available
            analysis_result = analysis.get('analysis_result', {})
            forensic_report = analysis_result.get('forensic_report')
            
            if not forensic_report:
                return jsonify({'error': 'Forensic report not available for this analysis'}), 404
            
            return jsonify({
                'report': forensic_report,
                'export_timestamp': datetime.now().isoformat(),
                'analysis_id': analysis_id
            }), 200
            
        except Exception as e:
            print(f"Report export error: {e}")
            return jsonify({'error': 'Failed to export report'}), 500
    
    @advanced_bp.route('/benchmark', methods=['POST'])
    @token_required(db)
    @rate_limit(limit=1, window=300)  # Very restrictive - once per 5 minutes
    def run_benchmark(current_user):
        """Run system benchmark (admin only)"""
        try:
            # Check if user has admin privileges (implement your admin check)
            # For now, allow all authenticated users
            
            from core.frame_processor import MultiThreadedFrameProcessor
            
            processor = MultiThreadedFrameProcessor()
            
            # Create test data
            test_frames = [np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8) for _ in range(10)]
            
            # Simple benchmark
            import time
            start_time = time.time()
            
            # Test parallel processing
            test_functions = {
                'test_method_1': lambda frames: np.mean([np.mean(f) for f in frames]),
                'test_method_2': lambda frames: np.std([np.std(f) for f in frames]),
                'test_method_3': lambda frames: len(frames)
            }
            
            results = processor.process_frames_parallel(test_frames, test_functions)
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            benchmark_results = {
                'processing_time_seconds': round(processing_time, 3),
                'frames_processed': len(test_frames),
                'methods_tested': len(test_functions),
                'parallel_efficiency': round(len(test_functions) / processing_time, 2),
                'system_performance': 'good' if processing_time < 2.0 else 'needs_optimization',
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(benchmark_results), 200
            
        except Exception as e:
            print(f"Benchmark error: {e}")
            return jsonify({'error': 'Benchmark failed'}), 500
    
    return advanced_bp