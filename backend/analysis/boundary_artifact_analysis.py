import cv2
import numpy as np
from skimage.feature import local_binary_pattern

def analyze_color_gradient_discontinuity(frame):
    """Check gradient discontinuity between face & background"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return 0.5
        
        x, y, w, h = faces[0]
        
        # Create boundary mask (edge of face region)
        mask = np.zeros(gray.shape, dtype=np.uint8)
        cv2.rectangle(mask, (x, y), (x+w, y+h), 255, -1)
        
        # Erode to get boundary
        kernel = np.ones((5,5), np.uint8)
        eroded = cv2.erode(mask, kernel, iterations=1)
        boundary_mask = mask - eroded
        
        # Calculate gradient
        grad = cv2.Laplacian(gray, cv2.CV_64F)
        boundary_score = np.mean(np.abs(grad[boundary_mask > 0]))
        
        # Normalize (higher = more suspicious)
        return min(1.0, boundary_score / 50)
    except:
        return 0.5

def detect_texture_mismatch_lbp(frame):
    """Detect texture mismatch using Local Binary Patterns"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return 0.5
        
        x, y, w, h = faces[0]
        
        # Extract face and background regions
        face_region = gray[y:y+h, x:x+w]
        
        # Background region (avoid face area)
        bg_mask = np.ones(gray.shape, dtype=np.uint8)
        bg_mask[y:y+h, x:x+w] = 0
        bg_region = gray[bg_mask > 0]
        
        if len(bg_region) < 100:
            return 0.5
        
        # Calculate LBP for both regions
        lbp_face = local_binary_pattern(face_region, 8, 1, method='uniform')
        
        # Sample background region
        bg_sample = bg_region[:face_region.size].reshape(face_region.shape)
        lbp_bg = local_binary_pattern(bg_sample, 8, 1, method='uniform')
        
        # Compare texture patterns
        face_hist, _ = np.histogram(lbp_face.ravel(), bins=10, range=(0, 9))
        bg_hist, _ = np.histogram(lbp_bg.ravel(), bins=10, range=(0, 9))
        
        # Normalize histograms
        face_hist = face_hist / face_hist.sum()
        bg_hist = bg_hist / bg_hist.sum()
        
        # Calculate difference
        texture_diff = np.sum(np.abs(face_hist - bg_hist))
        
        return min(1.0, texture_diff / 2)
    except:
        return 0.5

def analyze_edge_sharpness_transition(frame):
    """Analyze edge sharpness at face boundaries"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return 0.5
        
        x, y, w, h = faces[0]
        
        # Create expanded boundary region
        boundary_width = 10
        x1 = max(0, x - boundary_width)
        y1 = max(0, y - boundary_width)
        x2 = min(gray.shape[1], x + w + boundary_width)
        y2 = min(gray.shape[0], y + h + boundary_width)
        
        boundary_region = gray[y1:y2, x1:x2]
        
        # Calculate edge strength using Sobel
        sobel_x = cv2.Sobel(boundary_region, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(boundary_region, cv2.CV_64F, 0, 1, ksize=3)
        edge_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
        
        # Analyze edge sharpness variance
        edge_variance = np.var(edge_magnitude)
        
        # High variance indicates unnatural edges
        return min(1.0, edge_variance / 1000)
    except:
        return 0.5

def detect_blending_artifacts(frame):
    """Detect blending artifacts around face region"""
    try:
        # Convert to different color spaces for analysis
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return 0.5
        
        x, y, w, h = faces[0]
        
        # Analyze color consistency in LAB space
        l_channel = lab[:,:,0]
        face_l = l_channel[y:y+h, x:x+w]
        
        # Calculate local variance in lightness
        kernel = np.ones((5,5), np.float32) / 25
        l_smooth = cv2.filter2D(l_channel, -1, kernel)
        l_variance = np.abs(l_channel - l_smooth)
        
        # Focus on face boundary variance
        boundary_variance = np.mean(l_variance[y:y+h, x:x+w])
        
        # Normalize
        return min(1.0, boundary_variance / 20)
    except:
        return 0.5

def analyze_frequency_domain_artifacts(frame):
    """Analyze frequency domain for boundary artifacts"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return 0.5
        
        x, y, w, h = faces[0]
        
        # Extract face region
        face_region = gray[y:y+h, x:x+w]
        
        # Apply FFT
        f_transform = np.fft.fft2(face_region)
        f_shift = np.fft.fftshift(f_transform)
        magnitude = np.abs(f_shift)
        
        # Analyze high frequency components
        rows, cols = magnitude.shape
        center_row, center_col = rows // 2, cols // 2
        
        # Create high-pass filter
        mask = np.ones((rows, cols), np.uint8)
        r = min(rows, cols) // 4
        cv2.circle(mask, (center_col, center_row), r, 0, -1)
        
        # Apply mask and calculate high frequency energy
        high_freq = magnitude * mask
        high_freq_energy = np.sum(high_freq)
        total_energy = np.sum(magnitude)
        
        # Calculate ratio
        if total_energy > 0:
            high_freq_ratio = high_freq_energy / total_energy
            return min(1.0, high_freq_ratio * 10)
        
        return 0.5
    except:
        return 0.5

def analyze_boundary_artifacts(frames):
    """Main function to analyze boundary artifacts"""
    try:
        if not frames:
            return 0.5
        
        scores = []
        
        # Sample frames for analysis
        sample_frames = frames[::max(1, len(frames)//5)][:5]
        
        for frame in sample_frames:
            # Color gradient analysis
            gradient_score = analyze_color_gradient_discontinuity(frame)
            
            # Texture mismatch analysis
            texture_score = detect_texture_mismatch_lbp(frame)
            
            # Edge sharpness analysis
            edge_score = analyze_edge_sharpness_transition(frame)
            
            # Blending artifacts
            blend_score = detect_blending_artifacts(frame)
            
            # Frequency domain analysis
            freq_score = analyze_frequency_domain_artifacts(frame)
            
            # Combine scores
            frame_score = (gradient_score + texture_score + edge_score + blend_score + freq_score) / 5
            scores.append(frame_score)
        
        return np.mean(scores) if scores else 0.5
    except Exception as e:
        print(f"Boundary artifact analysis error: {e}")
        return 0.5