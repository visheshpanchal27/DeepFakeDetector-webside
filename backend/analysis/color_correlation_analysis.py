import cv2
import numpy as np
from scipy.stats import pearsonr

def analyze_rgb_correlation(frame):
    """Calculate correlation coefficient between R, G, B channels"""
    try:
        # Split channels
        b, g, r = cv2.split(frame)
        
        # Flatten arrays for correlation calculation
        r_flat = r.flatten()
        g_flat = g.flatten()
        b_flat = b.flatten()
        
        # Calculate pairwise correlations
        corr_rg, _ = pearsonr(r_flat, g_flat)
        corr_rb, _ = pearsonr(r_flat, b_flat)
        corr_gb, _ = pearsonr(g_flat, b_flat)
        
        # Calculate mean correlation
        correlations = [abs(corr_rg), abs(corr_rb), abs(corr_gb)]
        mean_corr = np.mean(correlations)
        
        # Unnatural correlation patterns indicate synthetic generation
        # Very high correlation (>0.95) or very low correlation (<0.3) is suspicious
        if mean_corr > 0.95:
            return min(1.0, (mean_corr - 0.95) * 20)
        elif mean_corr < 0.3:
            return min(1.0, (0.3 - mean_corr) * 3)
        
        return 0.1  # Normal correlation range
    except:
        return 0.5

def analyze_channel_variance_ratio(frame):
    """Analyze variance ratios between color channels"""
    try:
        b, g, r = cv2.split(frame)
        
        # Calculate variance for each channel
        var_r = np.var(r)
        var_g = np.var(g)
        var_b = np.var(b)
        
        # Calculate variance ratios
        if var_g > 0 and var_b > 0:
            ratio_rg = var_r / var_g
            ratio_rb = var_r / var_b
            ratio_gb = var_g / var_b
            
            # Check for unnatural variance ratios
            ratios = [ratio_rg, ratio_rb, ratio_gb]
            max_ratio = max(ratios)
            min_ratio = min(ratios)
            
            # Large variance ratio differences indicate synthetic generation
            ratio_spread = max_ratio / min_ratio if min_ratio > 0 else 10
            
            return min(1.0, (ratio_spread - 1) / 10)
        
        return 0.5
    except:
        return 0.5

def analyze_color_distribution_uniformity(frame):
    """Analyze color distribution uniformity"""
    try:
        # Convert to different color spaces
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        
        # Analyze HSV distribution
        h, s, v = cv2.split(hsv)
        
        # Calculate histogram uniformity for each channel
        hist_h = cv2.calcHist([h], [0], None, [180], [0, 180])
        hist_s = cv2.calcHist([s], [0], None, [256], [0, 256])
        hist_v = cv2.calcHist([v], [0], None, [256], [0, 256])
        
        # Calculate uniformity (lower variance = more uniform = more suspicious)
        uniformity_h = 1 / (1 + np.var(hist_h))
        uniformity_s = 1 / (1 + np.var(hist_s))
        uniformity_v = 1 / (1 + np.var(hist_v))
        
        avg_uniformity = (uniformity_h + uniformity_s + uniformity_v) / 3
        
        return min(1.0, avg_uniformity * 1000)
    except:
        return 0.5

def detect_color_quantization(frame):
    """Detect color quantization artifacts"""
    try:
        b, g, r = cv2.split(frame)
        
        quantization_scores = []
        
        for channel in [r, g, b]:
            # Calculate histogram
            hist = cv2.calcHist([channel], [0], None, [256], [0, 256])
            
            # Find peaks in histogram (quantization levels)
            peaks = []
            for i in range(1, 255):
                if hist[i] > hist[i-1] and hist[i] > hist[i+1] and hist[i] > np.mean(hist) * 2:
                    peaks.append(i)
            
            # Calculate quantization score based on peak distribution
            if len(peaks) > 1:
                peak_distances = np.diff(peaks)
                # Regular spacing indicates quantization
                distance_variance = np.var(peak_distances)
                quantization_score = 1 / (1 + distance_variance)
            else:
                quantization_score = 0.1
            
            quantization_scores.append(quantization_score)
        
        return min(1.0, np.mean(quantization_scores) * 5)
    except:
        return 0.5

