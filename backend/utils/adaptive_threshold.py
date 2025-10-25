import numpy as np
from typing import List, Dict
from models.analysis import Analysis

class AdaptiveThresholdManager:
    """Manages adaptive thresholds based on user history"""
    
    @staticmethod
    def calculate_adaptive_threshold(scores: List[float]) -> float:
        """Calculate adaptive threshold from score distribution"""
        if not scores or len(scores) < 2:
            return 50.0
        
        mean_score = np.mean(scores)
        std_dev = np.std(scores)
        
        # Threshold is mean minus half standard deviation
        threshold = mean_score - (0.5 * std_dev)
        
        # Clamp between 20 and 80
        threshold = max(20, min(80, threshold))
        
        return round(threshold, 2)
    
    @staticmethod
    def get_user_adaptive_threshold(user_id: str) -> float:
        """Get personalized threshold based on user history"""
        try:
            # Get user's past analyses
            analyses = Analysis.find_by_user_id(user_id, limit=100)
            
            if not analyses or len(analyses) < 5:
                return 50.0  # Default threshold
            
            # Extract authenticity scores
            scores = [
                a.get('analysis_result', {}).get('authenticity_score', 50)
                for a in analyses
            ]
            
            return AdaptiveThresholdManager.calculate_adaptive_threshold(scores)
            
        except Exception:
            return 50.0
    
    @staticmethod
    def recalibrate_thresholds(user_id: str) -> Dict[str, float]:
        """Recalibrate all thresholds for a user"""
        try:
            analyses = Analysis.find_by_user_id(user_id, limit=100)
            
            if not analyses or len(analyses) < 5:
                return {
                    "authenticity_threshold": 50.0,
                    "confidence_threshold": 0.5,
                    "risk_threshold": 50.0
                }
            
            # Extract scores
            authenticity_scores = [
                a.get('analysis_result', {}).get('authenticity_score', 50)
                for a in analyses
            ]
            
            confidence_scores = [
                a.get('analysis_result', {}).get('confidence', 0.5) * 100
                for a in analyses
            ]
            
            # Calculate thresholds
            auth_threshold = AdaptiveThresholdManager.calculate_adaptive_threshold(authenticity_scores)
            conf_threshold = AdaptiveThresholdManager.calculate_adaptive_threshold(confidence_scores) / 100
            
            return {
                "authenticity_threshold": auth_threshold,
                "confidence_threshold": round(conf_threshold, 3),
                "risk_threshold": 100 - auth_threshold,
                "sample_size": len(analyses)
            }
            
        except Exception as e:
            return {
                "authenticity_threshold": 50.0,
                "confidence_threshold": 0.5,
                "risk_threshold": 50.0,
                "error": str(e)
            }
    
    @staticmethod
    def temporal_coherence(frame_scores: List[float]) -> float:
        """Calculate temporal coherence score"""
        if not frame_scores or len(frame_scores) < 2:
            return 50.0
        
        # Calculate frame-to-frame differences
        diffs = [
            abs(frame_scores[i] - frame_scores[i-1])
            for i in range(1, len(frame_scores))
        ]
        
        # Lower difference = higher coherence
        avg_diff = np.mean(diffs)
        coherence = 100 - min(100, avg_diff * 2)
        
        return round(coherence, 2)
    
    @staticmethod
    def get_classification_with_adaptive_threshold(score: float, confidence: float, 
                                                   user_id: str = None) -> str:
        """Classify result using adaptive threshold"""
        if user_id:
            threshold = AdaptiveThresholdManager.get_user_adaptive_threshold(user_id)
        else:
            threshold = 50.0
        
        # Adjust classification based on adaptive threshold
        if score >= threshold + 25 and confidence >= 0.7:
            return "AUTHENTIC_HUMAN"
        elif score >= threshold + 10 and confidence >= 0.6:
            return "HUMAN_ENHANCED"
        elif score >= threshold - 10:
            return "SUSPICIOUS"
        else:
            return "AI_GENERATED"
    
    @staticmethod
    def get_risk_with_adaptive_threshold(score: float, confidence: float,
                                        user_id: str = None) -> str:
        """Assess risk using adaptive threshold"""
        if user_id:
            threshold = AdaptiveThresholdManager.get_user_adaptive_threshold(user_id)
        else:
            threshold = 50.0
        
        if score >= threshold + 20 and confidence >= 0.7:
            return "SAFE"
        elif score >= threshold and confidence >= 0.5:
            return "LOW"
        elif score >= threshold - 20:
            return "MEDIUM"
        else:
            return "HIGH"

def temporal_coherence(frame_scores: List[float]) -> float:
    """Standalone temporal coherence function"""
    return AdaptiveThresholdManager.temporal_coherence(frame_scores)
