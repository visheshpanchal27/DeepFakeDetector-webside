import cv2
import numpy as np

def preprocess_image(image_path, target_size=(224, 224)):
    """Preprocess image for model input"""
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Failed to load image: {image_path}")
    
    # Resize
    image = cv2.resize(image, target_size)
    
    # Normalize
    image = image.astype(np.float32) / 255.0
    
    return image

def preprocess_for_detection(image_path, max_size=1024):
    """Preprocess image for detection (maintains aspect ratio)"""
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Failed to load image: {image_path}")
    
    h, w = image.shape[:2]
    if max(h, w) > max_size:
        scale = max_size / max(h, w)
        new_w, new_h = int(w * scale), int(h * scale)
        image = cv2.resize(image, (new_w, new_h))
    
    return image
