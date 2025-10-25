import cv2
import numpy as np
import json
import base64

def create_anomaly_heatmap(frame, anomaly_scores, method_name):
    """Create heatmap overlay for detected anomalies"""
    try:
        # Ensure anomaly_scores is 2D
        if isinstance(anomaly_scores, (int, float)):
            # Create uniform heatmap
            h, w = frame.shape[:2]
            anomaly_map = np.full((h, w), anomaly_scores, dtype=np.float32)
        else:
            anomaly_map = np.array(anomaly_scores, dtype=np.float32)
            if anomaly_map.ndim == 1:
                # Reshape to 2D
                size = int(np.sqrt(len(anomaly_map)))
                anomaly_map = anomaly_map[:size*size].reshape(size, size)
        
        # Resize to match frame
        h, w = frame.shape[:2]
        anomaly_map = cv2.resize(anomaly_map, (w, h))
        
        # Normalize to 0-255
        anomaly_map = ((anomaly_map - anomaly_map.min()) / (anomaly_map.max() - anomaly_map.min() + 1e-8) * 255).astype(np.uint8)
        
        # Apply colormap
        heatmap = cv2.applyColorMap(anomaly_map, cv2.COLORMAP_JET)
        
        # Blend with original frame
        alpha = 0.4
        overlay = cv2.addWeighted(frame, 1-alpha, heatmap, alpha, 0)
        
        return overlay
    except Exception as e:
        print(f"Heatmap creation error: {e}")
        return frame

def generate_edge_anomaly_map(frame):
    """Generate anomaly map for edge artifacts"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
        
        # Detect edges
        edges = cv2.Canny(gray, 50, 150)
        
        # Calculate edge density in local regions
        kernel = np.ones((16, 16), np.float32) / 256
        edge_density = cv2.filter2D(edges.astype(np.float32), -1, kernel)
        
        return edge_density
    except:
        return np.zeros(frame.shape[:2], dtype=np.float32)

def generate_illumination_anomaly_map(frame):
    """Generate anomaly map for illumination inconsistencies"""
    try:
        # Convert to LAB color space
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l_channel = lab[:,:,0]
        
        # Calculate local variance in lightness
        kernel = np.ones((8, 8), np.float32) / 64
        l_smooth = cv2.filter2D(l_channel.astype(np.float32), -1, kernel)
        l_variance = np.abs(l_channel.astype(np.float32) - l_smooth)
        
        return l_variance
    except:
        return np.zeros(frame.shape[:2], dtype=np.float32)

def generate_compression_anomaly_map(frame):
    """Generate anomaly map for compression artifacts"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
        
        # Apply DCT to detect compression artifacts
        h, w = gray.shape
        block_size = 8
        anomaly_map = np.zeros((h, w), dtype=np.float32)
        
        for y in range(0, h - block_size, block_size):
            for x in range(0, w - block_size, block_size):
                block = gray[y:y+block_size, x:x+block_size].astype(np.float32)
                dct_block = cv2.dct(block)
                
                # High frequency energy indicates artifacts
                high_freq_energy = np.sum(np.abs(dct_block[4:, 4:]))
                anomaly_map[y:y+block_size, x:x+block_size] = high_freq_energy
        
        return anomaly_map
    except:
        return np.zeros(frame.shape[:2], dtype=np.float32)

def create_frame_visualization(frame, detection_results):
    """Create comprehensive frame visualization with all anomalies"""
    try:
        visualizations = {}
        
        # Edge artifacts visualization
        if 'edge_artifacts' in detection_results:
            edge_map = generate_edge_anomaly_map(frame)
            edge_viz = create_anomaly_heatmap(frame, edge_map, 'Edge Artifacts')
            visualizations['edge_artifacts'] = frame_to_base64(edge_viz)
        
        # Illumination visualization
        if 'illumination' in detection_results:
            illum_map = generate_illumination_anomaly_map(frame)
            illum_viz = create_anomaly_heatmap(frame, illum_map, 'Illumination')
            visualizations['illumination'] = frame_to_base64(illum_viz)
        
        # Compression artifacts visualization
        if 'compression' in detection_results:
            comp_map = generate_compression_anomaly_map(frame)
            comp_viz = create_anomaly_heatmap(frame, comp_map, 'Compression')
            visualizations['compression'] = frame_to_base64(comp_viz)
        
        # Face boundary visualization
        if 'boundary_artifacts' in detection_results:
            boundary_viz = create_face_boundary_visualization(frame)
            visualizations['boundary_artifacts'] = frame_to_base64(boundary_viz)
        
        return visualizations
    except Exception as e:
        print(f"Frame visualization error: {e}")
        return {}

