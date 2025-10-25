import cv2
import numpy as np
from core.detection_config import DETECTION_CONFIG

def analyze_optical_flow(frames):
    if len(frames) < 2:
        return 0.5
    
    flow_magnitudes = []
    prev_gray = cv2.cvtColor(frames[0], cv2.COLOR_BGR2GRAY)
    
    for frame in frames[1::2]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        flow = cv2.calcOpticalFlowFarneback(prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        
        magnitude, angle = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        flow_magnitudes.append(np.mean(magnitude))
        prev_gray = gray
    
    if len(flow_magnitudes) == 0:
        return 0.5
    
    avg_flow = np.mean(flow_magnitudes)
    flow_variance = np.var(flow_magnitudes)
    
    # Natural motion: consistent flow, moderate variance
    if 1.0 <= avg_flow <= 8.0 and flow_variance < 15:
        return 0.9
    elif avg_flow > 15 or flow_variance > 30:
        return 0.3  # Unnatural motion
    else:
        return 0.6

def analyze_frame_consistency(frames):
    if len(frames) < 3:
        return 0.5
    
    frame_diffs = []
    
    for i in range(len(frames) - 1):
        gray1 = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(frames[i+1], cv2.COLOR_BGR2GRAY)
        diff = cv2.absdiff(gray1, gray2)
        frame_diffs.append(np.mean(diff))
    
    diff_variance = np.var(frame_diffs)
    avg_diff = np.mean(frame_diffs)
    
    # Natural: smooth transitions
    if 2 <= avg_diff <= 20 and diff_variance < 100:
        return 0.9
    elif avg_diff > 40 or diff_variance > 200:
        return 0.3  # Abrupt changes (deepfake)
    else:
        return 0.6

def detect_temporal_artifacts(frames):
    if len(frames) < 5:
        return 0.5
    
    # Check for periodic patterns (GAN artifacts)
    brightness_values = [np.mean(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)) for f in frames]
    
    fft = np.fft.fft(brightness_values)
    power = np.abs(fft) ** 2
    
    # Detect strong periodic components
    peak_power = np.max(power[1:len(power)//2])
    avg_power = np.mean(power[1:len(power)//2])
    
    if peak_power > 5 * avg_power:
        return 0.2  # Strong periodicity (deepfake)
    elif peak_power > 3 * avg_power:
        return 0.5
    else:
        return 0.9
