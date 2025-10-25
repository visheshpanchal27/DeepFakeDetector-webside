import cv2
import numpy as np
from scipy.stats import entropy

def extract_bitplane(gray_image, bit_position):
    """Extract specific bitplane from grayscale image"""
    try:
        bitplane = np.bitwise_and(gray_image, 1 << bit_position)
        return (bitplane >> bit_position) * 255
    except:
        return np.zeros_like(gray_image)

def calculate_bitplane_entropy(gray_image):
    """Calculate entropy for each bitplane"""
    try:
        entropies = []
        
        for i in range(8):  # 8 bits per pixel
            bitplane = extract_bitplane(gray_image, i)
            
            # Calculate histogram
            unique, counts = np.unique(bitplane, return_counts=True)
            
            # Calculate probabilities
            probs = counts / counts.sum()
            
            # Calculate entropy
            bit_entropy = entropy(probs, base=2)
            entropies.append(bit_entropy)
        
        return entropies
    except:
        return [0.5] * 8

def analyze_bitplane_uniformity(gray_image):
    """Analyze uniformity across bitplanes"""
    try:
        uniformity_scores = []
        
        for i in range(8):
            bitplane = extract_bitplane(gray_image, i)
            
            # Calculate local variance
            kernel = np.ones((3,3), np.float32) / 9
            smoothed = cv2.filter2D(bitplane.astype(np.float32), -1, kernel)
            variance = np.var(bitplane.astype(np.float32) - smoothed)
            
            uniformity_scores.append(variance)
        
        # Higher variance in lower bitplanes is suspicious
        return uniformity_scores
    except:
        return [0.5] * 8

def detect_lsb_steganography(gray_image):
    """Detect potential LSB steganography artifacts"""
    try:
        # Extract LSB (bit 0)
        lsb = extract_bitplane(gray_image, 0)
        
        # Calculate chi-square test for randomness
        hist, _ = np.histogram(lsb, bins=2, range=(0, 255))
        
        # Expected uniform distribution
        expected = len(lsb.flatten()) / 2
        
        # Chi-square statistic
        chi_square = np.sum((hist - expected)**2 / expected)
        
        # Normalize (higher = more suspicious)
        return min(1.0, chi_square / 100)
    except:
        return 0.5

def analyze_bitplane_correlation(gray_image):
    """Analyze correlation between adjacent bitplanes"""
    try:
        correlations = []
        
        for i in range(7):  # 0-6 (compare with next bitplane)
            bp1 = extract_bitplane(gray_image, i).flatten()
            bp2 = extract_bitplane(gray_image, i+1).flatten()
            
            # Calculate correlation coefficient
            if np.std(bp1) > 0 and np.std(bp2) > 0:
                corr = np.corrcoef(bp1, bp2)[0,1]
                correlations.append(abs(corr))
            else:
                correlations.append(0.5)
        
        # Unnatural correlations indicate synthetic generation
        avg_correlation = np.mean(correlations)
        
        # Very high or very low correlation is suspicious
        if avg_correlation > 0.8 or avg_correlation < 0.1:
            return min(1.0, abs(avg_correlation - 0.5) * 2)
        
        return 0.2
    except:
        return 0.5

def analyze_noise_distribution(gray_image):
    """Analyze noise distribution in bitplanes"""
    try:
        noise_scores = []
        
        for i in range(3):  # Focus on lower 3 bitplanes (most noise)
            bitplane = extract_bitplane(gray_image, i)
            
            # Calculate local standard deviation
            kernel = np.ones((5,5), np.float32) / 25
            mean_filtered = cv2.filter2D(bitplane.astype(np.float32), -1, kernel)
            
            # Calculate noise as deviation from local mean
            noise = np.abs(bitplane.astype(np.float32) - mean_filtered)
            noise_std = np.std(noise)
            
            noise_scores.append(noise_std)
        
        # Analyze noise pattern
        noise_variance = np.var(noise_scores)
        
        # Unnatural noise patterns indicate synthetic generation
        return min(1.0, noise_variance / 100)
    except:
        return 0.5

