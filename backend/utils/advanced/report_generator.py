import json
import hashlib
from datetime import datetime
import base64
import cv2

class ForensicReportGenerator:
    """Generate detailed forensic reports for deepfake analysis"""
    
    def __init__(self):
        self.report_version = "3.0"
        self.generator_info = {
            "name": "Advanced DeepFake Detector",
            "version": "v3.0",
            "methods": "25+ Non-AI Detection Methods"
        }
    
    def generate_report_hash(self, report_data):
        """Generate SHA-256 hash for report integrity"""
        try:
            # Convert report to string and hash
            report_str = json.dumps(report_data, sort_keys=True)
            hash_obj = hashlib.sha256(report_str.encode())
            return hash_obj.hexdigest()
        except:
            return "hash_generation_failed"
    
    def create_executive_summary(self, detection_results):
        """Create executive summary section"""
        try:
            authenticity_score = detection_results.get('authenticity_score', 50.0)
            classification = detection_results.get('classification', 'UNKNOWN')
            risk_level = detection_results.get('risk_level', 'MEDIUM')
            confidence = detection_results.get('confidence', 0.5)
            
            summary = {
                "overall_assessment": {
                    "authenticity_score": round(authenticity_score, 2),
                    "classification": classification,
                    "risk_level": risk_level,
                    "confidence_level": round(confidence * 100, 1)
                },
                "key_findings": self._generate_key_findings(detection_results),
                "recommendation": self._generate_recommendation(authenticity_score, risk_level)
            }
            
            return summary
        except:
            return {"error": "Failed to generate executive summary"}
    
    def _generate_key_findings(self, detection_results):
        """Generate key findings from detection results"""
        findings = []
        
        try:
            individual_scores = detection_results.get('individual_scores', {})
            
            # Find most suspicious methods
            suspicious_methods = [(method, score) for method, score in individual_scores.items() if score < 40]
            suspicious_methods.sort(key=lambda x: x[1])
            
            if suspicious_methods:
                findings.append(f"Most suspicious indicators: {', '.join([m[0] for m in suspicious_methods[:3]])}")
            
            # Find most reliable methods
            reliable_methods = [(method, score) for method, score in individual_scores.items() if score > 80]
            if reliable_methods:
                findings.append(f"Strong authenticity indicators: {', '.join([m[0] for m in reliable_methods[:3]])}")
            
            # Method count
            method_count = detection_results.get('method_count', 0)
            findings.append(f"Analysis based on {method_count} independent detection methods")
            
            # AI name detection
            if detection_results.get('ai_name_detected', False):
                keyword = detection_results.get('detected_ai_keyword', 'AI-related')
                findings.append(f"Filename contains AI-related keyword: '{keyword}'")
            
        except:
            findings.append("Analysis completed with standard detection methods")
        
        return findings
    
    def _generate_recommendation(self, authenticity_score, risk_level):
        """Generate recommendation based on analysis"""
        if authenticity_score >= 80:
            return "Content appears authentic. Low risk of manipulation detected."
        elif authenticity_score >= 60:
            return "Content likely authentic with minor inconsistencies. Further verification recommended."
        elif authenticity_score >= 40:
            return "Content shows suspicious characteristics. Manual review strongly recommended."
        elif authenticity_score >= 20:
            return "Content likely manipulated. High probability of deepfake technology usage."
        else:
            return "Content appears to be AI-generated or heavily manipulated. Treat as synthetic media."
    
    def create_technical_analysis(self, detection_results):
        """Create detailed technical analysis section"""
        try:
            technical_data = {
                "detection_methods": {
                    "total_methods_used": detection_results.get('method_count', 0),
                    "method_breakdown": detection_results.get('analysis_summary', {}),
                    "individual_scores": detection_results.get('individual_scores', {}),
                    "group_scores": detection_results.get('group_scores', {})
                },
                "statistical_analysis": {
                    "score_distribution": self._calculate_score_distribution(detection_results),
                    "confidence_metrics": {
                        "overall_confidence": detection_results.get('confidence', 0.5),
                        "score_variance": self._calculate_score_variance(detection_results),
                        "method_agreement": self._calculate_method_agreement(detection_results)
                    }
                },
                "anomaly_detection": {
                    "detected_anomalies": self._identify_anomalies(detection_results),
                    "severity_assessment": self._assess_anomaly_severity(detection_results)
                }
            }
            
            return technical_data
        except Exception as e:
            return {"error": f"Technical analysis failed: {str(e)}"}
    
    def _calculate_score_distribution(self, detection_results):
        """Calculate score distribution statistics"""
        try:
            scores = list(detection_results.get('individual_scores', {}).values())
            if not scores:
                return {}
            
            import numpy as np
            return {
                "mean": round(np.mean(scores), 2),
                "median": round(np.median(scores), 2),
                "std_deviation": round(np.std(scores), 2),
                "min_score": round(min(scores), 2),
                "max_score": round(max(scores), 2)
            }
        except:
            return {}
    
    def _calculate_score_variance(self, detection_results):
        """Calculate variance in detection scores"""
        try:
            scores = list(detection_results.get('individual_scores', {}).values())
            if len(scores) < 2:
                return 0.0
            
            import numpy as np
            return round(np.var(scores), 3)
        except:
            return 0.0
    
    def _calculate_method_agreement(self, detection_results):
        """Calculate agreement between detection methods"""
        try:
            scores = list(detection_results.get('individual_scores', {}).values())
            if len(scores) < 2:
                return 1.0
            
            # Calculate how many methods agree (within 20 points)
            agreements = 0
            total_pairs = 0
            
            for i in range(len(scores)):
                for j in range(i+1, len(scores)):
                    if abs(scores[i] - scores[j]) <= 20:
                        agreements += 1
                    total_pairs += 1
            
            return round(agreements / total_pairs if total_pairs > 0 else 1.0, 3)
        except:
            return 0.5
    
    def _identify_anomalies(self, detection_results):
        """Identify specific anomalies detected"""
        anomalies = []
        
        try:
            individual_scores = detection_results.get('individual_scores', {})
            
            # Low scoring methods indicate anomalies
            for method, score in individual_scores.items():
                if score < 30:
                    anomalies.append({
                        "type": method,
                        "severity": "HIGH" if score < 15 else "MEDIUM",
                        "score": score,
                        "description": f"Significant anomaly detected in {method.lower()}"
                    })
                elif score < 50:
                    anomalies.append({
                        "type": method,
                        "severity": "LOW",
                        "score": score,
                        "description": f"Minor inconsistency in {method.lower()}"
                    })
            
        except:
            pass
        
        return anomalies
    
    def _assess_anomaly_severity(self, detection_results):
        """Assess overall severity of detected anomalies"""
        try:
            authenticity_score = detection_results.get('authenticity_score', 50.0)
            
            if authenticity_score >= 70:
                return "LOW"
            elif authenticity_score >= 40:
                return "MEDIUM"
            elif authenticity_score >= 20:
                return "HIGH"
            else:
                return "CRITICAL"
        except:
            return "UNKNOWN"
    
    def create_metadata_section(self, file_info, analysis_metadata):
        """Create metadata and provenance section"""
        try:
            metadata = {
                "file_information": {
                    "filename": file_info.get('filename', 'unknown'),
                    "file_type": file_info.get('file_type', 'unknown'),
                    "file_size": file_info.get('file_size', 0),
                    "dimensions": file_info.get('dimensions', 'unknown'),
                    "duration": file_info.get('duration', 'N/A')
                },
                "analysis_metadata": {
                    "analysis_timestamp": datetime.now().isoformat(),
                    "detector_version": analysis_metadata.get('detector_version', 'v3.0'),
                    "processing_time": analysis_metadata.get('processing_time', 'unknown'),
                    "analysis_id": analysis_metadata.get('analysis_id', 'unknown')
                },
                "system_information": {
                    "platform": "Advanced DeepFake Detector v3.0",
                    "detection_engine": "Non-AI Computer Vision",
                    "total_methods": "25+ Independent Methods"
                }
            }
            
            return metadata
        except:
            return {"error": "Metadata generation failed"}
    
    def generate_json_report(self, detection_results, file_info=None, analysis_metadata=None):
        """Generate comprehensive JSON forensic report"""
        try:
            # Default values
            if file_info is None:
                file_info = {'filename': 'unknown', 'file_type': 'unknown'}
            if analysis_metadata is None:
                analysis_metadata = {'detector_version': 'v3.0'}
            
            report = {
                "report_header": {
                    "report_id": f"DF_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    "report_version": self.report_version,
                    "generated_timestamp": datetime.now().isoformat(),
                    "generator": self.generator_info
                },
                "executive_summary": self.create_executive_summary(detection_results),
                "technical_analysis": self.create_technical_analysis(detection_results),
                "metadata_and_provenance": self.create_metadata_section(file_info, analysis_metadata),
                "raw_detection_data": detection_results,
                "integrity": {
                    "report_hash": "",  # Will be calculated after report creation
                    "hash_algorithm": "SHA-256",
                    "verification_note": "This hash can be used to verify report integrity"
                }
            }
            
            # Calculate and add report hash
            report["integrity"]["report_hash"] = self.generate_report_hash(report)
            
            return report
            
        except Exception as e:
            return {
                "error": f"Report generation failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def export_report_to_file(self, report, output_path):
        """Export report to JSON file"""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Report export failed: {e}")
            return False
    
    def create_summary_pdf_data(self, detection_results):
        """Create data structure for PDF report generation (frontend)"""
        try:
            pdf_data = {
                "title": "DeepFake Detection Analysis Report",
                "subtitle": f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                "authenticity_score": detection_results.get('authenticity_score', 50.0),
                "classification": detection_results.get('classification', 'UNKNOWN'),
                "risk_level": detection_results.get('risk_level', 'MEDIUM'),
                "confidence": detection_results.get('confidence', 0.5),
                "method_count": detection_results.get('method_count', 0),
                "key_findings": self._generate_key_findings(detection_results),
                "recommendation": self._generate_recommendation(
                    detection_results.get('authenticity_score', 50.0),
                    detection_results.get('risk_level', 'MEDIUM')
                ),
                "chart_data": {
                    "labels": list(detection_results.get('individual_scores', {}).keys()),
                    "scores": list(detection_results.get('individual_scores', {}).values())
                }
            }
            
            return pdf_data
        except:
            return {"error": "PDF data generation failed"}