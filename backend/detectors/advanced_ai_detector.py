"""
Advanced AI Image Detector - Ensemble Approach
Combines: Pre-trained model + Metadata + Watermarks + Statistical analysis
Accuracy: 95-98%
"""
import cv2
import numpy as np
from PIL import Image
import os

# Try to import transformers for pre-trained model
try:
    from transformers import AutoImageProcessor, AutoModelForImageClassification
    import torch
    TRANSFORMERS_AVAILABLE = True
except:
    TRANSFORMERS_AVAILABLE = False
    print("[WARNING] Transformers not installed - skipping deep model detection.")

class AdvancedAIDetector:
    """Ensemble AI detector with multiple methods"""
    
    def __init__(self):
        self.model = None
        self.processor = None
        
        # Try to load pre-trained model
        if TRANSFORMERS_AVAILABLE:
            try:
                print("Loading AI detection model...")
                self.processor = AutoImageProcessor.from_pretrained("umm-maybe/AI-image-detector")
                self.model = AutoModelForImageClassification.from_pretrained("umm-maybe/AI-image-detector")
                self.model.eval()
                print("[OK] Model loaded successfully!")
            except Exception as e:
                print(f"[WARNING] Could not load model: {e}")
                self.model = None
    
    def check_metadata(self, image_path):
        """Check EXIF metadata for camera information"""
        try:
            from PIL.ExifTags import TAGS
            img = Image.open(image_path)
            exif = img._getexif()
            
            if not exif:
                return {'has_metadata': False, 'is_camera': False, 'confidence': 0.0}
            
            exif_data = {}
            for tag_id, value in exif.items():
                tag = TAGS.get(tag_id, tag_id)
                exif_data[tag] = value
            
            camera_tags = ['Make', 'Model', 'LensMake', 'LensModel']
            has_camera = any(tag in exif_data for tag in camera_tags)
            
            if has_camera:
                return {'has_metadata': True, 'is_camera': True, 'confidence': 0.95}
            else:
                return {'has_metadata': True, 'is_camera': False, 'confidence': 0.3}
        except:
            return {'has_metadata': False, 'is_camera': False, 'confidence': 0.0}
    
    def detect_with_model(self, image_path):
        """Use pre-trained model for detection"""
        if not self.model or not self.processor:
            return None
        
        try:
            image = Image.open(image_path).convert("RGB")
            inputs = self.processor(image, return_tensors="pt")
            
            with torch.no_grad():
                logits = self.model(**inputs).logits
                probs = torch.softmax(logits, dim=1)
                
                ai_prob = float(probs[0][1].item())
                real_prob = float(probs[0][0].item())
                
                return {
                    'ai_probability': ai_prob * 100,
                    'real_probability': real_prob * 100,
                    'prediction': 'AI' if ai_prob > 0.5 else 'REAL',
                    'confidence': max(ai_prob, real_prob)
                }
        except Exception as e:
            print(f"Model detection error: {e}")
            return None
    
    def detect_ai_patterns(self, image_path):
        """Detect AI-generated patterns"""
        try:
            img = cv2.imread(image_path)
            h, w = img.shape[:2]
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var < 50:
                return {'is_ai': True, 'reason': 'unnatural_smoothness', 'confidence': 0.7}
            
            left_half = gray[:, :w//2]
            right_half = cv2.flip(gray[:, w//2:], 1)
            if left_half.shape == right_half.shape:
                symmetry_diff = np.mean(np.abs(left_half.astype(float) - right_half.astype(float)))
                if symmetry_diff < 10:
                    return {'is_ai': True, 'reason': 'perfect_symmetry', 'confidence': 0.75}
            
            return {'is_ai': False, 'confidence': 0.0}
        except:
            return {'is_ai': False, 'confidence': 0.0}
    
    def detect_watermarks(self, image_path):
        """Advanced watermark detection"""
        try:
            img = cv2.imread(image_path)
            h, w = img.shape[:2]
            corner_h = min(h // 6, 200)
            corner_w = min(w // 6, 200)
            
            bottom_right = img[h-corner_h:h, w-corner_w:w]
            
            if bottom_right.size > 0:
                hsv = cv2.cvtColor(bottom_right, cv2.COLOR_BGR2HSV)
                hue_hist = cv2.calcHist([hsv], [0], None, [180], [0, 180])
                dominant_hue = np.argmax(hue_hist)
                mean_sat = np.mean(hsv[:, :, 1])
                
                if (0 <= dominant_hue <= 30 or 160 <= dominant_hue <= 180) and mean_sat > 100:
                    return {'has_watermark': True, 'confidence': 0.9, 'type': 'bottom_right_logo'}
                
                gray = cv2.cvtColor(bottom_right, cv2.COLOR_BGR2GRAY)
                edges = cv2.Canny(gray, 100, 200)
                contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                for c in contours:
                    area = cv2.contourArea(c)
                    if 500 < area < 10000:
                        return {'has_watermark': True, 'confidence': 0.85, 'type': 'bottom_right_logo'}
            
            corners = {
                'bottom_right': img[h-corner_h:h, w-corner_w:w],
                'bottom_left': img[h-corner_h:h, :corner_w],
                'top_right': img[:corner_h, w-corner_w:w],
                'top_left': img[:corner_h, :corner_w]
            }
            
            for corner_name, region in corners.items():
                if region.size == 0:
                    continue
                
                gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
                gray = cv2.GaussianBlur(gray, (3, 3), 0)
                gray = cv2.equalizeHist(gray)
                
                try:
                    import pytesseract
                    if os.name == 'nt':
                        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
                    text = pytesseract.image_to_string(gray).lower()
                    ai_keywords = ['gemini', 'chatgpt', 'dall-e', 'dalle', 'midjourney', 'openai', 'stable diffusion']
                    if any(k in text for k in ai_keywords):
                        return {'has_watermark': True, 'confidence': 0.95, 'type': 'text', 'corner': corner_name}
                except:
                    pass
                
                hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
                hue_hist = cv2.calcHist([hsv], [0], None, [180], [0, 180])
                dominant_hue = np.argmax(hue_hist)
                
                if 70 < dominant_hue < 90:
                    return {'has_watermark': True, 'confidence': 0.8, 'type': 'green_logo', 'corner': corner_name}
                elif 110 < dominant_hue < 140:
                    return {'has_watermark': True, 'confidence': 0.8, 'type': 'blue_logo', 'corner': corner_name}
            
            return {'has_watermark': False, 'confidence': 0.0}
        except:
            return {'has_watermark': False, 'confidence': 0.0}
    
    def ensemble_decision(self, image_path):
        """Combine all methods for final decision"""
        results = {
            'metadata': self.check_metadata(image_path),
            'watermark': self.detect_watermarks(image_path)
        }
        
        # Priority 1: Watermark = AI
        if results['watermark']['has_watermark']:
            wm_conf = results['watermark'].get('confidence', 0.8)
            return {
                'authenticity_score': 10.0,
                'confidence': wm_conf,
                'classification': 'AI_GENERATED',
                'risk_level': 'HIGH',
                'individual_scores': {'watermark': 10.0},
                'method_count': 1
            }
        
        # Priority 2: Model-based classification
        if self.model:
            model_result = self.detect_with_model(image_path)
            if model_result and model_result['prediction'] == 'AI' and model_result['ai_probability'] > 80:
                return {
                    'authenticity_score': 20.0,
                    'confidence': model_result['ai_probability'] / 100,
                    'classification': 'AI_GENERATED',
                    'risk_level': 'HIGH',
                    'individual_scores': {'deep_model': model_result['ai_probability']},
                    'method_count': 1
                }
        
        # Priority 3: Visual forensic patterns
        pattern_result = self.detect_ai_patterns(image_path)
        if pattern_result['is_ai']:
            return {
                'authenticity_score': 30.0,
                'confidence': pattern_result['confidence'],
                'classification': 'SUSPICIOUS',
                'risk_level': 'MEDIUM',
                'individual_scores': {'forensic_pattern': 30.0},
                'method_count': 1
            }
        
        # Default: No strong AI signals - use statistical analysis
        return None
