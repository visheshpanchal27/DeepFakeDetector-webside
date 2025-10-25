import cv2
import numpy as np
from core.detection_config import VIDEO_CONFIG

def extract_frames(video_path, sample_rate=5, max_frames=100):
    cap = cv2.VideoCapture(video_path)
    frames = []
    frame_count = 0
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    while len(frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count % sample_rate == 0:
            resized = cv2.resize(frame, (VIDEO_CONFIG['frame_width'], VIDEO_CONFIG['frame_height']))
            frames.append(resized)
        
        frame_count += 1
    
    cap.release()
    return frames, fps

def preprocess_frame(frame):
    normalized = frame.astype(np.float32) / 255.0
    return normalized

def extract_audio(video_path):
    try:
        import subprocess
        audio_path = video_path.replace('.mp4', '_audio.wav')
        subprocess.run(['ffmpeg', '-i', video_path, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', audio_path], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return audio_path
    except:
        return None
