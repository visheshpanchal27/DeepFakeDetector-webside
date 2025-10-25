import cv2
import numpy as np
from scipy import fftpack

def analyze_fft_spectrum(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    magnitude = np.abs(fshift)
    
    h, w = magnitude.shape
    center_y, center_x = h // 2, w // 2
    
    # Analyze frequency bands
    low_freq = magnitude[center_y-h//8:center_y+h//8, center_x-w//8:center_x+w//8]
    high_freq_ring = magnitude[center_y-h//4:center_y+h//4, center_x-w//4:center_x+w//4]
    
    low_energy = np.mean(low_freq)
    high_energy = np.mean(high_freq_ring)
    
    ratio = high_energy / (low_energy + 1e-7)
    
    # Natural images: balanced frequency distribution
    if 0.1 <= ratio <= 0.4:
        return 0.9
    elif ratio > 0.6 or ratio < 0.05:
        return 0.3  # Unnatural (AI-generated)
    else:
        return 0.6

def detect_prnu_noise(frames):
    if len(frames) < 3:
        return 0.5
    
    noise_patterns = []
    
    for frame in frames[::5]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).astype(np.float32)
        denoised = cv2.GaussianBlur(gray, (5, 5), 1.5)
        noise = gray - denoised
        noise_patterns.append(noise)
    
    if len(noise_patterns) < 2:
        return 0.5
    
    # Check noise consistency across frames
    correlations = []
    for i in range(len(noise_patterns) - 1):
        corr = np.corrcoef(noise_patterns[i].flatten(), noise_patterns[i+1].flatten())[0, 1]
        correlations.append(corr)
    
    avg_corr = np.mean(correlations)
    
    # Natural: consistent camera noise (0.3-0.7)
    if 0.3 <= avg_corr <= 0.7:
        return 0.9
    elif avg_corr > 0.85:
        return 0.2  # Too consistent (synthetic)
    else:
        return 0.5

def analyze_edge_artifacts(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Detect edges
    edges = cv2.Canny(gray, 50, 150)
    
    # Analyze edge smoothness
    kernel = np.ones((3,3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=1)
    edge_thickness = np.sum(dilated) / (np.sum(edges) + 1e-7)
    
    # Check for unnatural sharp edges (AI artifacts)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    edge_variance = np.var(laplacian)
    
    # Natural: moderate edge thickness and variance
    if 1.2 <= edge_thickness <= 2.5 and 100 <= edge_variance <= 2000:
        return 0.9
    elif edge_thickness > 3.5 or edge_variance > 3000:
        return 0.3  # Unnatural edges
    else:
        return 0.6

def analyze_compression_artifacts(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # DCT analysis for JPEG artifacts
    dct = cv2.dct(np.float32(gray) / 255.0)
    
    # Check for blocking artifacts (8x8 blocks)
    block_size = 8
    h, w = gray.shape
    block_energies = []
    
    for i in range(0, h - block_size, block_size):
        for j in range(0, w - block_size, block_size):
            block = dct[i:i+block_size, j:j+block_size]
            block_energies.append(np.sum(np.abs(block)))
    
    energy_variance = np.var(block_energies)
    
    # Natural: consistent compression
    if energy_variance < 1000:
        return 0.9
    elif energy_variance > 5000:
        return 0.3  # Inconsistent (manipulated)
    else:
        return 0.6
