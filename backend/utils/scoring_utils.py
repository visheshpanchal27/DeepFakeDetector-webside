import numpy as np

def normalize_score(score, min_possible=0, max_possible=100):
    """
    Normalize scores to 0-100 range consistently
    """
    if max_possible == min_possible:
        return 50.0
    
    normalized = (score - min_possible) / (max_possible - min_possible) * 100
    return np.clip(normalized, 0, 100)

def calculate_confidence(scores):
    """
    Calculate confidence based on consistency across detectors
    Reduce sensitivity to single outlier methods
    """
    if not scores or len(scores) < 2:
        return 0.5
    
    score_values = list(scores.values())
    
    # Confidence inversely related to variance
    mean_score = np.mean(score_values)
    std_dev = np.std(score_values)
    
    # Confidence = how consistent methods are
    # Never below 0.5 to prevent over-sensitivity
    confidence = max(0.5, 1 - (std_dev / 50))
    
    return round(confidence, 2)

def weighted_average(scores, weights):
    """
    Calculate weighted average of scores with dampening
    Reduces false positives by 10%
    """
    if not scores or not weights:
        return 50.0
    
    weighted_sum = 0
    total_weight = 0
    
    for method, score in scores.items():
        if method in weights:
            weighted_sum += score * weights[method]
            total_weight += weights[method]
    
    if total_weight == 0:
        avg = np.mean(list(scores.values()))
    else:
        avg = weighted_sum / total_weight
    
    # Dampen by 10% to reduce false positives
    adjusted = min(max(avg * 0.9, 0), 100)
    return adjusted

def normalize_score(raw_score, score_type='mobilenet', baseline=None):
    """
    Normalize detection scores to authenticity percentage (0-100)
    
    CRITICAL: If models output HIGH scores for AI (0.8-0.9),
    this function inverts them to authenticity scores.
    
    Args:
        raw_score: Raw detector output (0-1)
        score_type: Type of detector
        baseline: Baseline values for normalization
    
    Returns:
        float: Authenticity score (0-100, higher = more human)
    """
    if baseline is None:
        baseline = {
            'mobilenet_mean': 0.5,
            'mobilenet_std': 0.2,
            'resnet_mean': 0.5,
            'resnet_std': 0.2,
            'xception_mean': 0.5,
            'xception_std': 0.2
        }
    
    # Clamp raw score to valid range
    raw_score = max(0.0, min(1.0, raw_score))
    
    # CRITICAL FIX: INVERT the score
    # If detector says 0.9 (90% AI), authenticity should be 10%
    # If detector says 0.1 (10% AI), authenticity should be 90%
    inverted_score = 1.0 - raw_score
    
    # Scale to 0-100
    authenticity_percentage = inverted_score * 100
    
    # Clamp final result
    return max(0.0, min(100.0, authenticity_percentage))


def fuse_detector_scores(detector_results, weights=None):
    """
    Fuse multiple detector scores with weighted average
    
    Args:
        detector_results: Dict of {detector_name: score}
        weights: Optional dict of {detector_name: weight}
    
    Returns:
        tuple: (fused_score, confidence, individual_scores)
    """
    if not detector_results:
        return 50.0, 0.0, []
    
    # Default weights
    if weights is None:
        weights = {
            'mobilenet': 0.35,
            'resnet': 0.35,
            'xception': 0.30
        }
    
    individual_scores = []
    weighted_sum = 0.0
    weight_sum = 0.0
    
    for detector, score in detector_results.items():
        weight = weights.get(detector, 0.33)
        weighted_sum += score * weight
        weight_sum += weight
        individual_scores.append(score)
    
    # Calculate fused score
    fused_score = weighted_sum / weight_sum if weight_sum > 0 else 50.0
    
    # Calculate confidence
    confidence = calculate_confidence({'scores': individual_scores})
    
    return fused_score, confidence, individual_scores


def classify_authenticity(score, confidence, thresholds=None):
    """
    Classify authenticity based on score and confidence
    
    Args:
        score: Authenticity score (0-100)
        confidence: Confidence value (0-1)
        thresholds: Optional custom thresholds
    
    Returns:
        tuple: (classification, risk_level)
    """
    if thresholds is None:
        thresholds = {
            "AUTHENTIC_HUMAN": 85.0,
            "LIKELY_AUTHENTIC": 70.0,
            "SUSPICIOUS": 40.0,
            "AI_GENERATED": 0.0
        }
    
    # Initial classification based on score
    if score >= thresholds["AUTHENTIC_HUMAN"]:
        classification = "AUTHENTIC_HUMAN"
        risk_level = "SAFE"
    elif score >= thresholds["LIKELY_AUTHENTIC"]:
        classification = "LIKELY_AUTHENTIC"
        risk_level = "LOW"
    elif score >= thresholds["SUSPICIOUS"]:
        classification = "SUSPICIOUS"
        risk_level = "MEDIUM"
    else:
        classification = "AI_GENERATED"
        risk_level = "HIGH"
    
    # Downgrade if low confidence
    if confidence < 0.6:
        if classification == "AUTHENTIC_HUMAN":
            classification = "LIKELY_AUTHENTIC"
            risk_level = "LOW"
        elif classification == "LIKELY_AUTHENTIC":
            classification = "SUSPICIOUS"
            risk_level = "MEDIUM"
    
    return classification, risk_level


def get_reliability_weights():
    """
    Return reliability weights for different detection methods
    """
    return {
        "Lighting Analysis": 0.15,
        "Facial Geometry": 0.15, 
        "Blink Patterns": 0.15,
        "Eye Reflections": 0.10,
        "Shadow Geometry": 0.10,
        "Texture Analysis": 0.10,
        "Audio-Visual Sync": 0.15,
        "Motion Analysis": 0.10,
        "Enhancement Analysis": 0.10,
        "Frequency Analysis": 0.10,
        "Temporal Drift": 0.10
    }