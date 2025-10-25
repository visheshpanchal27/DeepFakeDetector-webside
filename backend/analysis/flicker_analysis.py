import cv2
import numpy as np
from scipy import signal

def detect_temporal_flicker(frames):
    """Detect temporal flicker and frame jitter"""
    try:
        if len(frames) < 5:
            return 0.5
        
        brightness_values = []
        
        # Calculate per-frame brightness
        for frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            brightness_values.append(brightness)
        
        # Calculate flicker score using rolling standard deviation
        if len(brightness_values) < 3:
            return 0.5
        
        # Calculate differences between consecutive frames
        brightness_diff = np.diff(brightness_values)
        
        # Calculate standard deviation of differences
        flicker_score = np.std(brightness_diff)
        
        # Normalize (higher = more suspicious)
        return min(1.0, flicker_score / 10)
    except:
        return 0.5

def analyze_intensity_variance(frames):
    """Analyze intensity variance across frames"""
    try:
        if len(frames) < 3:
            return 0.5
        
        # Calculate mean intensity for each frame
        intensities = []
        for frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            mean_intensity = np.mean(gray)
            intensities.append(mean_intensity)
        
        # Calculate coefficient of variation
        mean_intensity = np.mean(intensities)
        std_intensity = np.std(intensities)
        
        if mean_intensity > 0:
            cv_intensity = std_intensity / mean_intensity
            return min(1.0, cv_intensity * 5)
        
        return 0.5
    except:
        return 0.5

def detect_periodic_patterns(frames):
    """Detect periodic patterns in frame sequences"""
    try:
        if len(frames) < 10:
            return 0.5
        
        # Extract brightness values
        brightness = []
        for frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            brightness.append(np.mean(gray))
        
        # Apply FFT to detect periodic patterns
        fft_result = np.fft.fft(brightness)
        frequencies = np.fft.fftfreq(len(brightness))
        
        # Calculate power spectrum
        power_spectrum = np.abs(fft_result)**2
        
        # Find dominant frequencies (excluding DC component)
        power_spectrum[0] = 0  # Remove DC component
        max_power = np.max(power_spectrum)
        total_power = np.sum(power_spectrum)
        
        if total_power > 0:
            # High ratio indicates strong periodic pattern
            periodicity_ratio = max_power / total_power
            return min(1.0, periodicity_ratio * 10)
        
        return 0.5
    except:
        return 0.5

def analyze_frame_jitter(frames):
    """Analyze frame-to-frame jitter"""
    try:
        if len(frames) < 5:
            return 0.5
        
        jitter_scores = []
        
        for i in range(1, len(frames)):
            prev_frame = cv2.cvtColor(frames[i-1], cv2.COLOR_BGR2GRAY)
            curr_frame = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
            
            # Calculate frame difference
            diff = cv2.absdiff(prev_frame, curr_frame)
            
            # Calculate mean absolute difference
            mad = np.mean(diff)
            jitter_scores.append(mad)
        
        # Calculate jitter variance
        jitter_variance = np.var(jitter_scores)
        
        # Normalize
        return min(1.0, jitter_variance / 100)
    except:
        return 0.5

def detect_gan_artifacts_temporal(frames):
    """Detect GAN-specific temporal artifacts"""
    try:
        if len(frames) < 8:
            return 0.5
        
        # Analyze color channel consistency over time
        r_values, g_values, b_values = [], [], []
        
        for frame in frames:
            b, g, r = cv2.split(frame)
            r_values.append(np.mean(r))
            g_values.append(np.mean(g))
            b_values.append(np.mean(b))
        
        # Calculate correlation between channels over time
        corr_rg = np.corrcoef(r_values, g_values)[0,1] if len(r_values) > 1 else 0.5
        corr_rb = np.corrcoef(r_values, b_values)[0,1] if len(r_values) > 1 else 0.5
        corr_gb = np.corrcoef(g_values, b_values)[0,1] if len(g_values) > 1 else 0.5
        
        # Average correlation
        avg_corr = (abs(corr_rg) + abs(corr_rb) + abs(corr_gb)) / 3
        
        # Very high correlation indicates synthetic generation
        if avg_corr > 0.9:
            return min(1.0, (avg_corr - 0.9) * 10)
        
        return 0.2
    except:
        return 0.5

def analyze_motion_smoothness(frames):
    """Analyze motion smoothness between frames"""
    try:
        if len(frames) < 5:
            return 0.5
        
        motion_vectors = []
        
        for i in range(1, len(frames)):
            prev_gray = cv2.cvtColor(frames[i-1], cv2.COLOR_BGR2GRAY)
            curr_gray = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
            
            # Calculate optical flow
            flow = cv2.calcOpticalFlowFarneback(
                prev_gray, curr_gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
            )
            
            # Calculate motion magnitude
            magnitude, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
            avg_motion = np.mean(magnitude)
            motion_vectors.append(avg_motion)
        
        # Calculate motion smoothness
        if len(motion_vectors) > 1:
            motion_diff = np.diff(motion_vectors)
            motion_variance = np.var(motion_diff)
            
            # High variance indicates jerky motion
            return min(1.0, motion_variance / 5)
        
        return 0.5
    except:
        return 0.5

def detect_compression_flicker(frames):
    """Detect flicker caused by compression artifacts"""
    try:
        if len(frames) < 5:
            return 0.5
        
        # Analyze DCT coefficients over time
        dct_energies = []
        
        for frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Apply DCT to 8x8 blocks
            h, w = gray.shape
            block_size = 8
            total_energy = 0
            block_count = 0
            
            for y in range(0, h - block_size, block_size):
                for x in range(0, w - block_size, block_size):
                    block = gray[y:y+block_size, x:x+block_size].astype(np.float32)
                    dct_block = cv2.dct(block)
                    energy = np.sum(dct_block**2)
                    total_energy += energy
                    block_count += 1
            
            if block_count > 0:
                avg_energy = total_energy / block_count
                dct_energies.append(avg_energy)
        
        # Calculate energy variance
        if len(dct_energies) > 1:
            energy_variance = np.var(dct_energies)
            return min(1.0, energy_variance / 10000)
        
        return 0.5
    except:
        return 0.5

def analyze_flicker_artifacts(frames):
    """Main function to analyze flicker and temporal artifacts"""
    try:
        if not frames or len(frames) < 3:
            return 0.5
        
        # Sample frames if too many
        if len(frames) > 50:
            step = len(frames) // 50
            frames = frames[::step]
        
        # Temporal flicker detection
        flicker_score = detect_temporal_flicker(frames)
        
        # Intensity variance analysis
        intensity_score = analyze_intensity_variance(frames)
        
        # Periodic pattern detection
        periodic_score = detect_periodic_patterns(frames)
        
        # Frame jitter analysis
        jitter_score = analyze_frame_jitter(frames)
        
        # GAN temporal artifacts
        gan_score = detect_gan_artifacts_temporal(frames)
        
        # Motion smoothness
        motion_score = analyze_motion_smoothness(frames)
        
        # Compression flicker
        compression_score = detect_compression_flicker(frames)
        
        # Combine all scores
        combined_score = (
            flicker_score + intensity_score + periodic_score + 
            jitter_score + gan_score + motion_score + compression_score
        ) / 7
        
        return min(1.0, combined_score)
    except Exception as e:
        print(f"Flicker analysis error: {e}")
        return 0.5