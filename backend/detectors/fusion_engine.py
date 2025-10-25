import numpy as np
from typing import Dict, List

class AdaptiveFusionEngine:
    """Advanced score fusion with adaptive weighting"""
    
    @staticmethod
    def fuse_image_scores(deep_model_score: float, forensic_score: float, 
                          physics_score: float = None) -> float:
        """Fuse scores with balanced weighting"""
        weights = [0.50, 0.50]  # Equal weight
        scores = [deep_model_score, forensic_score]
        
        final_score = sum(w * s for w, s in zip(weights, scores))
        return round(final_score, 2)
    
    @staticmethod
    def fuse_video_scores(visual_score: float, temporal_score: float, 
                          biological_score: float = None) -> float:
        """Fuse video-specific scores"""
        if biological_score is not None:
            weights = [0.60, 0.25, 0.15]
            scores = [visual_score, temporal_score, biological_score]
        else:
            weights = [0.75, 0.25]
            scores = [visual_score, temporal_score]
        
        final_score = sum(w * s for w, s in zip(weights, scores))
        return round(final_score, 2)
    
    @staticmethod
    def adaptive_threshold(scores: List[float]) -> float:
        """Calculate adaptive threshold based on score distribution"""
        if not scores or len(scores) < 2:
            return 50.0
        
        mean_score = np.mean(scores)
        std_dev = np.std(scores)
        threshold = mean_score - (0.5 * std_dev)
        return round(max(20, min(80, threshold)), 2)
    
    @staticmethod
    def confidence_weighted_fusion(scores: Dict[str, float], 
                                   confidences: Dict[str, float]) -> float:
        """Fuse scores weighted by model confidence"""
        weighted_sum = sum(scores[k] * confidences[k] for k in scores.keys())
        total_confidence = sum(confidences.values())
        
        if total_confidence == 0:
            return 50.0
        
        return round(weighted_sum / total_confidence, 2)
    
    @staticmethod
    def ensemble_voting(predictions: List[str]) -> str:
        """Majority voting for classification"""
        from collections import Counter
        votes = Counter(predictions)
        return votes.most_common(1)[0][0]
    
    @staticmethod
    def calculate_uncertainty(scores: List[float]) -> float:
        """Calculate prediction uncertainty"""
        if not scores or len(scores) < 2:
            return 50.0
        
        uncertainty = np.std(scores) / (np.mean(scores) + 1e-6)
        return round(min(100, uncertainty * 100), 2)

class MetaScorer:
    """Meta-learning score aggregation"""
    
    @staticmethod
    def aggregate_all_scores(image_scores: Dict, forensic_scores: Dict, 
                            temporal_scores: Dict = None) -> Dict:
        """Aggregate all detection scores into final result"""
        fusion = AdaptiveFusionEngine()
        
        # Calculate deep model average - extract only numeric values
        deep_scores = []
        for k, v in image_scores.items():
            if isinstance(v, (int, float)):
                deep_scores.append(v)
        deep_avg = np.mean(deep_scores) if deep_scores else 50.0
        
        # Get forensic combined - ensure it's a number
        forensic_combined = forensic_scores.get('combined', 50.0)
        if isinstance(forensic_combined, dict):
            forensic_combined = 50.0
        
        # Fuse image scores
        if temporal_scores:
            temporal_combined = temporal_scores.get('combined', 50.0)
            final_score = fusion.fuse_video_scores(deep_avg, temporal_combined, forensic_combined)
        else:
            final_score = fusion.fuse_image_scores(deep_avg, forensic_combined)
        
        # Calculate confidence
        all_scores = deep_scores + [forensic_combined]
        if temporal_scores:
            all_scores.append(temporal_scores.get('combined', 50.0))
        
        confidence = 1.0 - (fusion.calculate_uncertainty(all_scores) / 100)
        
        # Classification
        classification = MetaScorer.classify_result(final_score, confidence)
        risk_level = MetaScorer.assess_risk(final_score, confidence)
        
        return {
            "authenticity_score": round(final_score, 2),
            "confidence": round(confidence, 3),
            "classification": classification,
            "risk_level": risk_level,
            "deep_model_avg": round(deep_avg, 2),
            "forensic_score": round(forensic_combined, 2),
            "temporal_score": round(temporal_scores.get('combined', 0), 2) if temporal_scores else None
        }
    
    @staticmethod
    def classify_result(score: float, confidence: float) -> str:
        """Classify detection result"""
        if score >= 70:
            return "AUTHENTIC_HUMAN"
        elif score >= 50:
            return "LIKELY_AUTHENTIC"
        elif score >= 30:
            return "SUSPICIOUS"
        else:
            return "AI_GENERATED"
    
    @staticmethod
    def assess_risk(score: float, confidence: float) -> str:
        """Assess risk level"""
        if score >= 70:
            return "SAFE"
        elif score >= 50:
            return "LOW"
        elif score >= 30:
            return "MEDIUM"
        else:
            return "HIGH"
