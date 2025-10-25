import numpy as np
from typing import Dict, List, Tuple
from .scoring import fuse_scores, normalize_score, calibrate_score

class AdvancedFusionEngine:
    """Advanced scoring system with weighted fusion and explainable results"""
    
    def __init__(self):
        # Updated weights for all detection methods
        self.weights = {
            # Facial Analysis Group (30%)
            'facial': {
                'blink': 0.12,
                'lip_sync': 0.10,
                'head_pose': 0.08
            },
            
            # Temporal Analysis Group (25%)
            'temporal': {
                'optical_flow': 0.08,
                'frame_consistency': 0.07,
                'temporal_artifacts': 0.05,
                'flicker': 0.05
            },
            
            # Noise & Artifacts Group (25%)
            'noise': {
                'fft_spectrum': 0.06,
                'prnu_noise': 0.05,
                'edge_artifacts': 0.05,
                'bitplane': 0.04,
                'color_correlation': 0.05
            },
            
            # Forensics Group (20%)
            'forensics': {
                'illumination': 0.06,
                'boundary_artifacts': 0.06,
                'metadata': 0.04,
                'compression': 0.04
            }
        }
    
    def calculate_group_scores(self, features: Dict) -> Dict:
        """Calculate scores for each detection group"""
        try:
            group_scores = {}
            
            # Facial Analysis Group
            facial_features = {
                'blink': features.get('blink', 0.5),
                'lip_sync': features.get('lip_sync', 0.5),
                'head_pose': features.get('head_pose', 0.5)
            }
            group_scores['facial'] = self._weighted_average(facial_features, self.weights['facial'])
            
            # Temporal Analysis Group
            temporal_features = {
                'optical_flow': features.get('optical_flow', 0.5),
                'frame_consistency': features.get('frame_consistency', 0.5),
                'temporal_artifacts': features.get('temporal_artifacts', 0.5),
                'flicker': features.get('flicker', 0.5)
            }
            group_scores['temporal'] = self._weighted_average(temporal_features, self.weights['temporal'])
            
            # Noise & Artifacts Group
            noise_features = {
                'fft_spectrum': features.get('fft', 0.5),
                'prnu_noise': features.get('prnu', 0.5),
                'edge_artifacts': features.get('edge_artifacts', 0.5),
                'bitplane': features.get('bitplane', 0.5),
                'color_correlation': features.get('color_correlation', 0.5)
            }
            group_scores['noise'] = self._weighted_average(noise_features, self.weights['noise'])
            
            # Forensics Group
            forensics_features = {
                'illumination': features.get('illumination', 0.5),
                'boundary_artifacts': features.get('boundary_artifacts', 0.5),
                'metadata': features.get('metadata', 0.5),
                'compression': features.get('compression', 0.5)
            }
            group_scores['forensics'] = self._weighted_average(forensics_features, self.weights['forensics'])
            
            return group_scores
        except Exception as e:
            print(f"Group score calculation error: {e}")
            return {'facial': 0.5, 'temporal': 0.5, 'noise': 0.5, 'forensics': 0.5}
    
    def _weighted_average(self, features: Dict, weights: Dict) -> float:
        """Calculate weighted average of features"""
        try:
            total_weight = 0
            weighted_sum = 0
            
            for feature, value in features.items():
                if feature in weights:
                    weight = weights[feature]
                    weighted_sum += value * weight
                    total_weight += weight
            
            if total_weight > 0:
                return weighted_sum / total_weight
            return 0.5
        except:
            return 0.5
    
    def calculate_final_score(self, group_scores: Dict) -> float:
        """Calculate final authenticity score with normalization"""
        try:
            # Group weights (sum to 1.0)
            group_weights = {
                'facial': 0.30,
                'temporal': 0.25,
                'noise': 0.25,
                'forensics': 0.20
            }
            
            final_score = 0
            for group, score in group_scores.items():
                if group in group_weights:
                    # Normalize each group score
                    normalized = normalize_score(score * 100, 0, 100)
                    final_score += (normalized / 100) * group_weights[group]
            
            # Convert to authenticity score (0-100)
            authenticity_score = (1 - final_score) * 100
            
            # Post calibration for real image bias correction
            forensic_score = group_scores.get('forensics', 0.5)
            noise_score = group_scores.get('noise', 0.5)
            
            # If forensic and noise indicate real but score is low, adjust upward
            if authenticity_score < 40 and forensic_score < 0.5 and noise_score < 0.6:
                authenticity_score += 10
            
            # Texture variance calibration (flat lighting adjustment)
            if authenticity_score < 45 and forensic_score < 0.4:
                authenticity_score = calibrate_score(authenticity_score, texture_variance=15)
            
            return normalize_score(authenticity_score, 0, 100)
        except:
            return 50.0
    
    def get_classification(self, score: float) -> str:
        """Get classification based on score (balanced thresholds)"""
        # Real humans typically fall between 35-55, so make that range safe
        if score >= 65:
            return "AUTHENTIC_HUMAN"
        elif score >= 45:
            return "LIKELY_AUTHENTIC"
        elif score >= 30:
            return "SUSPICIOUS"
        elif score >= 20:
            return "LIKELY_DEEPFAKE"
        else:
            return "AI_GENERATED"
    
    def get_risk_level(self, score: float) -> str:
        """Get risk level based on score (calibrated for real image tolerance)"""
        if score >= 65:
            return "SAFE"
        elif score >= 45:
            return "LOW"
        elif score >= 30:
            return "MEDIUM"
        else:
            return "HIGH"
    
    def calculate_confidence(self, features: Dict, group_scores: Dict) -> float:
        """Calculate confidence in the prediction"""
        try:
            # Calculate variance in group scores
            scores = list(group_scores.values())
            score_variance = np.var(scores)
            
            # Calculate feature completeness
            total_features = len(self._get_all_feature_names())
            available_features = sum(1 for key in features.keys() if features[key] is not None)
            completeness = available_features / total_features
            
            # Calculate confidence (lower variance + higher completeness = higher confidence)
            variance_confidence = 1 - min(1.0, score_variance * 4)
            completeness_confidence = completeness
            
            # Combine confidences
            confidence = (variance_confidence + completeness_confidence) / 2
            return max(0.1, min(1.0, confidence))
        except:
            return 0.5
    
    def _get_all_feature_names(self) -> List[str]:
        """Get all possible feature names"""
        features = []
        for group_weights in self.weights.values():
            features.extend(group_weights.keys())
        return features
    
    def generate_detailed_report(self, features: Dict) -> Dict:
        """Generate detailed analysis report"""
        try:
            # Calculate group scores
            group_scores = self.calculate_group_scores(features)
            
            # Calculate final score
            final_score = self.calculate_final_score(group_scores)
            
            # Calculate confidence
            confidence = self.calculate_confidence(features, group_scores)
            
            # Get classification and risk level
            classification = self.get_classification(final_score)
            risk_level = self.get_risk_level(final_score)
            
            # Create individual scores for display
            individual_scores = {}
            
            # Facial Analysis
            if 'blink' in features:
                individual_scores['Blink Detection'] = (1 - features['blink']) * 100
            if 'lip_sync' in features:
                individual_scores['Lip Sync Analysis'] = (1 - features['lip_sync']) * 100
            if 'head_pose' in features:
                individual_scores['Head Pose Analysis'] = (1 - features['head_pose']) * 100
            
            # Temporal Analysis
            if 'optical_flow' in features:
                individual_scores['Optical Flow'] = (1 - features['optical_flow']) * 100
            if 'frame_consistency' in features:
                individual_scores['Frame Consistency'] = (1 - features['frame_consistency']) * 100
            if 'temporal_artifacts' in features:
                individual_scores['Temporal Artifacts'] = (1 - features['temporal_artifacts']) * 100
            if 'flicker' in features:
                individual_scores['Flicker Analysis'] = (1 - features['flicker']) * 100
            
            # Noise & Artifacts
            if 'fft' in features:
                individual_scores['FFT Spectrum'] = (1 - features['fft']) * 100
            if 'prnu' in features:
                individual_scores['PRNU Noise'] = (1 - features['prnu']) * 100
            if 'edge_artifacts' in features:
                individual_scores['Edge Artifacts'] = (1 - features['edge_artifacts']) * 100
            if 'bitplane' in features:
                individual_scores['Bitplane Analysis'] = (1 - features['bitplane']) * 100
            if 'color_correlation' in features:
                individual_scores['Color Correlation'] = (1 - features['color_correlation']) * 100
            
            # Forensics
            if 'illumination' in features:
                individual_scores['Illumination Analysis'] = (1 - features['illumination']) * 100
            if 'boundary_artifacts' in features:
                individual_scores['Boundary Artifacts'] = (1 - features['boundary_artifacts']) * 100
            if 'metadata' in features:
                individual_scores['Metadata Analysis'] = (1 - features['metadata']) * 100
            if 'compression' in features:
                individual_scores['Compression Analysis'] = (1 - features['compression']) * 100
            
            # Group scores for display
            group_scores_display = {
                'Facial Analysis': (1 - group_scores['facial']) * 100,
                'Temporal Analysis': (1 - group_scores['temporal']) * 100,
                'Noise & Artifacts': (1 - group_scores['noise']) * 100,
                'Forensics Analysis': (1 - group_scores['forensics']) * 100
            }
            
            return {
                'authenticity_score': final_score,
                'confidence': confidence,
                'classification': classification,
                'risk_level': risk_level,
                'individual_scores': individual_scores,
                'group_scores': group_scores_display,
                'method_count': len(individual_scores),
                'analysis_summary': {
                    'total_methods': len(individual_scores),
                    'facial_methods': sum(1 for k in individual_scores.keys() if any(x in k.lower() for x in ['blink', 'lip', 'head', 'pose'])),
                    'temporal_methods': sum(1 for k in individual_scores.keys() if any(x in k.lower() for x in ['flow', 'frame', 'temporal', 'flicker'])),
                    'noise_methods': sum(1 for k in individual_scores.keys() if any(x in k.lower() for x in ['fft', 'prnu', 'edge', 'bitplane', 'color'])),
                    'forensics_methods': sum(1 for k in individual_scores.keys() if any(x in k.lower() for x in ['illumination', 'boundary', 'metadata', 'compression']))
                }
            }
        except Exception as e:
            print(f"Report generation error: {e}")
            return self._default_report()
    
    def _default_report(self) -> Dict:
        """Return default report in case of errors"""
        return {
            'authenticity_score': 50.0,
            'confidence': 0.3,
            'classification': 'UNKNOWN',
            'risk_level': 'MEDIUM',
            'individual_scores': {},
            'group_scores': {},
            'method_count': 0,
            'analysis_summary': {
                'total_methods': 0,
                'facial_methods': 0,
                'temporal_methods': 0,
                'noise_methods': 0,
                'forensics_methods': 0
            }
        }
    
    def adaptive_threshold_adjustment(self, features: Dict, base_score: float) -> float:
        """Adjust thresholds based on content type and quality"""
        try:
            adjustments = 0
            
            # Adjust for video quality indicators
            if 'compression' in features and features['compression'] > 0.7:
                adjustments -= 5  # Lower threshold for heavily compressed content
            
            # Adjust for metadata completeness
            if 'metadata' in features and features['metadata'] < 0.3:
                adjustments += 3  # Raise suspicion for missing metadata
            
            # Adjust for temporal consistency
            if 'frame_consistency' in features and features['frame_consistency'] > 0.8:
                adjustments += 5  # Raise suspicion for too consistent frames
            
            # Apply adjustments
            adjusted_score = base_score + adjustments
            return max(0, min(100, adjusted_score))
        except:
            return base_score