def analyze_color_temperature_consistency(frame):
    """Analyze color temperature consistency"""
    try:
        # Convert to LAB color space
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Calculate color temperature indicators
        # A channel: green-red axis
        # B channel: blue-yellow axis
        
        # Analyze spatial consistency of color temperature
        kernel_size = 32
        h, w = a.shape
        
        temp_variations = []
        
        for y in range(0, h - kernel_size, kernel_size // 2):
            for x in range(0, w - kernel_size, kernel_size // 2):
                block_a = a[y:y+kernel_size, x:x+kernel_size]
                block_b = b[y:y+kernel_size, x:x+kernel_size]
                
                # Calculate local color temperature
                mean_a = np.mean(block_a)
                mean_b = np.mean(block_b)
                
                # Color temperature indicator
                temp_indicator = np.sqrt((mean_a - 128)**2 + (mean_b - 128)**2)
                temp_variations.append(temp_indicator)
        
        if temp_variations:
            # High variance indicates inconsistent color temperature
            temp_variance = np.var(temp_variations)
            return min(1.0, temp_variance / 100)
        
        return 0.5
    except:
        return 0.5

def analyze_chromatic_aberration(frame):
    """Analyze chromatic aberration patterns"""
    try:
        b, g, r = cv2.split(frame)
        
        # Calculate edge maps for each channel
        edges_r = cv2.Canny(r, 50, 150)
        edges_g = cv2.Canny(g, 50, 150)
        edges_b = cv2.Canny(b, 50, 150)
        
        # Calculate edge alignment
        # Natural images have slight chromatic aberration
        # Synthetic images often have perfect alignment
        
        # XOR operations to find edge differences
        diff_rg = cv2.bitwise_xor(edges_r, edges_g)
        diff_rb = cv2.bitwise_xor(edges_r, edges_b)
        diff_gb = cv2.bitwise_xor(edges_g, edges_b)
        
        # Calculate difference ratios
        total_edges = np.sum(edges_r) + np.sum(edges_g) + np.sum(edges_b)
        
        if total_edges > 0:
            diff_ratio = (np.sum(diff_rg) + np.sum(diff_rb) + np.sum(diff_gb)) / total_edges
            
            # Very low difference indicates perfect alignment (suspicious)
            if diff_ratio < 0.1:
                return min(1.0, (0.1 - diff_ratio) * 10)
        
        return 0.2
    except:
        return 0.5

def analyze_color_correlation_artifacts(frames):
    """Main function to analyze color channel correlation"""
    try:
        if not frames:
            return 0.5
        
        scores = []
        
        # Sample frames for analysis
        sample_frames = frames[::max(1, len(frames)//5)][:5]
        
        for frame in sample_frames:
            # RGB correlation analysis
            rgb_score = analyze_rgb_correlation(frame)
            
            # Channel variance ratio analysis
            variance_score = analyze_channel_variance_ratio(frame)
            
            # Color distribution uniformity
            uniformity_score = analyze_color_distribution_uniformity(frame)
            
            # Color quantization detection
            quantization_score = detect_color_quantization(frame)
            
            # Color temperature consistency
            temp_score = analyze_color_temperature_consistency(frame)
            
            # Chromatic aberration analysis
            aberration_score = analyze_chromatic_aberration(frame)
            
            # Combine scores
            frame_score = (
                rgb_score + variance_score + uniformity_score + 
                quantization_score + temp_score + aberration_score
            ) / 6
            
            scores.append(frame_score)
        
        return np.mean(scores) if scores else 0.5
    except Exception as e:
        print(f"Color correlation analysis error: {e}")
        return 0.5

def analyze_color_space_consistency(frame):
    """Analyze consistency across different color spaces"""
    try:
        # Convert to multiple color spaces
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)
        
        # Analyze correlation between luminance channels
        # Y from YUV, L from LAB, V from HSV
        y_yuv = yuv[:,:,0].flatten()
        l_lab = lab[:,:,0].flatten()
        v_hsv = hsv[:,:,2].flatten()
        
        # Calculate correlations
        corr_yl, _ = pearsonr(y_yuv, l_lab)
        corr_yv, _ = pearsonr(y_yuv, v_hsv)
        corr_lv, _ = pearsonr(l_lab, v_hsv)
        
        # These should be highly correlated in natural images
        avg_corr = (abs(corr_yl) + abs(corr_yv) + abs(corr_lv)) / 3
        
        # Low correlation indicates inconsistent color space conversion
        if avg_corr < 0.7:
            return min(1.0, (0.7 - avg_corr) * 3)
        
        return 0.1
    except:
        return 0.5