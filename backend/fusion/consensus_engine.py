import numpy as np
from collections import defaultdict

class ConsensusEngine:
    """Advanced consensus engine with abstain rules and multi-group validation"""
    
    def __init__(self):
        self.method_groups = {
            'facial': ['blink', 'lip_sync', 'head_pose'],
            'temporal': ['optical_flow', 'frame_consistency', 'temporal_artifacts', 'flicker'],
            'noise': ['fft', 'prnu', 'edge_artifacts', 'bitplane', 'color_correlation'],
            'forensics': ['illumination', 'boundary_artifacts', 'exposure_consistency', 'gamma_consistency'],
            'compression': ['compression', 'double_compression', 'ela', 'jpeg_analysis'],
            'metadata': ['metadata', 'exif']
        }
        
        self.abstain_range = (45, 65)  # Score range to abstain
        self.require_two_groups = True
        self.disagreement_threshold = 0.3
    
    def analyze_consensus(self, individual_scores, metadata_info=None):
        """Analyze consensus across detection methods with abstain rules"""
        try:
            if not individual_scores:
                return self._default_consensus()
            
            # Calculate group scores
            group_scores = self._calculate_group_scores(individual_scores)
            
            # Check for disagreement
            disagreement_level = self._calculate_disagreement(group_scores)
            
            # Calculate overall score
            overall_score = self._calculate_weighted_score(individual_scores, metadata_info)
            
            # Apply consensus rules
            consensus_result = self._apply_consensus_rules(
                overall_score, group_scores, disagreement_level, metadata_info
            )
            
            return consensus_result
            
        except Exception as e:
            print(f"Consensus analysis error: {e}")
            return self._default_consensus()
    
    def _calculate_group_scores(self, individual_scores):
        """Calculate scores for each method group"""
        group_scores = {}
        
        for group_name, methods in self.method_groups.items():
            group_values = []
            
            for method in methods:
                if method in individual_scores:
                    score = individual_scores[method]
                    # Convert to 0-1 range if needed
                    if score > 1:
                        score = score / 100.0
                    group_values.append(score)
            
            if group_values:
                group_scores[group_name] = {
                    'mean': np.mean(group_values),
                    'std': np.std(group_values),
                    'count': len(group_values),
                    'values': group_values
                }
            else:
                group_scores[group_name] = {
                    'mean': 0.5,
                    'std': 0.0,
                    'count': 0,
                    'values': []
                }
        
        return group_scores
    
    def _calculate_disagreement(self, group_scores):
        """Calculate disagreement level between groups"""
        try:
            group_means = [info['mean'] for info in group_scores.values() if info['count'] > 0]
            
            if len(group_means) < 2:
                return 0.0
            
            # Calculate variance between group means
            disagreement = np.std(group_means)
            
            return disagreement
            
        except:
            return 0.0
    
    def _calculate_weighted_score(self, individual_scores, metadata_info):
        """Calculate weighted overall score with metadata adjustments"""
        try:
            # Base weights
            weights = {
                'facial': 0.25,
                'temporal': 0.20,
                'noise': 0.20,
                'forensics': 0.15,
                'compression': 0.15,
                'metadata': 0.05
            }
            
            # Adjust weights based on metadata availability
            if metadata_info:
                metadata_score = metadata_info.get('metadata_score', 0.5)
                if metadata_score < 0.3:  # Low metadata availability
                    # Reduce metadata and PRNU weights, increase others
                    weights['metadata'] *= 0.5
                    weights['noise'] *= 0.8  # PRNU is part of noise group
                    
                    # Redistribute weight to more reliable methods
                    extra_weight = 0.025 + 0.04  # From metadata and noise reduction
                    weights['facial'] += extra_weight * 0.4
                    weights['temporal'] += extra_weight * 0.3
                    weights['forensics'] += extra_weight * 0.3
            
            # Calculate group scores
            group_scores = self._calculate_group_scores(individual_scores)
            
            # Calculate weighted average
            total_score = 0.0
            total_weight = 0.0
            
            for group_name, weight in weights.items():
                if group_name in group_scores and group_scores[group_name]['count'] > 0:
                    group_mean = group_scores[group_name]['mean']
                    total_score += group_mean * weight
                    total_weight += weight
            
            if total_weight > 0:
                final_score = total_score / total_weight
            else:
                final_score = 0.5
            
            # Convert to percentage
            return final_score * 100
            
        except:
            return 50.0
    
    def _apply_consensus_rules(self, overall_score, group_scores, disagreement_level, metadata_info):
        """Apply consensus rules and determine final classification"""
        try:
            # Check for abstain conditions
            should_abstain = False
            abstain_reason = None
            
            # Rule 1: Score in abstain range
            if self.abstain_range[0] <= overall_score <= self.abstain_range[1]:
                should_abstain = True
                abstain_reason = f"Score in uncertain range ({overall_score:.1f}%)"
            
            # Rule 2: High disagreement between groups
            if disagreement_level > self.disagreement_threshold:
                should_abstain = True
                abstain_reason = f"High disagreement between detection groups (σ={disagreement_level:.2f})"
            
            # Rule 3: Require multiple group consensus
            if self.require_two_groups:
                suspicious_groups = 0
                for group_name, group_info in group_scores.items():
                    if group_info['count'] > 0 and group_info['mean'] < 0.5:  # Suspicious (low authenticity)
                        suspicious_groups += 1
                
                if suspicious_groups < 2 and overall_score > 60:
                    # Only one group is suspicious, but overall score suggests fake
                    should_abstain = True
                    abstain_reason = f"Insufficient group consensus (only {suspicious_groups} groups suspicious)"
            
            # Determine final classification
            if should_abstain:
                classification = "INCONCLUSIVE"
                risk_level = "REVIEW_REQUIRED"
                confidence = 0.3
            else:
                # Standard classification
                if overall_score >= 80:
                    classification = "AUTHENTIC_HUMAN"
                    risk_level = "SAFE"
                elif overall_score >= 60:
                    classification = "LIKELY_AUTHENTIC"
                    risk_level = "LOW"
                elif overall_score >= 40:
                    classification = "SUSPICIOUS"
                    risk_level = "MEDIUM"
                else:
                    classification = "LIKELY_DEEPFAKE"
                    risk_level = "HIGH"
                
                # Calculate confidence based on group agreement
                confidence = max(0.5, 1.0 - disagreement_level)
            
            return {
                'overall_score': overall_score,
                'classification': classification,
                'risk_level': risk_level,
                'confidence': confidence,
                'group_scores': group_scores,
                'disagreement_level': disagreement_level,
                'should_abstain': should_abstain,
                'abstain_reason': abstain_reason,
                'suspicious_groups': self._identify_suspicious_groups(group_scores)
            }
            
        except Exception as e:
            print(f"Consensus rules error: {e}")
            return self._default_consensus()
    
    def _identify_suspicious_groups(self, group_scores):
        """Identify which groups are flagging as suspicious"""
        suspicious = []
        
        for group_name, group_info in group_scores.items():
            if group_info['count'] > 0 and group_info['mean'] < 0.5:
                suspicious.append({
                    'group': group_name,
                    'score': group_info['mean'],
                    'methods': len(group_info['values'])
                })
        
        return suspicious
    
    def _default_consensus(self):
        """Return default consensus result"""
        return {
            'overall_score': 50.0,
            'classification': "INCONCLUSIVE",
            'risk_level': "MEDIUM",
            'confidence': 0.3,
            'group_scores': {},
            'disagreement_level': 0.0,
            'should_abstain': True,
            'abstain_reason': "Analysis failed",
            'suspicious_groups': []
        }