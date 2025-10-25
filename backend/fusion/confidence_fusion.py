import numpy as np

class ConfidenceAwareFusion:
    """Confidence-aware fusion with probabilistic weighting"""
    
    def __init__(self):
        self.method_groups = {
            'physics': ['lighting_3d', 'specular_highlights', 'shadow_geometry'],
            'texture': ['microtexture_lbp', 'specularity_diffuse', 'surface_roughness'],
            'forensics': ['ela', 'double_jpeg', 'prnu_v2', 'cfa', 'color_constancy'],
            'compression': ['compression', 'resampling', 'jpeg_fingerprint'],
            'camera': ['demosaic_fingerprint', 'lens_shading', 'chromatic_aberration'],
            'frequency': ['wavelet_energy', 'dct_cooccurrence', 'frequency_artifacts']
        }
    
    def calculate_confidence_scores(self, features, quality_info, metadata_info):
        """Calculate confidence for each method group"""
        confidences = {}
        
        # Base confidence factors
        resolution_factor = self._get_resolution_confidence(quality_info)
        compression_factor = self._get_compression_confidence(quality_info)
        metadata_factor = self._get_metadata_confidence(metadata_info)
        
        for group, methods in self.method_groups.items():
            group_confidence = self._calculate_group_confidence(
                group, methods, features, resolution_factor, compression_factor, metadata_factor
            )
            confidences[group] = group_confidence
        
        return confidences
    
    def _get_resolution_confidence(self, quality_info):
        """Calculate confidence based on image resolution"""
        if not quality_info or 'size' not in quality_info:
            return 0.5
        
        w, h = quality_info['size']
        min_dim = min(w, h)
        
        if min_dim >= 1024:
            return 1.0
        elif min_dim >= 512:
            return 0.8
        elif min_dim >= 256:
            return 0.6
        else:
            return 0.3
    
    def _get_compression_confidence(self, quality_info):
        """Calculate confidence based on compression quality"""
        if not quality_info or 'quality' not in quality_info:
            return 0.5
        
        quality = quality_info['quality']
        
        if quality >= 90:
            return 1.0
        elif quality >= 70:
            return 0.8
        elif quality >= 50:
            return 0.6
        else:
            return 0.3
    
    def _get_metadata_confidence(self, metadata_info):
        """Calculate confidence based on metadata availability"""
        if not metadata_info:
            return 0.3
        
        return metadata_info.get('metadata_score', 0.5)
    
    def _calculate_group_confidence(self, group, methods, features, res_conf, comp_conf, meta_conf):
        """Calculate confidence for a specific method group"""
        # Base confidence from image quality
        base_confidence = (res_conf + comp_conf + meta_conf) / 3
        
        # Group-specific adjustments
        if group == 'physics':
            # Physics methods need good resolution and lighting
            return base_confidence * 0.9 if res_conf > 0.6 else base_confidence * 0.5
        
        elif group == 'texture':
            # Texture analysis needs high resolution
            return base_confidence if res_conf > 0.7 else base_confidence * 0.6
        
        elif group == 'forensics':
            # Forensics methods affected by compression
            return base_confidence if comp_conf > 0.6 else base_confidence * 0.7
        
        elif group == 'compression':
            # Compression analysis needs original quality info
            return base_confidence * 1.1 if comp_conf > 0.5 else base_confidence * 0.4
        
        elif group == 'camera':
            # Camera fingerprinting needs metadata
            return base_confidence if meta_conf > 0.4 else base_confidence * 0.5
        
        elif group == 'frequency':
            # Frequency analysis robust to moderate compression
            return base_confidence * 0.95
        
        return base_confidence
    
    def fuse_with_confidence(self, features, confidences):
        """Perform confidence-weighted fusion"""
        try:
            # Calculate group scores
            group_scores = {}
            weighted_scores = {}
            
            for group, methods in self.method_groups.items():
                group_values = []
                for method in methods:
                    if method in features:
                        score = features[method]
                        # Normalize to 0-1 range
                        if score > 1:
                            score = score / 100.0
                        group_values.append(score)
                
                if group_values:
                    group_score = np.mean(group_values)
                    group_scores[group] = group_score
                    
                    # Apply confidence weighting
                    confidence = confidences.get(group, 0.5)
                    weighted_scores[group] = group_score * confidence
            
            # Calculate final score with confidence normalization
            total_confidence = sum(confidences.values())
            if total_confidence > 0:
                final_score = sum(weighted_scores.values()) / total_confidence
            else:
                final_score = 0.5
            
            return {
                'final_score': final_score * 100,  # Convert to percentage
                'group_scores': group_scores,
                'confidences': confidences,
                'weighted_scores': weighted_scores
            }
            
        except Exception as e:
            print(f"Confidence fusion error: {e}")
            return {
                'final_score': 50.0,
                'group_scores': {},
                'confidences': {},
                'weighted_scores': {}
            }
    
    def make_decision(self, fusion_result, quality_info):
        """Make final decision with confidence thresholds"""
        final_score = fusion_result['final_score']
        confidences = fusion_result['confidences']
        
        # Calculate overall confidence
        avg_confidence = np.mean(list(confidences.values())) if confidences else 0.3
        
        # Quality-based decision thresholds
        quality_score = quality_info.get('quality', 70) / 100.0 if quality_info else 0.7
        
        # Adjust thresholds based on confidence and quality
        if avg_confidence < 0.4 or quality_score < 0.4:
            return 'INCONCLUSIVE', 'Low confidence or poor quality'
        
        # Adaptive thresholds
        if quality_score > 0.8 and avg_confidence > 0.7:
            # High quality - be more confident
            authentic_threshold = 70
            suspicious_threshold = 45
        else:
            # Lower quality - be more conservative
            authentic_threshold = 75
            suspicious_threshold = 40
        
        # Check for group disagreement
        group_scores = fusion_result['group_scores']
        if len(group_scores) > 1:
            score_variance = np.var(list(group_scores.values())) * 10000  # Scale for percentage
            if score_variance > 400:  # High disagreement
                return 'INCONCLUSIVE', f'High disagreement between methods (variance={score_variance:.0f})'
        
        # Make classification
        if final_score >= authentic_threshold:
            return 'AUTHENTIC_HUMAN', f'Score: {final_score:.1f}%, Confidence: {avg_confidence:.2f}'
        elif final_score >= suspicious_threshold:
            return 'SUSPICIOUS', f'Score: {final_score:.1f}%, Confidence: {avg_confidence:.2f}'
        else:
            return 'LIKELY_DEEPFAKE', f'Score: {final_score:.1f}%, Confidence: {avg_confidence:.2f}'