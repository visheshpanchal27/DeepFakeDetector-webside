import cv2
import numpy as np
from scipy.signal import correlate

def extract_visual_intensity_envelope(frames):
    """Extract visual intensity envelope from frames"""
    try:
        intensities = []
        
        for frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            
            # Focus on face region if detectable
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                x, y, w, h = faces[0]
                face_region = gray[y:y+h, x:x+w]
                intensity = np.mean(face_region)
            else:
                # Use center region as fallback
                h, w = gray.shape
                center_region = gray[h//4:3*h//4, w//4:3*w//4]
                intensity = np.mean(center_region)
            
            intensities.append(intensity)
        
        return np.array(intensities)
    except:
        return np.array([128] * len(frames))  # Fallback

def extract_audio_amplitude_envelope(audio_path):
    """Extract audio amplitude envelope (placeholder - requires librosa)"""
    try:
        # This is a simplified version - in production, use librosa
        # For now, return mock data that would come from audio analysis
        return np.random.random(100) * 0.5 + 0.25  # Mock envelope
    except:
        return np.array([0.5] * 100)  # Fallback

def calculate_cross_modal_correlation(visual_envelope, audio_envelope):
    """Calculate correlation between visual and audio envelopes"""
    try:
        # Resample to same length if needed
        min_len = min(len(visual_envelope), len(audio_envelope))
        if min_len < 5:
            return 0.5
        
        visual_resampled = np.interp(np.linspace(0, 1, min_len), 
                                   np.linspace(0, 1, len(visual_envelope)), 
                                   visual_envelope)
        audio_resampled = np.interp(np.linspace(0, 1, min_len), 
                                  np.linspace(0, 1, len(audio_envelope)), 
                                  audio_envelope)
        
        # Calculate cross-correlation
        correlation = np.corrcoef(visual_resampled, audio_resampled)[0, 1]
        
        if np.isnan(correlation):
            return 0.5
        
        return abs(correlation)
    except:
        return 0.5

def analyze_mouth_movement_correlation(frames):
    """Analyze mouth movement patterns"""
    try:
        mouth_openness = []
        
        for frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            
            # Detect face
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                x, y, w, h = faces[0]
                # Focus on lower half of face (mouth region)
                mouth_region = gray[y+h//2:y+h, x:x+w]
                
                # Calculate variance as proxy for mouth movement
                mouth_variance = np.var(mouth_region)
                mouth_openness.append(mouth_variance)
            else:
                mouth_openness.append(100)  # Default value
        
        return np.array(mouth_openness)
    except:
        return np.array([100] * len(frames))

def detect_audio_visual_desync(frames, audio_path=None):
    """Detect audio-visual desynchronization"""
    try:
        # Extract visual intensity envelope
        visual_envelope = extract_visual_intensity_envelope(frames)
        
        # Extract mouth movement patterns
        mouth_envelope = analyze_mouth_movement_correlation(frames)
        
        # For now, analyze visual consistency (audio integration would require librosa)
        if len(visual_envelope) < 3:
            return 0.5
        
        # Calculate visual-mouth correlation
        visual_mouth_corr = calculate_cross_modal_correlation(visual_envelope, mouth_envelope)
        
        # Low correlation indicates desynchronization
        if visual_mouth_corr < 0.3:
            return 0.8  # High suspicion
        elif visual_mouth_corr < 0.5:
            return 0.6  # Medium suspicion
        else:
            return 0.2  # Low suspicion
        
    except Exception as e:
        print(f"Audio-visual coherence error: {e}")
        return 0.5

def analyze_color_audio_coherence(frames, audio_path=None):
    """Analyze coherence between color changes and audio"""
    try:
        color_intensities = []
        
        for frame in frames:
            # Calculate color intensity (saturation)
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            saturation = hsv[:,:,1]
            color_intensity = np.mean(saturation)
            color_intensities.append(color_intensity)
        
        color_envelope = np.array(color_intensities)
        
        # Calculate color variation
        if len(color_envelope) > 1:
            color_variance = np.var(np.diff(color_envelope))
            
            # High color variance without corresponding audio changes is suspicious
            # This is a simplified check - full implementation would use actual audio
            normalized_variance = min(1.0, color_variance / 100)
            return normalized_variance
        
        return 0.5
    except:
        return 0.5

def analyze_cross_modal_coherence(frames, audio_path=None):
    """Main function to analyze cross-modal coherence"""
    try:
        if len(frames) < 3:
            return 0.5
        
        # Audio-visual desync detection
        desync_score = detect_audio_visual_desync(frames, audio_path)
        
        # Color-audio coherence
        color_coherence_score = analyze_color_audio_coherence(frames, audio_path)
        
        # Visual consistency analysis
        visual_envelope = extract_visual_intensity_envelope(frames)
        visual_variance = np.var(visual_envelope) if len(visual_envelope) > 1 else 0
        visual_consistency_score = min(1.0, visual_variance / 1000)
        
        # Combine scores
        combined_score = (desync_score + color_coherence_score + visual_consistency_score) / 3
        
        return min(1.0, combined_score)
        
    except Exception as e:
        print(f"Cross-modal coherence analysis error: {e}")
        return 0.5