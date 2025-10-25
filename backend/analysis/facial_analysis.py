import cv2
import numpy as np
from core.detection_utils import get_face_detector, get_landmark_predictor, eye_aspect_ratio, mouth_aspect_ratio, get_head_pose
from core.detection_config import DETECTION_CONFIG

def detect_blink_irregularity(frames):
    predictor = get_landmark_predictor()
    detector = get_face_detector()
    
    if predictor is None:
        return 0.5
    
    ear_values = []
    blink_count = 0
    prev_ear = 0.3
    
    for frame in frames[::2]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)
        
        if len(faces) == 0:
            continue
        
        landmarks = predictor(gray, faces[0])
        left_eye = np.array([(landmarks.part(i).x, landmarks.part(i).y) for i in range(36, 42)])
        right_eye = np.array([(landmarks.part(i).x, landmarks.part(i).y) for i in range(42, 48)])
        
        ear = (eye_aspect_ratio(left_eye) + eye_aspect_ratio(right_eye)) / 2.0
        ear_values.append(ear)
        
        if ear < DETECTION_CONFIG['ear_threshold'] and prev_ear >= DETECTION_CONFIG['ear_threshold']:
            blink_count += 1
        prev_ear = ear
    
    if len(ear_values) == 0:
        return 0.5
    
    blink_rate = blink_count / (len(frames) / 30.0)
    ear_variance = np.var(ear_values)
    
    # Natural: 15-20 blinks/min, variance 0.001-0.005
    if 0.2 <= blink_rate <= 0.35 and 0.001 <= ear_variance <= 0.005:
        return 0.95
    elif 0.1 <= blink_rate <= 0.5:
        return 0.6
    else:
        return 0.2

def analyze_lip_sync(frames, audio_path=None):
    predictor = get_landmark_predictor()
    detector = get_face_detector()
    
    if predictor is None or audio_path is None:
        return 0.5
    
    mouth_movements = []
    
    for frame in frames[::3]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)
        
        if len(faces) == 0:
            continue
        
        landmarks = predictor(gray, faces[0])
        mouth = np.array([(landmarks.part(i).x, landmarks.part(i).y) for i in range(48, 68)])
        mar = mouth_aspect_ratio(mouth)
        mouth_movements.append(mar)
    
    if len(mouth_movements) < 5:
        return 0.5
    
    movement_variance = np.var(mouth_movements)
    
    # Natural speech has variance 0.01-0.05
    if 0.01 <= movement_variance <= 0.05:
        return 0.9
    elif 0.005 <= movement_variance <= 0.08:
        return 0.6
    else:
        return 0.3

def analyze_head_pose(frames):
    predictor = get_landmark_predictor()
    detector = get_face_detector()
    
    if predictor is None:
        return 0.5
    
    pose_vectors = []
    
    for frame in frames[::4]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)
        
        if len(faces) == 0:
            continue
        
        landmarks = predictor(gray, faces[0])
        landmark_points = np.array([(landmarks.part(i).x, landmarks.part(i).y) for i in range(68)])
        
        rotation = get_head_pose(landmark_points, frame.shape)
        if rotation is not None:
            pose_vectors.append(rotation.flatten())
    
    if len(pose_vectors) < 3:
        return 0.5
    
    pose_changes = [np.linalg.norm(pose_vectors[i+1] - pose_vectors[i]) for i in range(len(pose_vectors)-1)]
    
    if len(pose_changes) == 0:
        return 0.5
    
    avg_change = np.mean(pose_changes)
    variance = np.var(pose_changes)
    
    # Natural: smooth changes, moderate variance
    if 0.05 <= avg_change <= 0.3 and variance < 0.1:
        return 0.9
    elif avg_change < 0.02:
        return 0.3  # Too static (deepfake)
    else:
        return 0.5
