import numpy as np
import cv2

class AdaptiveFusionEngine:
    """Smart fusion engine with adaptive weighting and evidence-based decisions"""
    
    def __init__(self):
        self.base_weights = {
            'facial': 0.25,
            'temporal': 0.20,
            'noise': 0.20,
            'forensics': 0.15,
            'compression': 0.15,
            'metadata': 0.05
        }
        
        self.method_groups = {
            'facial': ['blink', 'lip_sync', 'head_pose'],
            'temporal': ['optical_flow', 'frame_consistency', 'temporal_artifacts', 'flicker', 'temporal_noise_residual'],
            'noise': ['fft', 'prnu', 'prnu_v2', 'edge_artifacts', 'bitplane', 'color_correlation', 'nlf', 'cfa', 'chromatic_aberration'],
            'forensics': ['illumination', 'boundary_artifacts', 'exposure_consistency', 'gamma_consistency', 'color_constancy', 'lens_distortion'],
            'compression': ['compression', 'double_compression', 'ela', 'double_jpeg', 'resampling'],
            'metadata': ['metadata', 'exif']
        }
    
    def adaptive_fusion(self, features, quality_info=None, metadata_info=None):
        """Perform adaptive fusion based on available evidence"""
        try:
            # Calculate adaptive weights
            adaptive_weights = self._calculate_adaptive_weights(features, quality_info, metadata_info)
            
            # Group features by category
            group_scores = self._calculate_group_scores(features)
            
            # Apply penalty factors for conflicting methods
            penalized_scores = self._apply_conflict_penalties(group_scores, features)
            
            # Calculate weighted final score
            final_score = self._calculate_weighted_score(penalized_scores, adaptive_weights)
            
            # Determine classification with adaptive thresholds
            classification = self._adaptive_classification(final_score, quality_info, group_scores)
            
            return {
                'final_score': final_score,
                'classification': classification,
                'adaptive_weights': adaptive_weights,
                'group_scores': group_scores,
                'penalty_applied': any(penalized_scores[k] != group_scores[k] for k in group_scores.keys())
            }
            
        except Exception as e:
            print(f"Adaptive fusion error: {e}")
            return self._default_fusion_result()
    
    def _calculate_adaptive_weights(self, features, quality_info, metadata_info):
        """Calculate adaptive weights based on available evidence"""
        weights = self.base_weights.copy()
        
        # Adjust for metadata availability
        if metadata_info:
            metadata_score = metadata_info.get('metadata_score', 0.5)
            if metadata_score < 0.3:  # Low metadata availability
                # Reduce metadata and some forensics weights
                weights['metadata'] *= 0.5
                weights['forensics'] *= 0.8  # Some forensics depend on metadata
                
                # Redistribute to more reliable methods
                extra_weight = 0.025 + (0.15 * 0.2)  # From metadata and forensics reduction
                weights['facial'] += extra_weight * 0.4
                weights['temporal'] += extra_weight * 0.3
                weights['noise'] += extra_weight * 0.3
        
        # Adjust for quality
        if quality_info:
            quality_score = quality_info.get('quality', 70) / 100.0
            if quality_score < 0.6:  # Low quality
                # Reduce noise-sensitive methods
                weights['noise'] *= 0.7
                weights['compression'] *= 0.8
                
                # Increase robust methods
                extra_weight = (0.20 * 0.3) + (0.15 * 0.2)
                weights['facial'] += extra_weight * 0.6
                weights['temporal'] += extra_weight * 0.4
        
        # Adjust based on available methods
        available_groups = set()
        for group, methods in self.method_groups.items():
            if any(method in features for method in methods):
                available_groups.add(group)
        
        # Redistribute weights from missing groups
        missing_groups = set(weights.keys()) - available_groups
        total_missing_weight = sum(weights[group] for group in missing_groups)
        
        if total_missing_weight > 0 and available_groups:
            # Remove weights for missing groups
            for group in missing_groups:
                weights[group] = 0
            
            # Redistribute to available groups
            redistribution_per_group = total_missing_weight / len(available_groups)
            for group in available_groups:
                weights[group] += redistribution_per_group
        
        # Normalize weights
        total_weight = sum(weights.values())
        if total_weight > 0:
            weights = {k: v/total_weight for k, v in weights.items()}
        
        return weights
    
    def _calculate_group_scores(self, features):
        """Calculate scores for each method group"""
        group_scores = {}
        
        for group_name, methods in self.method_groups.items():
            group_values = []
            
            for method in methods:
                if method in features:
                    score = features[method]
                    # Normalize to 0-1 range
                    if score > 1:
                        score = score / 100.0
                    group_values.append(score)
            
            if group_values:
                # Use weighted average with outlier handling
                group_scores[group_name] = self._robust_average(group_values)
            else:
                group_scores[group_name] = 0.5  # Neutral score for missing groups
        
        return group_scores
    
    def _robust_average(self, values):
        """Calculate robust average with outlier handling"""
        if len(values) == 1:
            return values[0]
        
        values = np.array(values)
        
        # Remove outliers using IQR method
        q1 = np.percentile(values, 25)
        q3 = np.percentile(values, 75)
        iqr = q3 - q1
        
        if iqr > 0:
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            # Keep values within bounds
            filtered_values = values[(values >= lower_bound) & (values <= upper_bound)]
            
            if len(filtered_values) > 0:
                return np.mean(filtered_values)
        
        # Fallback to regular mean
        return np.mean(values)
    
    def _apply_conflict_penalties(self, group_scores, features):
        """Apply penalties for conflicting method results"""
        penalized_scores = group_scores.copy()
        
        # Check for high disagreement between groups
        scores = list(group_scores.values())
        if len(scores) > 1:
            score_variance = np.var(scores)
            
            # If high variance, apply penalty to extreme scores
            if score_variance > 0.1:  # High disagreement threshold
                mean_score = np.mean(scores)
                
                for group, score in group_scores.items():
                    deviation = abs(score - mean_score)
                    if deviation > 0.3:  # Outlier threshold
                        # Apply penalty proportional to deviation
                        penalty_factor = 1.0 - (deviation * 0.2)
                        penalized_scores[group] = score * max(0.5, penalty_factor)
        
        return penalized_scores
    
    def _calculate_weighted_score(self, group_scores, weights):
        """Calculate final weighted score"""
        total_score = 0.0
        total_weight = 0.0
        
        for group, score in group_scores.items():
            weight = weights.get(group, 0)
            if weight > 0:
                total_score += score * weight
                total_weight += weight
        
        if total_weight > 0:
            return (total_score / total_weight) * 100  # Convert to percentage
        
        return 50.0  # Default neutral score
    
    def _adaptive_classification(self, score, quality_info, group_scores):
        """Determine classification with adaptive thresholds"""
        # Base thresholds
        thresholds = {
            'authentic': 75,
            'likely_authentic': 60,
            'suspicious': 40,
            'likely_fake': 0
        }
        
        # Adjust thresholds based on quality
        if quality_info:
            quality_score = quality_info.get('quality', 70)
            if quality_score < 50:  # Low quality - be more conservative
                thresholds['authentic'] += 5
                thresholds['likely_authentic'] += 5
            elif quality_score > 80:  # High quality - be more confident
                thresholds['authentic'] -= 3
                thresholds['likely_authentic'] -= 3
        
        # Adjust based on group consensus
        group_values = list(group_scores.values())
        if len(group_values) > 1:
            group_variance = np.var([v * 100 for v in group_values])  # Convert to percentage scale
            
            if group_variance > 400:  # High disagreement (20% std dev)
                # Be more conservative - move towards inconclusive
                if 45 <= score <= 70:
                    return 'INCONCLUSIVE'
        
        # Apply thresholds
        if score >= thresholds['authentic']:
            return 'AUTHENTIC_HUMAN'
        elif score >= thresholds['likely_authentic']:
            return 'LIKELY_AUTHENTIC'
        elif score >= thresholds['suspicious']:
            return 'SUSPICIOUS'
        else:
            return 'LIKELY_DEEPFAKE'
    
    def _default_fusion_result(self):
        """Return default fusion result"""
        return {
            'final_score': 50.0,
            'classification': 'INCONCLUSIVE',
            'adaptive_weights': self.base_weights,
            'group_scores': {},
            'penalty_applied': False
        }