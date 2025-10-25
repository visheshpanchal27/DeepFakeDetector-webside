# Detection thresholds and parameters
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

DETECTION_CONFIG = {
    'blink_threshold': 0.25,
    'ear_threshold': 0.21,
    'lip_sync_threshold': 0.3,
    'motion_threshold': 15.0,
    'fft_threshold': 0.4,
    'deepfake_threshold': 50,
    'frame_sample_rate': 5,
    'max_frames': 100,
    
    # Advanced v2 thresholds
    'illumination_threshold': 0.4,
    'boundary_threshold': 0.35,
    'flicker_threshold': 0.3,
    'bitplane_threshold': 0.4,
    'color_correlation_threshold': 0.35,
    
    # Enterprise v3 thresholds
    'temporal_noise_residual_threshold': 0.35,
    'exposure_consistency_threshold': 0.4,
    'gamma_consistency_threshold': 0.35,
    'coherence_threshold': 0.3,
    'prnu_extension_threshold': 0.4
}

WEIGHTS = {
    'blink': 0.20,
    'lip_audio': 0.20,
    'head_pose': 0.15,
    'motion': 0.15,
    'fft_prnu': 0.15,
    'metadata': 0.15
}

# Advanced fusion weights (v2)
ADVANCED_WEIGHTS = {
    'facial': {'blink': 0.12, 'lip_sync': 0.10, 'head_pose': 0.08},
    'temporal': {'optical_flow': 0.08, 'frame_consistency': 0.07, 'temporal_artifacts': 0.05, 'flicker': 0.05},
    'noise': {'fft_spectrum': 0.06, 'prnu_noise': 0.05, 'edge_artifacts': 0.05, 'bitplane': 0.04, 'color_correlation': 0.05},
    'forensics': {'illumination': 0.06, 'boundary_artifacts': 0.06, 'metadata': 0.04, 'compression': 0.04}
}

# Enterprise fusion weights (v3)
ENTERPRISE_WEIGHTS = {
    'facial': {'blink': 0.10, 'lip_sync': 0.08, 'head_pose': 0.07},
    'temporal': {
        'optical_flow': 0.07, 'frame_consistency': 0.06, 'temporal_artifacts': 0.05,
        'flicker': 0.04, 'temporal_noise_residual': 0.03
    },
    'noise': {
        'fft_spectrum': 0.05, 'prnu_noise': 0.04, 'edge_artifacts': 0.04,
        'bitplane': 0.04, 'color_correlation': 0.04, 'prnu_extension': 0.04
    },
    'forensics': {
        'illumination': 0.05, 'boundary_artifacts': 0.05, 'exposure_consistency': 0.04,
        'gamma_consistency': 0.03, 'metadata': 0.03, 'compression': 0.03
    },
    'cross_modal': {'coherence': 0.06, 'audio_sync': 0.04, 'audio_anomalies': 0.03}
}

VIDEO_CONFIG = {
    'frame_width': 640,
    'frame_height': 480,
    'min_fps': 15,
    'max_file_size': 500 * 1024 * 1024
}

# Advanced detection configuration
ADVANCED_CONFIG = {
    'use_advanced_methods': True,
    'enable_illumination_analysis': True,
    'enable_boundary_detection': True,
    'enable_flicker_analysis': True,
    'enable_bitplane_analysis': True,
    'enable_color_correlation': True,
    'max_analysis_frames': 50,
    'sample_rate_advanced': 3
}

# Enterprise v3 Configuration
ENTERPRISE_CONFIG = {
    'enable_temporal_noise_residual': True,
    'enable_exposure_analysis': True,
    'enable_gamma_analysis': True,
    'enable_coherence_analysis': True,
    'enable_prnu_extension': True,
    'enable_visualization': True,
    'enable_forensic_reporting': True,
    'enable_parallel_processing': True,
    'enable_adaptive_thresholds': True,
    'max_workers': 4,
    'forensic_grade': True
}

# Performance optimization settings
PERFORMANCE_CONFIG = {
    'parallel_processing': True,
    'gpu_acceleration': False,
    'memory_limit_mb': 4096,
    'timeout_seconds': 600,
    'cache_intermediate': True,
    'max_concurrent_analyses': 3,
    'frame_processing_threads': 4
}

# Method availability by detector version
METHOD_AVAILABILITY = {
    'enterprise_v3': [
        'blink', 'lip_sync', 'head_pose', 'optical_flow', 'frame_consistency',
        'temporal_artifacts', 'flicker', 'temporal_noise_residual',
        'fft_spectrum', 'prnu_noise', 'edge_artifacts', 'bitplane', 'color_correlation', 'prnu_extension',
        'illumination', 'boundary_artifacts', 'exposure_consistency', 'gamma_consistency',
        'metadata', 'compression', 'coherence', 'audio_sync', 'audio_anomalies'
    ],
    'advanced_v2': [
        'blink', 'lip_sync', 'head_pose', 'optical_flow', 'frame_consistency',
        'temporal_artifacts', 'flicker', 'fft_spectrum', 'prnu_noise', 'edge_artifacts',
        'bitplane', 'color_correlation', 'illumination', 'boundary_artifacts',
        'metadata', 'compression', 'audio_sync', 'audio_anomalies'
    ],
    'standard': [
        'blink', 'lip_sync', 'head_pose', 'optical_flow', 'frame_consistency',
        'temporal_artifacts', 'fft_spectrum', 'prnu_noise', 'edge_artifacts',
        'metadata', 'compression', 'audio_sync', 'audio_anomalies'
    ]
}
