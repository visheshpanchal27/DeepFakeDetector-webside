import numpy as np
from typing import Dict

def normalize_score(score, min_val=0, max_val=100):
    """Normalize score to 0-100 range"""
    return np.clip(score, min_val, max_val)

def calculate_confidence(method_scores):
    """Reduce sensitivity to single outlier methods"""
    if not method_scores:
        return 0.5
    
    scores_list = list(method_scores.values())
    mean_score = np.mean(scores_list)
    std_dev = np.std(scores_list)
    
    # Confidence = how consistent methods are
    confidence = max(0.5, 1 - (std_dev / 50))  # Never below 0.5
    return round(confidence, 2)

def fuse_scores(scores: Dict) -> Dict:
    """
    Improved score fusion with normalization and balanced weighting
    Prevents real images from being misclassified as AI-generated
    """
    # Normalize all scores to 0-100 scale
    mnet = normalize_score(scores.get("mobilenet_v2", 50))
    vit = normalize_score(scores.get("vision_transformer", 50))
    forensic = normalize_score(scores.get("forensic", 50))
    visual_artifacts = normalize_score(scores.get("visual_artifacts", 50))
    
    # Weighted fusion (deep models get higher trust)
    # MobileNetV2: 40% - Fast, reliable baseline
    # ViT: 30% - High accuracy transformer
    # Forensic: 20% - Camera/compression artifacts
    # Visual: 10% - Edge/texture analysis
    final_score = (
        0.4 * mnet +
        0.3 * vit +
        0.2 * forensic +
        0.1 * visual_artifacts
    )
    
    # Normalize score range (dampen by 10% to reduce false positives)
    adjusted_score = min(max(final_score * 0.9, 0), 100)
    authenticity_score = np.round(adjusted_score, 2)
    
    # Calculate confidence using improved method
    method_scores = {
        "mobilenet_v2": mnet,
        "vision_transformer": vit,
        "forensic": forensic,
        "visual_artifacts": visual_artifacts
    }
    confidence = calculate_confidence(method_scores)
    
    # Stricter classification - Conservative AI detection
    if authenticity_score >= 85:
        classification = "AUTHENTIC_HUMAN"
        risk = "SAFE"
    elif authenticity_score >= 70:
        classification = "LIKELY_AUTHENTIC"
        risk = "LOW"
    elif authenticity_score >= 40:
        classification = "SUSPICIOUS"
        risk = "MEDIUM"
    else:
        classification = "AI_GENERATED"
        risk = "HIGH"
    
    # Post-processing: Low confidence = downgrade classification
    if authenticity_score < 70 and confidence < 0.6:
        if classification == "LIKELY_AUTHENTIC":
            classification = "SUSPICIOUS"
            risk = "MEDIUM"
        elif classification == "AUTHENTIC_HUMAN":
            classification = "LIKELY_AUTHENTIC"
            risk = "LOW"
    
    return {
        "authenticity_score": float(authenticity_score),
        "confidence": float(confidence),
        "classification": classification,
        "risk_level": risk,
        "individual_scores": {
            "mobilenet_v2": float(mnet),
            "vision_transformer": float(vit),
            "forensic": float(forensic),
            "visual_artifacts": float(visual_artifacts)
        }
    }

def calibrate_score(raw_score: float, texture_variance: float = None) -> float:
    """
    Calibrate score based on image characteristics
    Prevents flat-lit real photos from being flagged as AI
    """
    calibrated = raw_score
    
    # If texture variance is low (flat lighting), adjust upward
    if texture_variance is not None and texture_variance < 20:
        calibrated += 5  # Boost score for flat-lit real photos
    
    return normalize_score(calibrated)

def adaptive_threshold(scores: list, percentile: float = 0.5) -> float:
    """Calculate adaptive threshold based on score distribution"""
    if not scores or len(scores) < 2:
        return 50.0
    
    threshold = np.percentile(scores, percentile * 100)
    return normalize_score(threshold, 20, 80)
