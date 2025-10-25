import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

def generate_forensic_heatmaps(image_path, analysis_results):
    """Generate visual heatmaps for forensic analysis"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            return {}
        
        heatmaps = {}
        
        # Generate ELA heatmap
        if 'ela_array' in analysis_results:
            ela_heatmap = create_ela_heatmap(analysis_results['ela_array'])
            if ela_heatmap is not None:
                heatmaps['ela'] = array_to_base64(ela_heatmap)
        
        # Generate noise heatmap
        if 'noise_map' in analysis_results:
            noise_heatmap = create_noise_heatmap(analysis_results['noise_map'])
            if noise_heatmap is not None:
                heatmaps['noise'] = array_to_base64(noise_heatmap)
        
        # Generate PRNU heatmap
        prnu_heatmap = create_prnu_heatmap(img)
        if prnu_heatmap is not None:
            heatmaps['prnu'] = array_to_base64(prnu_heatmap)
        
        # Generate boundary artifacts heatmap
        boundary_heatmap = create_boundary_heatmap(img)
        if boundary_heatmap is not None:
            heatmaps['boundary'] = array_to_base64(boundary_heatmap)
        
        # Generate compression artifacts heatmap
        compression_heatmap = create_compression_heatmap(img)
        if compression_heatmap is not None:
            heatmaps['compression'] = array_to_base64(compression_heatmap)
        
        return heatmaps
        
    except Exception as e:
        print(f"Heatmap generation error: {e}")
        return {}

def create_ela_heatmap(ela_array):
    """Create ELA heatmap visualization"""
    try:
        if ela_array is None:
            return None
        
        # Convert to grayscale if needed
        if len(ela_array.shape) == 3:
            ela_gray = np.mean(ela_array, axis=2)
        else:
            ela_gray = ela_array
        
        # Normalize to 0-255
        normalized = cv2.normalize(ela_gray, None, 0, 255, cv2.NORM_MINMAX)
        normalized = normalized.astype(np.uint8)
        
        # Apply colormap (red = high error, blue = low error)
        heatmap = cv2.applyColorMap(normalized, cv2.COLORMAP_JET)
        
        return heatmap
        
    except:
        return None

def create_noise_heatmap(noise_map):
    """Create noise level heatmap"""
    try:
        if noise_map is None:
            return None
        
        # Normalize noise map
        normalized = cv2.normalize(noise_map, None, 0, 255, cv2.NORM_MINMAX)
        normalized = normalized.astype(np.uint8)
        
        # Apply colormap (red = high noise, blue = low noise)
        heatmap = cv2.applyColorMap(normalized, cv2.COLORMAP_HOT)
        
        return heatmap
        
    except:
        return None

def create_prnu_heatmap(image):
    """Create PRNU correlation heatmap"""
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.float32)
        
        # Extract noise residual
        kernel = np.ones((3, 3)) / 9
        filtered = cv2.filter2D(gray, -1, kernel)
        noise_residual = gray - filtered
        
        # Calculate local PRNU correlation
        h, w = gray.shape
        correlation_map = np.zeros_like(gray)
        
        # Use sliding window to calculate local correlations
        window_size = 32
        step = 16
        
        for i in range(0, h - window_size, step):
            for j in range(0, w - window_size, step):
                # Extract local window
                local_noise = noise_residual[i:i+window_size, j:j+window_size]
                
                # Calculate correlation with global noise pattern
                global_patch = noise_residual[h//4:3*h//4, w//4:3*w//4]  # Center region
                if global_patch.size > 0:
                    # Resize to match local window
                    global_resized = cv2.resize(global_patch, (window_size, window_size))
                    
                    # Calculate correlation
                    correlation = np.corrcoef(local_noise.flatten(), global_resized.flatten())[0, 1]
                    if not np.isnan(correlation):
                        correlation_map[i:i+window_size, j:j+window_size] = abs(correlation)
        
        # Normalize and apply colormap
        normalized = cv2.normalize(correlation_map, None, 0, 255, cv2.NORM_MINMAX)
        normalized = normalized.astype(np.uint8)
        
        heatmap = cv2.applyColorMap(normalized, cv2.COLORMAP_VIRIDIS)
        
        return heatmap
        
    except:
        return None

def create_boundary_heatmap(image):
    """Create boundary artifacts heatmap"""
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect edges using multiple methods
        edges_canny = cv2.Canny(gray, 50, 150)
        
        # Sobel edges
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        sobel_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
        
        # Laplacian edges
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        
        # Combine edge maps
        combined_edges = edges_canny.astype(np.float32) + \
                        cv2.normalize(sobel_magnitude, None, 0, 255, cv2.NORM_MINMAX) + \
                        cv2.normalize(np.abs(laplacian), None, 0, 255, cv2.NORM_MINMAX)
        
        # Normalize combined edges
        normalized = cv2.normalize(combined_edges, None, 0, 255, cv2.NORM_MINMAX)
        normalized = normalized.astype(np.uint8)
        
        # Apply colormap
        heatmap = cv2.applyColorMap(normalized, cv2.COLORMAP_PLASMA)
        
        return heatmap
        
    except:
        return None

def create_compression_heatmap(image):
    """Create compression artifacts heatmap"""
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.float32)
        
        # Detect 8x8 block boundaries (JPEG compression)
        h, w = gray.shape
        block_map = np.zeros_like(gray)
        
        # Calculate variance within 8x8 blocks
        for i in range(0, h - 8, 8):
            for j in range(0, w - 8, 8):
                block = gray[i:i+8, j:j+8]
                block_variance = np.var(block)
                block_map[i:i+8, j:j+8] = block_variance
        
        # Detect blocking artifacts using DCT
        dct_artifacts = np.zeros_like(gray)
        
        for i in range(0, h - 8, 8):
            for j in range(0, w - 8, 8):
                block = gray[i:i+8, j:j+8]
                
                # Apply DCT
                dct_block = cv2.dct(block)
                
                # Calculate high-frequency energy (compression artifacts)
                high_freq_energy = np.sum(np.abs(dct_block[4:, 4:]))
                dct_artifacts[i:i+8, j:j+8] = high_freq_energy
        
        # Combine block variance and DCT artifacts
        combined = block_map + dct_artifacts
        
        # Normalize and apply colormap
        normalized = cv2.normalize(combined, None, 0, 255, cv2.NORM_MINMAX)
        normalized = normalized.astype(np.uint8)
        
        heatmap = cv2.applyColorMap(normalized, cv2.COLORMAP_INFERNO)
        
        return heatmap
        
    except:
        return None

def array_to_base64(image_array):
    """Convert numpy array to base64 string"""
    try:
        # Convert BGR to RGB if needed
        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            image_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image_array
        
        # Convert to PIL Image
        pil_image = Image.fromarray(image_rgb)
        
        # Save to bytes buffer
        buffer = BytesIO()
        pil_image.save(buffer, format='PNG')
        
        # Encode to base64
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
        
    except Exception as e:
        print(f"Base64 conversion error: {e}")
        return None

def create_overlay_heatmap(original_image, heatmap, alpha=0.6):
    """Create overlay of heatmap on original image"""
    try:
        # Resize heatmap to match original if needed
        if original_image.shape[:2] != heatmap.shape[:2]:
            heatmap = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
        
        # Create overlay
        overlay = cv2.addWeighted(original_image, 1-alpha, heatmap, alpha, 0)
        
        return overlay
        
    except:
        return original_image