def detect_quantization_artifacts(gray_image):
    """Detect quantization artifacts in bitplanes"""
    try:
        # Focus on mid-level bitplanes (2-5)
        quantization_scores = []
        
        for i in range(2, 6):
            bitplane = extract_bitplane(gray_image, i)
            
            # Calculate gradient to detect quantization steps
            grad_x = cv2.Sobel(bitplane, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(bitplane, cv2.CV_64F, 0, 1, ksize=3)
            gradient_mag = np.sqrt(grad_x**2 + grad_y**2)
            
            # Count strong gradients (quantization steps)
            strong_gradients = np.sum(gradient_mag > np.mean(gradient_mag) + 2*np.std(gradient_mag))
            total_pixels = gradient_mag.size
            
            quantization_ratio = strong_gradients / total_pixels
            quantization_scores.append(quantization_ratio)
        
        # High quantization indicates compression or synthetic generation
        avg_quantization = np.mean(quantization_scores)
        return min(1.0, avg_quantization * 10)
    except:
        return 0.5

def analyze_frequency_domain_bitplanes(gray_image):
    """Analyze bitplanes in frequency domain"""
    try:
        freq_scores = []
        
        for i in range(8):
            bitplane = extract_bitplane(gray_image, i)
            
            # Apply FFT
            f_transform = np.fft.fft2(bitplane)
            f_shift = np.fft.fftshift(f_transform)
            magnitude = np.abs(f_shift)
            
            # Calculate energy distribution
            total_energy = np.sum(magnitude**2)
            
            # Calculate high frequency energy
            rows, cols = magnitude.shape
            center_row, center_col = rows // 2, cols // 2
            
            # Create high-pass filter
            y, x = np.ogrid[:rows, :cols]
            mask = (x - center_col)**2 + (y - center_row)**2 > (min(rows, cols)//4)**2
            
            high_freq_energy = np.sum((magnitude * mask)**2)
            
            if total_energy > 0:
                high_freq_ratio = high_freq_energy / total_energy
                freq_scores.append(high_freq_ratio)
            else:
                freq_scores.append(0.5)
        
        # Analyze frequency distribution pattern
        freq_variance = np.var(freq_scores)
        
        # Unnatural frequency patterns indicate synthetic generation
        return min(1.0, freq_variance * 5)
    except:
        return 0.5

def analyze_bitplane_artifacts(frames):
    """Main function to analyze bitplane and pixel-level artifacts"""
    try:
        if not frames:
            return 0.5
        
        scores = []
        
        # Sample frames for analysis
        sample_frames = frames[::max(1, len(frames)//5)][:5]
        
        for frame in sample_frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Bitplane entropy analysis
            entropies = calculate_bitplane_entropy(gray)
            entropy_score = 1 - (np.mean(entropies) / 8)  # Lower entropy = more suspicious
            
            # Bitplane uniformity analysis
            uniformity_scores = analyze_bitplane_uniformity(gray)
            uniformity_score = min(1.0, np.mean(uniformity_scores) / 100)
            
            # LSB steganography detection
            lsb_score = detect_lsb_steganography(gray)
            
            # Bitplane correlation analysis
            correlation_score = analyze_bitplane_correlation(gray)
            
            # Noise distribution analysis
            noise_score = analyze_noise_distribution(gray)
            
            # Quantization artifacts
            quantization_score = detect_quantization_artifacts(gray)
            
            # Frequency domain analysis
            freq_score = analyze_frequency_domain_bitplanes(gray)
            
            # Combine scores
            frame_score = (
                entropy_score + uniformity_score + lsb_score + 
                correlation_score + noise_score + quantization_score + freq_score
            ) / 7
            
            scores.append(frame_score)
        
        return np.mean(scores) if scores else 0.5
    except Exception as e:
        print(f"Bitplane analysis error: {e}")
        return 0.5

def analyze_pixel_randomness(gray_image):
    """Analyze pixel-level randomness patterns"""
    try:
        # Calculate first-order differences
        diff_h = np.diff(gray_image, axis=1)  # Horizontal differences
        diff_v = np.diff(gray_image, axis=0)  # Vertical differences
        
        # Calculate randomness metrics
        h_entropy = entropy(np.histogram(diff_h.flatten(), bins=50)[0] + 1e-10, base=2)
        v_entropy = entropy(np.histogram(diff_v.flatten(), bins=50)[0] + 1e-10, base=2)
        
        # Average entropy
        avg_entropy = (h_entropy + v_entropy) / 2
        
        # Lower entropy indicates less randomness (more suspicious)
        return max(0, 1 - (avg_entropy / 6))
    except:
        return 0.5