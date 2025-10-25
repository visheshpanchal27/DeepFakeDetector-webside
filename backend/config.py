# Classification thresholds - Stricter to catch AI content
CLASSIFICATION_THRESHOLDS = {
    "AUTHENTIC_HUMAN": 85.0,    # 85-100 (Very strict)
    "LIKELY_AUTHENTIC": 70.0,   # 70-84
    "SUSPICIOUS": 40.0,         # 40-69
    "AI_GENERATED": 0.0         # 0-39
}

RISK_LEVELS = {
    "SAFE": 85,
    "LOW": 70,
    "MEDIUM": 40,
    "HIGH": 0
}

# Detection thresholds and parameters
DETECTION_CONFIG = {
    'blink_threshold': 0.25,
    'ear_threshold': 0.21,
    'lip_sync_threshold': 0.3,
    'motion_threshold': 15.0,
    'fft_threshold': 0.4,
    'deepfake_threshold': 50,
    'frame_sample_rate': 5,
    'max_frames': 100
}

WEIGHTS = {
    'blink': 0.20,
    'lip_audio': 0.20,
    'head_pose': 0.15,
    'motion': 0.15,
    'fft_prnu': 0.15,
    'metadata': 0.15
}

VIDEO_CONFIG = {
    'frame_width': 640,
    'frame_height': 480,
    'min_fps': 15,
    'max_file_size': 500 * 1024 * 1024
}
