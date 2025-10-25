import cv2
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from typing import List, Dict, Callable

class MultiThreadedFrameProcessor:
    """Multi-threaded frame analyzer for improved performance"""
    
    def __init__(self, max_workers=None):
        self.max_workers = max_workers or min(4, (os.cpu_count() or 1))
        self.thread_local = threading.local()
    
    def process_frames_parallel(self, frames: List, detection_functions: Dict[str, Callable], 
                              chunk_size: int = None) -> Dict:
        """Process frames in parallel using multiple detection methods"""
        try:
            if not frames:
                return {}
            
            # Determine chunk size
            if chunk_size is None:
                chunk_size = max(1, len(frames) // self.max_workers)
            
            # Split frames into chunks
            frame_chunks = [frames[i:i + chunk_size] for i in range(0, len(frames), chunk_size)]
            
            results = {}
            
            # Process each detection method in parallel
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                # Submit tasks for each detection method
                future_to_method = {}
                
                for method_name, detection_func in detection_functions.items():
                    future = executor.submit(self._safe_detection_wrapper, 
                                           detection_func, frames, method_name)
                    future_to_method[future] = method_name
                
                # Collect results
                for future in as_completed(future_to_method):
                    method_name = future_to_method[future]
                    try:
                        result = future.result(timeout=30)  # 30 second timeout
                        results[method_name] = result
                    except Exception as e:
                        print(f"Method {method_name} failed: {e}")
                        results[method_name] = 0.5  # Default value
            
            return results
            
        except Exception as e:
            print(f"Parallel processing error: {e}")
            return {}
    
    def _safe_detection_wrapper(self, detection_func: Callable, frames: List, method_name: str):
        """Wrapper for safe execution of detection functions"""
        try:
            return detection_func(frames)
        except Exception as e:
            print(f"Detection method {method_name} error: {e}")
            return 0.5
    
    def process_frame_chunks_parallel(self, frames: List, single_frame_func: Callable) -> List:
        """Process individual frames in parallel"""
        try:
            if not frames:
                return []
            
            results = [None] * len(frames)
            
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                # Submit tasks for each frame
                future_to_index = {}
                
                for i, frame in enumerate(frames):
                    future = executor.submit(self._safe_frame_wrapper, single_frame_func, frame, i)
                    future_to_index[future] = i
                
                # Collect results
                for future in as_completed(future_to_index):
                    index = future_to_index[future]
                    try:
                        result = future.result(timeout=10)  # 10 second timeout per frame
                        results[index] = result
                    except Exception as e:
                        print(f"Frame {index} processing failed: {e}")
                        results[index] = 0.5  # Default value
            
            return results
            
        except Exception as e:
            print(f"Frame chunk processing error: {e}")
            return [0.5] * len(frames)
    
    def _safe_frame_wrapper(self, frame_func: Callable, frame, index: int):
        """Wrapper for safe execution of single frame functions"""
        try:
            return frame_func(frame)
        except Exception as e:
            print(f"Frame {index} processing error: {e}")
            return 0.5
    
    def create_detection_pipeline(self, frames: List) -> Dict:
        """Create optimized detection pipeline"""
        try:
            # Import detection functions
            from facial_analysis import detect_blink_irregularity, analyze_lip_sync, analyze_head_pose
            from temporal_analysis import analyze_optical_flow, analyze_frame_consistency, detect_temporal_artifacts
            from noise_analysis import analyze_fft_spectrum, detect_prnu_noise, analyze_edge_artifacts
            from flicker_analysis import analyze_flicker_artifacts
            from bitplane_analysis import analyze_bitplane_artifacts
            from color_correlation_analysis import analyze_color_correlation_artifacts
            from illumination_analysis import analyze_illumination_consistency
            from boundary_artifact_analysis import analyze_boundary_artifacts
            from temporal_noise_residual import analyze_temporal_noise_residual
            from exposure_analysis import analyze_exposure_consistency, analyze_gamma_consistency
            from coherence_analysis import analyze_cross_modal_coherence
            from prnu_extension import analyze_sensor_pattern_noise
            
            # Define detection methods that can run in parallel
            parallel_methods = {
                'flicker': lambda f: analyze_flicker_artifacts(f),
                'bitplane': lambda f: analyze_bitplane_artifacts(f),
                'color_correlation': lambda f: analyze_color_correlation_artifacts(f),
                'illumination': lambda f: analyze_illumination_consistency(f),
                'boundary_artifacts': lambda f: analyze_boundary_artifacts(f),
                'temporal_noise_residual': lambda f: analyze_temporal_noise_residual(f),
                'exposure_consistency': lambda f: analyze_exposure_consistency(f),
                'gamma_consistency': lambda f: analyze_gamma_consistency(f),
                'coherence': lambda f: analyze_cross_modal_coherence(f),
                'prnu_extension': lambda f: analyze_sensor_pattern_noise(f)
            }
            
            # Process methods in parallel
            parallel_results = self.process_frames_parallel(frames, parallel_methods)
            
            # Sequential methods (require specific order or shared state)
            sequential_results = {}
            
            try:
                sequential_results['blink'] = detect_blink_irregularity(frames)
            except:
                sequential_results['blink'] = 0.5
            
            try:
                sequential_results['optical_flow'] = analyze_optical_flow(frames)
            except:
                sequential_results['optical_flow'] = 0.5
            
            try:
                sequential_results['frame_consistency'] = analyze_frame_consistency(frames)
            except:
                sequential_results['frame_consistency'] = 0.5
            
            try:
                sequential_results['temporal_artifacts'] = detect_temporal_artifacts(frames)
            except:
                sequential_results['temporal_artifacts'] = 0.5
            
            # Single frame methods (can be parallelized per frame)
            if frames:
                sample_frame = frames[len(frames)//2]
                
                try:
                    sequential_results['fft'] = analyze_fft_spectrum(sample_frame)
                except:
                    sequential_results['fft'] = 0.5
                
                try:
                    sequential_results['edge_artifacts'] = analyze_edge_artifacts(sample_frame)
                except:
                    sequential_results['edge_artifacts'] = 0.5
                
                try:
                    sequential_results['prnu'] = detect_prnu_noise(frames)
                except:
                    sequential_results['prnu'] = 0.5
            
            # Combine results
            all_results = {**parallel_results, **sequential_results}
            
            return all_results
            
        except Exception as e:
            print(f"Detection pipeline error: {e}")
            return {}
    
    def optimize_frame_sampling(self, total_frames: int, max_frames: int = 50) -> List[int]:
        """Optimize frame sampling for analysis"""
        try:
            if total_frames <= max_frames:
                return list(range(total_frames))
            
            # Intelligent sampling strategy
            # Always include first, middle, and last frames
            key_frames = [0, total_frames // 2, total_frames - 1]
            
            # Add evenly distributed frames
            remaining_slots = max_frames - len(key_frames)
            if remaining_slots > 0:
                step = total_frames // (remaining_slots + 1)
                additional_frames = [i * step for i in range(1, remaining_slots + 1)]
                key_frames.extend(additional_frames)
            
            # Remove duplicates and sort
            frame_indices = sorted(list(set(key_frames)))
            
            # Ensure we don't exceed bounds
            frame_indices = [i for i in frame_indices if 0 <= i < total_frames]
            
            return frame_indices[:max_frames]
            
        except Exception as e:
            print(f"Frame sampling optimization error: {e}")
            return list(range(min(total_frames, max_frames)))
    
    def process_video_efficiently(self, video_path: str, max_frames: int = 50) -> Dict:
        """Process video with optimized frame sampling and parallel analysis"""
        try:
            # Extract frames efficiently
            cap = cv2.VideoCapture(video_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Optimize frame sampling
            frame_indices = self.optimize_frame_sampling(total_frames, max_frames)
            
            # Extract selected frames
            frames = []
            for frame_idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
            
            cap.release()
            
            if not frames:
                return {}
            
            # Process with parallel pipeline
            results = self.create_detection_pipeline(frames)
            
            # Add metadata
            results['_metadata'] = {
                'total_frames_in_video': total_frames,
                'frames_analyzed': len(frames),
                'frame_indices': frame_indices,
                'parallel_processing': True,
                'max_workers': self.max_workers
            }
            
            return results
            
        except Exception as e:
            print(f"Efficient video processing error: {e}")
            return {}
    
    def get_performance_stats(self) -> Dict:
        """Get performance statistics"""
        return {
            'max_workers': self.max_workers,
            'cpu_count': os.cpu_count(),
            'parallel_processing_enabled': True,
            'recommended_max_frames': 50,
            'chunk_size_auto': True
        }

# Global instance for reuse
import os
frame_processor = MultiThreadedFrameProcessor()