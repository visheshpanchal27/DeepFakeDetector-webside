import cv2
import numpy as np
import dlib

detector = None
predictor = None

def get_face_detector():
    global detector
    if detector is None:
        try:
            detector = dlib.get_frontal_face_detector()
        except:
            detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    return detector

def get_landmark_predictor():
    global predictor
    if predictor is None:
        try:
            predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
        except:
            predictor = None
    return predictor

def eye_aspect_ratio(eye):
    A = np.linalg.norm(eye[1] - eye[5])
    B = np.linalg.norm(eye[2] - eye[4])
    C = np.linalg.norm(eye[0] - eye[3])
    return (A + B) / (2.0 * C)

def mouth_aspect_ratio(mouth):
    A = np.linalg.norm(mouth[2] - mouth[10])
    B = np.linalg.norm(mouth[4] - mouth[8])
    C = np.linalg.norm(mouth[0] - mouth[6])
    return (A + B) / (2.0 * C)

def get_head_pose(landmarks, frame_shape):
    image_points = np.array([
        landmarks[30], landmarks[8], landmarks[36], landmarks[45], landmarks[48], landmarks[54]
    ], dtype="double")
    
    model_points = np.array([
        (0.0, 0.0, 0.0), (0.0, -330.0, -65.0), (-225.0, 170.0, -135.0),
        (225.0, 170.0, -135.0), (-150.0, -150.0, -125.0), (150.0, -150.0, -125.0)
    ])
    
    focal_length = frame_shape[1]
    center = (frame_shape[1]/2, frame_shape[0]/2)
    camera_matrix = np.array([[focal_length, 0, center[0]], [0, focal_length, center[1]], [0, 0, 1]], dtype="double")
    
    dist_coeffs = np.zeros((4,1))
    success, rotation_vector, translation_vector = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)
    
    return rotation_vector if success else None
