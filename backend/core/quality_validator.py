import cv2
import numpy as np
from PIL import Image
import os

class QualityValidator:
    """Validates input quality and determines analysis feasibility"""
    
    def __init__(self):
        self.min_size = 256
        self.min_quality = 40
        self.max_compression_ratio = 50
    
    def validate_input(self, file_path):
        """Comprehensive input validation"""
        try:
            # Basic file checks
            if not os.path.exists(file_path):
                return False, "File not found"
            
            # Load image
            img = cv2.imread(file_path)
            if img is None:
                return False, "Cannot read image"
            
            h, w = img.shape[:2]
            
            # Size validation
            if min(h, w) < self.min_size:
                return False, f"INCONCLUSIVE - Image too small ({w}x{h}), minimum {self.min_size}px required"
            
            # Quality validation
            quality_score = self.estimate_jpeg_quality(file_path)
            if quality_score < self.min_quality:
                return False, f"INCONCLUSIVE - Image quality too low (Q={quality_score}), minimum Q={self.min_quality} required"
            
            # Compression validation
            compression_ratio = self.estimate_compression_ratio(file_path, img)
            if compression_ratio > self.max_compression_ratio:
                return False, f"INCONCLUSIVE - Excessive compression (ratio={compression_ratio:.1f}), analysis unreliable"
            
            return True, {
                'size': (w, h),
                'quality': quality_score,
                'compression_ratio': compression_ratio,
                'file_size': os.path.getsize(file_path)
            }
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    def estimate_jpeg_quality(self, file_path):
        """Estimate JPEG quality factor"""
        try:
            # Try to get quality from PIL
            img = Image.open(file_path)
            
            # Check quantization tables if available
            if hasattr(img, 'quantization') and img.quantization:
                qtables = img.quantization
                if qtables:
                    # Estimate quality from first quantization table
                    q1 = list(qtables.values())[0]
                    
                    # Standard JPEG quality estimation
                    # Based on the first few coefficients of the quantization table
                    if len(q1) >= 8:
                        # Use luminance table coefficients
                        q_factor = q1[0]  # DC coefficient
                        
                        # Rough quality estimation
                        if q_factor <= 2:
                            return 95
                        elif q_factor <= 4:
                            return 85
                        elif q_factor <= 8:
                            return 75
                        elif q_factor <= 16:
                            return 65
                        elif q_factor <= 32:
                            return 50
                        else:
                            return 30
            
            # Fallback: estimate from file size ratio
            img_cv = cv2.imread(file_path)
            if img_cv is not None:
                h, w = img_cv.shape[:2]
                file_size = os.path.getsize(file_path)
                
                # Rough estimation based on compression ratio
                uncompressed_size = h * w * 3  # RGB
                compression_ratio = file_size / uncompressed_size
                
                if compression_ratio > 0.3:
                    return 90
                elif compression_ratio > 0.15:
                    return 75
                elif compression_ratio > 0.08:
                    return 60
                elif compression_ratio > 0.04:
                    return 45
                else:
                    return 30
            
            return 70  # Default assumption
            
        except:
            return 70  # Default assumption
    
    def estimate_compression_ratio(self, file_path, img):
        """Estimate compression ratio"""
        try:
            h, w = img.shape[:2]
            file_size = os.path.getsize(file_path)
            
            # Calculate theoretical uncompressed size
            uncompressed_size = h * w * 3  # RGB
            
            # Compression ratio
            ratio = uncompressed_size / file_size if file_size > 0 else 1
            
            return ratio
            
        except:
            return 10  # Default safe value
    
    def check_metadata_availability(self, file_path):
        """Check what metadata is available"""
        try:
            metadata_info = {
                'has_exif': False,
                'has_quantization': False,
                'metadata_score': 0.0
            }
            
            img = Image.open(file_path)
            
            # Check EXIF data
            if hasattr(img, '_getexif') and img._getexif():
                metadata_info['has_exif'] = True
                metadata_info['metadata_score'] += 0.5
            
            # Check quantization tables
            if hasattr(img, 'quantization') and img.quantization:
                metadata_info['has_quantization'] = True
                metadata_info['metadata_score'] += 0.5
            
            return metadata_info
            
        except:
            return {
                'has_exif': False,
                'has_quantization': False,
                'metadata_score': 0.0
            }
    
    def should_use_conservative_thresholds(self, validation_result):
        """Determine if conservative thresholds should be used"""
        if isinstance(validation_result, dict):
            quality = validation_result.get('quality', 70)
            size = validation_result.get('size', (512, 512))
            compression_ratio = validation_result.get('compression_ratio', 10)
            
            # Use conservative thresholds for:
            # - Low quality images
            # - Small images
            # - Highly compressed images
            
            if quality < 60 or min(size) < 400 or compression_ratio > 30:
                return True
        
        return False