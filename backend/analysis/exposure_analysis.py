import cv2
import numpy as np
from scipy import stats

def estimate_gamma_curve(image):
    """Estimate gamma curve from image histogram"""
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Calculate histogram
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        
        # Find non-zero bins
        non_zero = hist > 0
        intensities = np.arange(256)[non_zero.flatten()]
        counts = hist[non_zero]
        
        if len(intensities) < 10:
            return 1.0  # Default gamma
        
        # Fit power law (gamma curve) using log-log regression
        log_intensities = np.log(intensities + 1)
        log_counts = np.log(counts.flatten() + 1)
        
        # Linear regression in log space
        slope, intercept, r_value, p_value, std_err = stats.linregress(log_intensities, log_counts)
        
        # Gamma is related to the slope
        gamma = abs(slope)
        
        # Clamp gamma to reasonable range
        return max(0.1, min(3.0, gamma))
    except:
        return 1.0

def analyze_exposure_consistency(frames):
    """Analyze exposure consistency across frames"""
    try:
        if len(frames) < 2:
            return 0.5
        
        exposures = []
        
        # Calculate exposure metrics for sample frames
        sample_frames = frames[::max(1, len(frames)//10)][:10]
        
        for frame in sample_frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            
            # Calculate mean brightness as exposure proxy
            mean_brightness = np.mean(gray)
            exposures.append(mean_brightness)
        
        if len(exposures) < 2:
            return 0.5
        
        # Calculate coefficient of variation
        mean_exp = np.mean(exposures)
        std_exp = np.std(exposures)
        
        if mean_exp > 0:
            cv_exposure = std_exp / mean_exp
            # High variation indicates inconsistent exposure
            return min(1.0, cv_exposure * 5)
        
        return 0.5
    except:
        return 0.5

def analyze_gamma_consistency(frames):
    """Analyze gamma curve consistency across frames"""
    try:
        if len(frames) < 3:
            return 0.5
        
        gamma_values = []
        
        # Sample frames for gamma analysis
        sample_frames = frames[::max(1, len(frames)//8)][:8]
        
        for frame in sample_frames:
            gamma = estimate_gamma_curve(frame)
            gamma_values.append(gamma)
        
        if len(gamma_values) < 2:
            return 0.5
        
        # Calculate gamma variance
        gamma_variance = np.var(gamma_values)
        
        # High variance indicates inconsistent gamma (suspicious)
        return min(1.0, gamma_variance * 2)
    except:
        return 0.5

def detect_exposure_shifts(frames):
    """Detect sudden exposure shifts between frames"""
    try:
        if len(frames) < 2:
            return 0.5
        
        brightness_diffs = []
        
        for i in range(1, min(len(frames), 20)):
            gray1 = cv2.cvtColor(frames[i-1], cv2.COLOR_BGR2GRAY) if len(frames[i-1].shape) == 3 else frames[i-1]
            gray2 = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY) if len(frames[i].shape) == 3 else frames[i]
            
            brightness1 = np.mean(gray1)
            brightness2 = np.mean(gray2)
            
            # Calculate relative brightness change
            if brightness1 > 0:
                diff = abs(brightness2 - brightness1) / brightness1
                brightness_diffs.append(diff)
        
        if not brightness_diffs:
            return 0.5
        
        # Calculate number of sudden shifts
        sudden_shifts = sum(1 for diff in brightness_diffs if diff > 0.2)
        shift_ratio = sudden_shifts / len(brightness_diffs)
        
        # High ratio of sudden shifts is suspicious
        return min(1.0, shift_ratio * 3)
    except:
        return 0.5

def analyze_histogram_consistency(frames):
    """Analyze histogram shape consistency across frames"""
    try:
        if len(frames) < 3:
            return 0.5
        
        histograms = []
        
        # Calculate histograms for sample frames
        sample_frames = frames[::max(1, len(frames)//6)][:6]
        
        for frame in sample_frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            hist = cv2.calcHist([gray], [0], None, [64], [0, 256])  # Reduced bins for stability
            hist_norm = hist / (hist.sum() + 1e-10)  # Normalize
            histograms.append(hist_norm.flatten())
        
        if len(histograms) < 2:
            return 0.5
        
        # Calculate pairwise correlations
        correlations = []
        for i in range(len(histograms)):
            for j in range(i+1, len(histograms)):
                corr = np.corrcoef(histograms[i], histograms[j])[0, 1]
                if not np.isnan(corr):
                    correlations.append(abs(corr))
        
        if correlations:
            avg_correlation = np.mean(correlations)
            # Low correlation indicates inconsistent histograms
            return max(0, 1 - avg_correlation)
        
        return 0.5
    except:
        return 0.5