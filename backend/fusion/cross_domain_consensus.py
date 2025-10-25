import numpy as np

class CrossDomainConsensus:
    """Cross-domain consensus matrix for method agreement validation"""
    
    def __init__(self):
        self.domain_groups = {
            'physics': ['lighting_3d', 'specular_highlights', 'shadow_geometry'],
            'texture': ['microtexture_lbp', 'specularity_diffuse', 'surface_roughness'],
            'forensics': ['ela', 'double_jpeg', 'prnu_v2', 'cfa', 'color_constancy'],
            'compression': ['compression', 'resampling', 'jpeg_fingerprint'],
            'camera': ['demosaic_fingerprint', 'lens_shading', 'chromatic_aberration'],
            'frequency': ['wavelet_energy', 'dct_cooccurrence', 'frequency_artifacts']
        }
        
        # Compatibility matrix - which domains should agree
        self.compatibility_matrix = {
            'physics': ['texture', 'forensics'],
            'texture': ['physics', 'camera'],
            'forensics': ['physics', 'compression'],
            'compression': ['forensics', 'camera'],
            'camera': ['texture', 'compression'],
            'frequency': ['forensics', 'compression']
        }
    
    def calculate_consensus_matrix(self, features):
        """Calculate consensus agreement matrix between domains"""
        try:
            # Calculate domain scores
            domain_scores = {}
            for domain, methods in self.domain_groups.items():
                scores = []
                for method in methods:
                    if method in features:
                        score = features[method]
                        # Normalize to 0-1
                        if score > 1:
                            score = score / 100.0
                        scores.append(score)
                
                if scores:
                    domain_scores[domain] = np.mean(scores)
            
            # Build consensus matrix
            consensus_matrix = {}
            agreements = []
            disagreements = []
            
            for domain1, compatible_domains in self.compatibility_matrix.items():
                if domain1 not in domain_scores:
                    continue
                
                consensus_matrix[domain1] = {}
                
                for domain2 in compatible_domains:
                    if domain2 not in domain_scores:
                        continue
                    
                    score1 = domain_scores[domain1]
                    score2 = domain_scores[domain2]
                    
                    # Calculate agreement (1 - absolute difference)
                    agreement = 1.0 - abs(score1 - score2)
                    consensus_matrix[domain1][domain2] = agreement
                    
                    # Classify as agreement or disagreement
                    if agreement > 0.7:  # Strong agreement
                        agreements.append((domain1, domain2, agreement))
                    elif agreement < 0.4:  # Strong disagreement
                        disagreements.append((domain1, domain2, agreement))
            
            return {
                'domain_scores': domain_scores,
                'consensus_matrix': consensus_matrix,
                'agreements': agreements,
                'disagreements': disagreements,
                'overall_consensus': self._calculate_overall_consensus(consensus_matrix)
            }
            
        except Exception as e:
            print(f"Consensus matrix error: {e}")
            return self._default_consensus()
    
    def _calculate_overall_consensus(self, consensus_matrix):
        """Calculate overall consensus score"""
        try:
            all_agreements = []
            
            for domain1, agreements in consensus_matrix.items():
                for domain2, agreement in agreements.items():
                    all_agreements.append(agreement)
            
            if all_agreements:
                return np.mean(all_agreements)
            
            return 0.5
            
        except:
            return 0.5
    
    def validate_consensus(self, consensus_result):
        """Validate consensus and determine if result is reliable"""
        try:
            disagreements = consensus_result['disagreements']
            overall_consensus = consensus_result['overall_consensus']
            
            # Check for critical disagreements
            critical_disagreements = []
            
            for domain1, domain2, agreement in disagreements:
                # Physics vs other domains is critical
                if 'physics' in [domain1, domain2] and agreement < 0.3:
                    critical_disagreements.append((domain1, domain2, agreement))
                
                # Forensics vs compression disagreement is also critical
                if set([domain1, domain2]) == set(['forensics', 'compression']) and agreement < 0.3:
                    critical_disagreements.append((domain1, domain2, agreement))
            
            # Determine reliability
            if critical_disagreements:
                return {
                    'reliable': False,
                    'reason': f'Critical disagreement between {critical_disagreements[0][0]} and {critical_disagreements[0][1]}',
                    'recommendation': 'INCONCLUSIVE'
                }
            
            if overall_consensus < 0.4:
                return {
                    'reliable': False,
                    'reason': f'Low overall consensus ({overall_consensus:.2f})',
                    'recommendation': 'INCONCLUSIVE'
                }
            
            if len(disagreements) > len(consensus_result['agreements']):
                return {
                    'reliable': False,
                    'reason': 'More disagreements than agreements',
                    'recommendation': 'INCONCLUSIVE'
                }
            
            return {
                'reliable': True,
                'reason': f'Good consensus ({overall_consensus:.2f})',
                'recommendation': 'PROCEED'
            }
            
        except:
            return {
                'reliable': False,
                'reason': 'Consensus validation failed',
                'recommendation': 'INCONCLUSIVE'
            }
    
    def get_majority_verdict(self, domain_scores):
        """Get majority verdict from domain scores"""
        try:
            # Convert scores to verdicts
            verdicts = {}
            for domain, score in domain_scores.items():
                if score > 0.6:
                    verdicts[domain] = 'AUTHENTIC'
                elif score < 0.4:
                    verdicts[domain] = 'FAKE'
                else:
                    verdicts[domain] = 'UNCERTAIN'
            
            # Count verdicts
            authentic_count = sum(1 for v in verdicts.values() if v == 'AUTHENTIC')
            fake_count = sum(1 for v in verdicts.values() if v == 'FAKE')
            uncertain_count = sum(1 for v in verdicts.values() if v == 'UNCERTAIN')
            
            total_votes = len(verdicts)
            
            # Determine majority
            if authentic_count > total_votes / 2:
                return 'AUTHENTIC', authentic_count / total_votes
            elif fake_count > total_votes / 2:
                return 'FAKE', fake_count / total_votes
            else:
                return 'UNCERTAIN', uncertain_count / total_votes
            
        except:
            return 'UNCERTAIN', 0.5
    
    def _default_consensus(self):
        """Return default consensus result"""
        return {
            'domain_scores': {},
            'consensus_matrix': {},
            'agreements': [],
            'disagreements': [],
            'overall_consensus': 0.5
        }