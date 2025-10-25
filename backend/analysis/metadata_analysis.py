import os
import cv2
import numpy as np
import hashlib

def analyze_metadata(file_path):
    try:
        stat = os.stat(file_path)
        file_size = stat.st_size
        
        # Read file header
        with open(file_path, 'rb') as f:
            header = f.read(1024)
            header_hash = hashlib.md5(header).hexdigest()
        
        # Check for suspicious patterns
        score = 0.7
        
        # Unusual file size patterns
        if file_size % 1024 == 0:
            score -= 0.1  # Suspiciously round
        
        return max(0.3, min(0.9, score))
    except:
        return 0.5

def analyze_video_metadata(video_path):
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()
        
        score = 0.7
        
        # Check for unusual properties
        if fps < 15 or fps > 120:
            score -= 0.2
        
        if width % 16 != 0 or height % 16 != 0:
            score -= 0.1  # Non-standard resolution
        
        if frame_count < 30:
            score -= 0.1  # Too short
        
        return max(0.3, min(0.9, score))
    except:
        return 0.5

def detect_double_compression(video_path):
    try:
        cap = cv2.VideoCapture(video_path)
        ret, frame1 = cap.read()
        
        if not ret:
            cap.release()
            return 0.5
        
        # Skip some frames
        for _ in range(10):
            cap.read()
        
        ret, frame2 = cap.read()
        cap.release()
        
        if not ret:
            return 0.5
        
        # Analyze compression artifacts in both frames
        gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
        
        # DCT analysis
        dct1 = cv2.dct(np.float32(gray1) / 255.0)
        dct2 = cv2.dct(np.float32(gray2) / 255.0)
        
        # Check for double quantization patterns
        dct1_hist = np.histogram(dct1.flatten(), bins=50)[0]
        dct2_hist = np.histogram(dct2.flatten(), bins=50)[0]
        
        correlation = np.corrcoef(dct1_hist, dct2_hist)[0, 1]
        
        # High correlation suggests consistent compression (natural)
        if correlation > 0.8:
            return 0.9
        elif correlation < 0.5:
            return 0.3  # Inconsistent (manipulated)
        else:
            return 0.6
    except:
        return 0.5

def check_exif_consistency(file_path):
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS
        
        img = Image.open(file_path)
        exif = img._getexif()
        
        if exif is None:
            return 0.5  # No EXIF (suspicious but not conclusive)
        
        # Check for common manipulation signs
        score = 0.8
        
        exif_dict = {TAGS.get(k, k): v for k, v in exif.items()}
        
        # Check software tags
        if 'Software' in exif_dict:
            software = exif_dict['Software'].lower()
            if any(x in software for x in ['photoshop', 'gimp', 'paint']):
                score -= 0.2
        
        return max(0.3, min(0.9, score))
    except:
        return 0.5
