import cv2
import numpy as np
from scipy import signal
from scipy.fftpack import dct
import pywt

class ForensicAnalyzer:
    """Advanced forensic-level image analysis"""
    
    @staticmethod
    def compute_prnu(image):
        """Photo Response Non-Uniformity - detects camera sensor patterns"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        noise_residual = gray.astype(float) - denoised.astype(float)
        prnu_pattern = np.std(noise_residual)
        score = min(100, prnu_pattern * 2)
        return round(score, 2)
    
    @staticmethod
    def error_level_analysis(image):
        """ELA - detects compression artifacts and tampering"""
        import tempfile
        import os
        temp_path = os.path.join(tempfile.gettempdir(), 'ela_temp.jpg')
        cv2.imwrite(temp_path, image, [cv2.IMWRITE_JPEG_QUALITY, 90])
        recompressed = cv2.imread(temp_path)
        if recompressed is None:
            return 50.0
        diff = cv2.absdiff(image, recompressed)
        ela_score = np.mean(diff)
        normalized = min(100, ela_score * 3)
        return round(normalized, 2)
    
    @staticmethod
    def dwt_texture_analysis(image):
        """Discrete Wavelet Transform - exposes GAN blending edges"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        coeffs = pywt.dwt2(gray, 'haar')
        cA, (cH, cV, cD) = coeffs
        high_freq_energy = np.mean([np.std(cH), np.std(cV), np.std(cD)])
        score = min(100, high_freq_energy / 2)
        return round(score, 2)
    
    @staticmethod
    def chromatic_aberration(image):
        """Detects lens-based color shifts (real photos have this)"""
        b, g, r = cv2.split(image)
        shift_rg = np.mean(np.abs(r.astype(float) - g.astype(float)))
        shift_gb = np.mean(np.abs(g.astype(float) - b.astype(float)))
        aberration = (shift_rg + shift_gb) / 2
        score = min(100, aberration / 3)
        return round(score, 2)
    
    @staticmethod
    def specular_reflection_consistency(image):
        """Analyzes light reflection patterns in eyes/skin"""
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        _, _, v = cv2.split(hsv)
        bright_regions = cv2.threshold(v, 200, 255, cv2.THRESH_BINARY)[1]
        reflection_ratio = np.sum(bright_regions > 0) / bright_regions.size
        score = min(100, reflection_ratio * 500)
        return round(score, 2)
    
    @staticmethod
    def noise_variance_analysis(image):
        """Analyzes noise patterns - AI images have uniform noise"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        blocks = [gray[i:i+64, j:j+64] for i in range(0, gray.shape[0]-64, 64) 
                  for j in range(0, gray.shape[1]-64, 64)]
        variances = [np.var(block) for block in blocks if block.size > 0]
        variance_std = np.std(variances) if variances else 0
        score = min(100, variance_std / 10)
        return round(score, 2)
    
    @staticmethod
    def jpeg_ghost_detection(image):
        """Detects double JPEG compression artifacts"""
        dct_coeffs = []
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        for i in range(0, gray.shape[0]-8, 8):
            for j in range(0, gray.shape[1]-8, 8):
                block = gray[i:i+8, j:j+8].astype(float)
                dct_block = dct(dct(block.T, norm='ortho').T, norm='ortho')
                dct_coeffs.append(np.abs(dct_block).flatten())
        ghost_score = np.std([np.std(c) for c in dct_coeffs]) if dct_coeffs else 0
        return round(min(100, ghost_score * 2), 2)

def forensic_features(image):
    """Main forensic analysis pipeline"""
    analyzer = ForensicAnalyzer()
    
    prnu_score = analyzer.compute_prnu(image)
    ela_score = analyzer.error_level_analysis(image)
    wavelet_score = analyzer.dwt_texture_analysis(image)
    chroma_score = analyzer.chromatic_aberration(image)
    reflection_score = analyzer.specular_reflection_consistency(image)
    noise_score = analyzer.noise_variance_analysis(image)
    jpeg_ghost = analyzer.jpeg_ghost_detection(image)
    
    # Filter out NaN values
    scores = [prnu_score, ela_score, wavelet_score, chroma_score, 
              reflection_score, noise_score, jpeg_ghost]
    valid_scores = [s for s in scores if not np.isnan(s) and s is not None]
    
    if valid_scores:
        combined = np.mean(valid_scores)
    else:
        combined = 50.0  # Default
    
    # Ensure no NaN values in output
    def safe_score(score):
        return 50.0 if (score is None or np.isnan(score)) else round(float(score), 2)
    
    return {
        "prnu": safe_score(prnu_score),
        "ela": safe_score(ela_score),
        "wavelet": safe_score(wavelet_score),
        "chromatic": safe_score(chroma_score),
        "reflection": safe_score(reflection_score),
        "noise_variance": safe_score(noise_score),
        "jpeg_ghost": safe_score(jpeg_ghost),
        "combined": safe_score(combined)
    }
