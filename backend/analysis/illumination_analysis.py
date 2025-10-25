import cv2
import numpy as np
from scipy.stats import entropy

def color_histogram_difference(face, background):
    """Compare face region histogram with background"""
    try:
        hist_face = cv2.calcHist([face], [0,1,2], None, [8,8,8], [0,256,0,256,0,256])
        hist_bg = cv2.calcHist([background], [0,1,2], None, [8,8,8], [0,256,0,256,0,256])
        diff = cv2.compareHist(hist_face, hist_bg, cv2.HISTCMP_CORREL)
        return max(0, min(1, 1 - diff))  # Higher = more suspicious
    except:
        return 0.5

def detect_specular_highlights(frame):
    """Detect unrealistic light reflections on skin"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Find bright spots
        _, bright = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(bright, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Calculate highlight ratio
        total_area = frame.shape[0] * frame.shape[1]
        highlight_area = sum(cv2.contourArea(c) for c in contours)
        highlight_ratio = highlight_area / total_area
        
        # Suspicious if too many or too few highlights
        if highlight_ratio > 0.1 or highlight_ratio < 0.001:
            return min(1.0, highlight_ratio * 10)
        return 0.2
    except:
        return 0.5

def analyze_shadow_direction(frame):
    """Check shadow direction consistency"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect edges for shadow analysis
        edges = cv2.Canny(gray, 50, 150)
        
        # Use Hough lines to detect shadow directions
        lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
        
        if lines is None or len(lines) < 5:
            return 0.3
        
        # Calculate angle variance
        angles = [line[0][1] for line in lines]
        angle_variance = np.var(angles)
        
        # High variance indicates inconsistent shadows
        return min(1.0, angle_variance / (np.pi/4))
    except:
        return 0.5

def analyze_color_temperature(frame):
    """Analyze color temperature consistency"""
    try:
        # Convert to LAB color space
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        
        # Extract A and B channels (color information)
        a_channel = lab[:,:,1]
        b_channel = lab[:,:,2]
        
        # Calculate color temperature indicators
        a_mean = np.mean(a_channel)
        b_mean = np.mean(b_channel)
        
        # Check for unnatural color shifts
        color_shift = np.sqrt((a_mean - 128)**2 + (b_mean - 128)**2)
        
        # Normalize to 0-1 range
        return min(1.0, color_shift / 50)
    except:
        return 0.5

def analyze_illumination_consistency(frames):
    """Analyze illumination consistency across frames"""
    try:
        if len(frames) < 2:
            return 0.5
        
        illumination_scores = []
        
        for i in range(min(10, len(frames))):  # Sample frames
            frame = frames[i]
            
            # Face detection for region analysis
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                x, y, w, h = faces[0]
                face_region = frame[y:y+h, x:x+w]
                
                # Background region (avoid face area)
                mask = np.ones(frame.shape[:2], dtype=np.uint8) * 255
                mask[y:y+h, x:x+w] = 0
                background = cv2.bitwise_and(frame, frame, mask=mask)
                background = background[mask > 0].reshape(-1, 3)
                
                if len(background) > 100:
                    # Color histogram analysis
                    hist_score = color_histogram_difference(face_region, background)
                    
                    # Specular highlight analysis
                    highlight_score = detect_specular_highlights(face_region)
                    
                    # Color temperature analysis
                    temp_score = analyze_color_temperature(face_region)
                    
                    # Shadow direction analysis
                    shadow_score = analyze_shadow_direction(frame)
                    
                    # Combine scores
                    combined_score = (hist_score + highlight_score + temp_score + shadow_score) / 4
                    illumination_scores.append(combined_score)
        
        if illumination_scores:
            return np.mean(illumination_scores)
        return 0.5
    except Exception as e:
        print(f"Illumination analysis error: {e}")
        return 0.5

def analyze_lighting_direction(frame):
    """Analyze lighting direction consistency"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Calculate gradient to find lighting direction
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        
        # Calculate gradient magnitude and direction
        magnitude = np.sqrt(grad_x**2 + grad_y**2)
        direction = np.arctan2(grad_y, grad_x)
        
        # Analyze direction consistency
        direction_variance = np.var(direction[magnitude > np.mean(magnitude)])
        
        # High variance indicates inconsistent lighting
        return min(1.0, direction_variance / (np.pi/2))
    except:
        return 0.5