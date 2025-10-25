import numpy as np

def analyze_audio_video_sync(audio_path, mouth_movements):
    if audio_path is None or len(mouth_movements) < 5:
        return 0.5
    
    try:
        import librosa
        audio, sr = librosa.load(audio_path, sr=16000)
        
        # Extract audio energy envelope
        hop_length = 512
        energy = librosa.feature.rms(y=audio, hop_length=hop_length)[0]
        
        # Resample to match video frames
        target_length = len(mouth_movements)
        if len(energy) > target_length:
            energy = np.interp(np.linspace(0, len(energy), target_length), np.arange(len(energy)), energy)
        
        # Normalize
        energy = (energy - np.min(energy)) / (np.max(energy) - np.min(energy) + 1e-7)
        mouth_norm = (mouth_movements - np.min(mouth_movements)) / (np.max(mouth_movements) - np.min(mouth_movements) + 1e-7)
        
        # Cross-correlation
        correlation = np.correlate(energy, mouth_norm, mode='valid')[0] / len(energy)
        
        # Natural: high correlation (0.5-0.9)
        if correlation > 0.5:
            return 0.9
        elif correlation > 0.3:
            return 0.6
        else:
            return 0.3  # Poor sync (deepfake)
    except:
        return 0.5

def detect_audio_anomalies(audio_path):
    if audio_path is None:
        return 0.5
    
    try:
        import librosa
        audio, sr = librosa.load(audio_path, sr=16000)
        
        # Spectral analysis
        spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr)[0]
        
        # Check for unnatural spectral patterns
        centroid_variance = np.var(spectral_centroids)
        rolloff_variance = np.var(spectral_rolloff)
        
        # Natural speech: moderate variance
        if 1e6 <= centroid_variance <= 1e8 and 1e6 <= rolloff_variance <= 1e8:
            return 0.9
        elif centroid_variance > 1e9 or rolloff_variance > 1e9:
            return 0.3  # Unnatural (synthetic)
        else:
            return 0.6
    except:
        return 0.5

def analyze_pitch_consistency(audio_path):
    if audio_path is None:
        return 0.5
    
    try:
        import librosa
        audio, sr = librosa.load(audio_path, sr=16000)
        
        # Extract pitch
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        pitch_values = []
        
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        
        if len(pitch_values) < 10:
            return 0.5
        
        pitch_variance = np.var(pitch_values)
        
        # Natural: consistent pitch with some variation
        if 1000 <= pitch_variance <= 10000:
            return 0.9
        elif pitch_variance < 100:
            return 0.3  # Too consistent (synthetic)
        else:
            return 0.6
    except:
        return 0.5
