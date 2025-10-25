import json
import os
import numpy as np
from datetime import datetime, timedelta

class AdaptiveThresholdOptimizer:
    """Adaptive threshold tuning engine for detection methods"""
    
    def __init__(self, storage_path="threshold_data.json"):
        self.storage_path = storage_path
        self.threshold_data = self.load_threshold_data()
        self.learning_rate = 0.1
        self.window_size = 100  # Number of recent analyses to consider
    
    def load_threshold_data(self):
        """Load existing threshold data from storage"""
        try:
            if os.path.exists(self.storage_path):
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)
                return data
            else:
                return self.initialize_default_thresholds()
        except:
            return self.initialize_default_thresholds()
    
    def initialize_default_thresholds(self):
        """Initialize default threshold values"""
        return {
            "thresholds": {
                "blink": 0.25,
                "lip_sync": 0.3,
                "head_pose": 0.35,
                "optical_flow": 0.4,
                "frame_consistency": 0.3,
                "temporal_artifacts": 0.35,
                "flicker": 0.3,
                "fft_spectrum": 0.4,
                "prnu_noise": 0.35,
                "edge_artifacts": 0.4,
                "bitplane": 0.4,
                "color_correlation": 0.35,
                "illumination": 0.4,
                "boundary_artifacts": 0.35,
                "metadata": 0.3,
                "compression": 0.4,
                "temporal_noise_residual": 0.35,
                "exposure_analysis": 0.4,
                "coherence_analysis": 0.3
            },
            "statistics": {},
            "last_updated": datetime.now().isoformat(),
            "analysis_count": 0
        }
    
    def save_threshold_data(self):
        """Save threshold data to storage"""
        try:
            self.threshold_data["last_updated"] = datetime.now().isoformat()
            with open(self.storage_path, 'w') as f:
                json.dump(self.threshold_data, f, indent=2)
            return True
        except Exception as e:
            print(f"Failed to save threshold data: {e}")
            return False
    
    def update_method_statistics(self, method_name, score, is_authentic):
        """Update statistics for a detection method"""
        try:
            if method_name not in self.threshold_data["statistics"]:
                self.threshold_data["statistics"][method_name] = {
                    "authentic_scores": [],
                    "fake_scores": [],
                    "recent_scores": [],
                    "mean_authentic": 0.5,
                    "mean_fake": 0.5,
                    "std_authentic": 0.2,
                    "std_fake": 0.2,
                    "last_updated": datetime.now().isoformat()
                }
            
            stats = self.threshold_data["statistics"][method_name]
            
            # Add to appropriate category
            if is_authentic:
                stats["authentic_scores"].append(score)
                # Keep only recent scores
                if len(stats["authentic_scores"]) > self.window_size:
                    stats["authentic_scores"] = stats["authentic_scores"][-self.window_size:]
            else:
                stats["fake_scores"].append(score)
                if len(stats["fake_scores"]) > self.window_size:
                    stats["fake_scores"] = stats["fake_scores"][-self.window_size:]
            
            # Add to recent scores
            stats["recent_scores"].append({
                "score": score,
                "is_authentic": is_authentic,
                "timestamp": datetime.now().isoformat()
            })
            if len(stats["recent_scores"]) > self.window_size:
                stats["recent_scores"] = stats["recent_scores"][-self.window_size:]
            
            # Update statistics
            if stats["authentic_scores"]:
                stats["mean_authentic"] = np.mean(stats["authentic_scores"])
                stats["std_authentic"] = np.std(stats["authentic_scores"])
            
            if stats["fake_scores"]:
                stats["mean_fake"] = np.mean(stats["fake_scores"])
                stats["std_fake"] = np.std(stats["fake_scores"])
            
            stats["last_updated"] = datetime.now().isoformat()
            
        except Exception as e:
            print(f"Failed to update statistics for {method_name}: {e}")
    
    def calculate_optimal_threshold(self, method_name):
        """Calculate optimal threshold for a method based on statistics"""
        try:
            if method_name not in self.threshold_data["statistics"]:
                return self.threshold_data["thresholds"].get(method_name, 0.5)
            
            stats = self.threshold_data["statistics"][method_name]
            
            # Need sufficient data for both classes
            if len(stats["authentic_scores"]) < 5 or len(stats["fake_scores"]) < 5:
                return self.threshold_data["thresholds"].get(method_name, 0.5)
            
            mean_authentic = stats["mean_authentic"]
            mean_fake = stats["mean_fake"]
            std_authentic = stats["std_authentic"]
            std_fake = stats["std_fake"]
            
            # Calculate threshold that minimizes classification error
            # Use midpoint between means, adjusted for standard deviations
            if mean_authentic != mean_fake:
                # Weighted midpoint based on standard deviations
                weight_authentic = 1 / (std_authentic + 1e-6)
                weight_fake = 1 / (std_fake + 1e-6)
                
                optimal_threshold = (
                    (mean_authentic * weight_authentic + mean_fake * weight_fake) /
                    (weight_authentic + weight_fake)
                )
            else:
                optimal_threshold = (mean_authentic + mean_fake) / 2
            
            # Clamp to reasonable range
            optimal_threshold = max(0.1, min(0.9, optimal_threshold))
            
            return optimal_threshold
            
        except Exception as e:
            print(f"Failed to calculate optimal threshold for {method_name}: {e}")
            return self.threshold_data["thresholds"].get(method_name, 0.5)
    
    def update_threshold(self, method_name, force_update=False):
        """Update threshold for a method using adaptive learning"""
        try:
            current_threshold = self.threshold_data["thresholds"].get(method_name, 0.5)
            optimal_threshold = self.calculate_optimal_threshold(method_name)
            
            # Only update if we have sufficient confidence or forced
            stats = self.threshold_data["statistics"].get(method_name, {})
            authentic_count = len(stats.get("authentic_scores", []))
            fake_count = len(stats.get("fake_scores", []))
            
            if force_update or (authentic_count >= 10 and fake_count >= 10):
                # Gradual update using learning rate
                new_threshold = (
                    (1 - self.learning_rate) * current_threshold +
                    self.learning_rate * optimal_threshold
                )
                
                self.threshold_data["thresholds"][method_name] = new_threshold
                return new_threshold
            
            return current_threshold
            
        except Exception as e:
            print(f"Failed to update threshold for {method_name}: {e}")
            return self.threshold_data["thresholds"].get(method_name, 0.5)
    
    def get_current_threshold(self, method_name):
        """Get current threshold for a method"""
        return self.threshold_data["thresholds"].get(method_name, 0.5)
    
    def update_all_thresholds(self):
        """Update all thresholds based on accumulated statistics"""
        updated_methods = []
        
        for method_name in self.threshold_data["thresholds"].keys():
            old_threshold = self.threshold_data["thresholds"][method_name]
            new_threshold = self.update_threshold(method_name)
            
            if abs(new_threshold - old_threshold) > 0.01:  # Significant change
                updated_methods.append({
                    "method": method_name,
                    "old_threshold": round(old_threshold, 3),
                    "new_threshold": round(new_threshold, 3),
                    "change": round(new_threshold - old_threshold, 3)
                })
        
        if updated_methods:
            self.save_threshold_data()
        
        return updated_methods
    
    def get_method_performance(self, method_name):
        """Get performance statistics for a method"""
        try:
            if method_name not in self.threshold_data["statistics"]:
                return None
            
            stats = self.threshold_data["statistics"][method_name]
            threshold = self.threshold_data["thresholds"][method_name]
            
            # Calculate accuracy metrics
            authentic_scores = stats["authentic_scores"]
            fake_scores = stats["fake_scores"]
            
            if not authentic_scores or not fake_scores:
                return None
            
            # True positives: authentic scores above threshold
            tp = sum(1 for score in authentic_scores if score >= threshold)
            # False negatives: authentic scores below threshold
            fn = len(authentic_scores) - tp
            # True negatives: fake scores below threshold
            tn = sum(1 for score in fake_scores if score < threshold)
            # False positives: fake scores above threshold
            fp = len(fake_scores) - tn
            
            total = tp + tn + fp + fn
            
            if total == 0:
                return None
            
            accuracy = (tp + tn) / total
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            return {
                "accuracy": round(accuracy, 3),
                "precision": round(precision, 3),
                "recall": round(recall, 3),
                "f1_score": round(f1_score, 3),
                "threshold": round(threshold, 3),
                "sample_count": total,
                "authentic_samples": len(authentic_scores),
                "fake_samples": len(fake_scores)
            }
            
        except Exception as e:
            print(f"Failed to calculate performance for {method_name}: {e}")
            return None
    
    def get_system_performance_summary(self):
        """Get overall system performance summary"""
        try:
            summary = {
                "total_analyses": self.threshold_data.get("analysis_count", 0),
                "last_updated": self.threshold_data.get("last_updated", "never"),
                "method_performance": {},
                "overall_metrics": {
                    "avg_accuracy": 0,
                    "methods_with_data": 0,
                    "total_methods": len(self.threshold_data["thresholds"])
                }
            }
            
            accuracies = []
            methods_with_data = 0
            
            for method_name in self.threshold_data["thresholds"].keys():
                performance = self.get_method_performance(method_name)
                if performance:
                    summary["method_performance"][method_name] = performance
                    accuracies.append(performance["accuracy"])
                    methods_with_data += 1
            
            if accuracies:
                summary["overall_metrics"]["avg_accuracy"] = round(np.mean(accuracies), 3)
            
            summary["overall_metrics"]["methods_with_data"] = methods_with_data
            
            return summary
            
        except Exception as e:
            print(f"Failed to generate performance summary: {e}")
            return {"error": str(e)}
    
    def record_analysis_result(self, detection_results, ground_truth_authentic=None):
        """Record analysis result for threshold optimization"""
        try:
            if ground_truth_authentic is None:
                # Auto-determine based on authenticity score (for unsupervised learning)
                authenticity_score = detection_results.get('authenticity_score', 50.0)
                ground_truth_authentic = authenticity_score >= 60.0
            
            # Update statistics for each method
            individual_scores = detection_results.get('individual_scores', {})
            
            for method_name, score in individual_scores.items():
                # Convert score to 0-1 range (assuming scores are 0-100)
                normalized_score = score / 100.0
                self.update_method_statistics(method_name, normalized_score, ground_truth_authentic)
            
            # Increment analysis count
            self.threshold_data["analysis_count"] = self.threshold_data.get("analysis_count", 0) + 1
            
            # Periodically update thresholds
            if self.threshold_data["analysis_count"] % 50 == 0:  # Every 50 analyses
                self.update_all_thresholds()
            
            # Save data periodically
            if self.threshold_data["analysis_count"] % 10 == 0:  # Every 10 analyses
                self.save_threshold_data()
            
        except Exception as e:
            print(f"Failed to record analysis result: {e}")