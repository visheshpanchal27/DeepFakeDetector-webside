import cv2
import numpy as np
from PIL import Image

class PreprocessingPipeline:
    """Preprocessing pipeline to normalize inputs before forensic analysis"""
    
    def __init__(self):
        self.target_quality = 90
        self.min_resolution = 256
        self.target_resolution = 512
    
    def preprocess_image(self, image_path):
        """Comprehensive image preprocessing"""
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                return None, "Cannot load image"
            
            # Resolution check and enhancement
            h, w = img.shape[:2]
            if min(h, w) < self.min_resolution:
                if min(h, w) < 128:
                    return None, f"INCONCLUSIVE - Image too small ({w}x{h})"
                
                # Upscale small images
                scale_factor = self.target_resolution / min(h, w)
                new_w = int(w * scale_factor)
                new_h = int(h * scale_factor)
                img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
            
            # Compression normalization
            normalized_img = self.normalize_compression(img)
            
            # Color space normalization
            normalized_img = self.normalize_colorspace(normalized_img)
            
            return normalized_img, "Success"
            
        except Exception as e:
            return None, f"Preprocessing error: {str(e)}"
    
    def normalize_compression(self, image):
        """Normalize compression by recompressing at standard quality"""
        try:
            # Encode at target quality
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), self.target_quality]
            _, encoded_img = cv2.imencode('.jpg', image, encode_param)
            
            # Decode back
            normalized_img = cv2.imdecode(encoded_img, cv2.IMREAD_COLOR)
            
            return normalized_img if normalized_img is not None else image
            
        except:
            return image
    
    def normalize_colorspace(self, image):
        """Normalize color space and dynamic range"""
        try:
            # Convert to float for processing
            img_float = image.astype(np.float32) / 255.0
            
            # Gamma correction to linear RGB
            img_linear = np.power(img_float, 2.2)
            
            # Normalize dynamic range
            img_normalized = cv2.normalize(img_linear, None, 0, 1, cv2.NORM_MINMAX)
            
            # Convert back to uint8
            img_final = (img_normalized * 255).astype(np.uint8)
            
            return img_final
            
        except:
            return image