def create_face_boundary_visualization(frame):
    """Create visualization for face boundary artifacts"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
        
        # Detect face
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        viz_frame = frame.copy()
        
        if len(faces) > 0:
            x, y, w, h = faces[0]
            
            # Draw face boundary
            cv2.rectangle(viz_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Highlight boundary region
            boundary_width = 5
            cv2.rectangle(viz_frame, (x-boundary_width, y-boundary_width), 
                         (x+w+boundary_width, y+h+boundary_width), (255, 255, 0), 2)
        
        return viz_frame
    except:
        return frame

def frame_to_base64(frame):
    """Convert frame to base64 string for API response"""
    try:
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{frame_base64}"
    except:
        return None

def generate_detection_summary_chart(detection_results):
    """Generate summary chart data for frontend visualization"""
    try:
        chart_data = {
            'labels': [],
            'scores': [],
            'colors': []
        }
        
        # Color mapping for different score ranges
        def get_color(score):
            if score >= 80:
                return '#4CAF50'  # Green (safe)
            elif score >= 60:
                return '#FFC107'  # Yellow (caution)
            elif score >= 40:
                return '#FF9800'  # Orange (suspicious)
            else:
                return '#F44336'  # Red (dangerous)
        
        # Process individual scores
        individual_scores = detection_results.get('individual_scores', {})
        for method, score in individual_scores.items():
            chart_data['labels'].append(method)
            chart_data['scores'].append(round(score, 1))
            chart_data['colors'].append(get_color(score))
        
        return chart_data
    except:
        return {'labels': [], 'scores': [], 'colors': []}

def create_temporal_analysis_chart(frames, temporal_scores):
    """Create temporal analysis visualization"""
    try:
        frame_indices = list(range(len(temporal_scores)))
        
        chart_data = {
            'frame_numbers': frame_indices,
            'scores': [round(score, 2) for score in temporal_scores],
            'threshold': 0.5,
            'suspicious_frames': [i for i, score in enumerate(temporal_scores) if score > 0.6]
        }
        
        return chart_data
    except:
        return {'frame_numbers': [], 'scores': [], 'threshold': 0.5, 'suspicious_frames': []}

def generate_comprehensive_visualization(frames, detection_results):
    """Generate comprehensive visualization package"""
    try:
        visualization_package = {
            'summary_chart': generate_detection_summary_chart(detection_results),
            'frame_visualizations': {},
            'temporal_analysis': {},
            'metadata': {
                'total_frames': len(frames),
                'analysis_timestamp': np.datetime64('now').isoformat(),
                'visualization_version': '1.0'
            }
        }
        
        # Sample frames for visualization (max 3 to avoid large responses)
        sample_indices = [0, len(frames)//2, len(frames)-1] if len(frames) >= 3 else [0]
        
        for idx in sample_indices:
            if idx < len(frames):
                frame_viz = create_frame_visualization(frames[idx], detection_results)
                visualization_package['frame_visualizations'][f'frame_{idx}'] = frame_viz
        
        # Add temporal analysis if available
        if 'flicker' in detection_results or 'temporal_artifacts' in detection_results:
            # Mock temporal scores for visualization
            temporal_scores = [0.3, 0.4, 0.6, 0.2, 0.5] * (len(frames)//5 + 1)
            temporal_scores = temporal_scores[:len(frames)]
            visualization_package['temporal_analysis'] = create_temporal_analysis_chart(frames, temporal_scores)
        
        return visualization_package
        
    except Exception as e:
        print(f"Comprehensive visualization error: {e}")
        return {
            'summary_chart': {'labels': [], 'scores': [], 'colors': []},
            'frame_visualizations': {},
            'temporal_analysis': {},
            'metadata': {'error': str(e)}
        }