import json
import numpy as np

class DebugAnalyzer:
    """Debug analyzer for method score visualization and fusion debugging"""
    
    def __init__(self):
        self.method_groups = {
            'physics': ['lighting_3d', 'specular_highlights', 'shadow_geometry'],
            'texture': ['microtexture_lbp', 'specularity_diffuse', 'surface_roughness'],
            'forensics': ['ela', 'double_jpeg', 'prnu_v2', 'cfa', 'color_constancy'],
            'compression': ['compression', 'resampling', 'jpeg_fingerprint'],
            'camera': ['demosaic_fingerprint', 'lens_shading', 'chromatic_aberration'],
            'frequency': ['wavelet_energy', 'dct_cooccurrence', 'frequency_artifacts']
        }
    
    def generate_debug_report(self, features, fusion_result, consensus_result, final_decision):
        """Generate comprehensive debug report"""
        try:
            debug_report = {
                'method_scores': self._format_method_scores(features),
                'group_analysis': self._analyze_groups(features),
                'fusion_breakdown': self._analyze_fusion(fusion_result),
                'consensus_analysis': self._analyze_consensus(consensus_result),
                'decision_path': self._trace_decision_path(fusion_result, final_decision),
                'potential_issues': self._identify_issues(features, fusion_result, consensus_result)
            }
            
            return debug_report
            
        except Exception as e:
            print(f"Debug report generation error: {e}")
            return {'error': str(e)}
    
    def _format_method_scores(self, features):
        """Format individual method scores for debugging"""
        formatted_scores = {}
        
        for method, score in features.items():
            # Normalize score for display
            display_score = score if score <= 1 else score / 100.0
            
            # Categorize score
            if display_score >= 0.7:
                category = "SUSPICIOUS"
                color = "red"
            elif display_score >= 0.4:
                category = "UNCERTAIN"
                color = "yellow"
            else:
                category = "AUTHENTIC"
                color = "green"
            
            formatted_scores[method] = {
                'raw_score': score,
                'normalized_score': round(display_score, 3),
                'percentage': round(display_score * 100, 1),
                'category': category,
                'color': color
            }
        
        return formatted_scores
    
    def _analyze_groups(self, features):
        """Analyze performance by method groups"""
        group_analysis = {}
        
        for group_name, methods in self.method_groups.items():
            group_scores = []
            available_methods = []
            
            for method in methods:
                if method in features:
                    score = features[method]
                    normalized_score = score if score <= 1 else score / 100.0
                    group_scores.append(normalized_score)
                    available_methods.append(method)
            
            if group_scores:
                group_analysis[group_name] = {
                    'available_methods': available_methods,
                    'method_count': len(available_methods),
                    'scores': [round(s, 3) for s in group_scores],
                    'mean_score': round(np.mean(group_scores), 3),
                    'std_score': round(np.std(group_scores), 3),
                    'min_score': round(np.min(group_scores), 3),
                    'max_score': round(np.max(group_scores), 3),
                    'verdict': 'SUSPICIOUS' if np.mean(group_scores) > 0.6 else 'AUTHENTIC' if np.mean(group_scores) < 0.4 else 'UNCERTAIN'
                }
            else:
                group_analysis[group_name] = {
                    'available_methods': [],
                    'method_count': 0,
                    'verdict': 'NO_DATA'
                }
        
        return group_analysis
    
    def _analyze_fusion(self, fusion_result):
        """Analyze fusion process"""
        try:
            analysis = {
                'final_score': fusion_result.get('final_score', 0),
                'group_scores': fusion_result.get('group_scores', {}),
                'confidences': fusion_result.get('confidences', {}),
                'weighted_scores': fusion_result.get('weighted_scores', {}),
                'score_distribution': self._analyze_score_distribution(fusion_result.get('group_scores', {})),
                'confidence_impact': self._analyze_confidence_impact(fusion_result)
            }
            
            return analysis
            
        except:
            return {'error': 'Fusion analysis failed'}
    
    def _analyze_score_distribution(self, group_scores):
        """Analyze distribution of group scores"""
        if not group_scores:
            return {}
        
        scores = list(group_scores.values())
        
        return {
            'mean': round(np.mean(scores), 3),
            'std': round(np.std(scores), 3),
            'range': round(np.max(scores) - np.min(scores), 3),
            'variance': round(np.var(scores), 3),
            'distribution_type': 'HIGH_VARIANCE' if np.std(scores) > 0.2 else 'LOW_VARIANCE'
        }
    
    def _analyze_confidence_impact(self, fusion_result):
        """Analyze impact of confidence weighting"""
        try:
            group_scores = fusion_result.get('group_scores', {})
            confidences = fusion_result.get('confidences', {})
            weighted_scores = fusion_result.get('weighted_scores', {})
            
            if not all([group_scores, confidences, weighted_scores]):
                return {}
            
            impact_analysis = {}
            
            for group in group_scores.keys():
                if group in confidences and group in weighted_scores:
                    original_score = group_scores[group]
                    confidence = confidences[group]
                    weighted_score = weighted_scores[group]
                    
                    # Calculate impact
                    expected_weighted = original_score * confidence
                    actual_impact = abs(weighted_score - expected_weighted)
                    
                    impact_analysis[group] = {
                        'original_score': round(original_score, 3),
                        'confidence': round(confidence, 3),
                        'weighted_score': round(weighted_score, 3),
                        'expected_weighted': round(expected_weighted, 3),
                        'impact_deviation': round(actual_impact, 3)
                    }
            
            return impact_analysis
            
        except:
            return {}
    
    def _analyze_consensus(self, consensus_result):
        """Analyze consensus results"""
        try:
            if not consensus_result:
                return {'error': 'No consensus data'}
            
            return {
                'overall_consensus': consensus_result.get('overall_consensus', 0),
                'agreement_count': len(consensus_result.get('agreements', [])),
                'disagreement_count': len(consensus_result.get('disagreements', [])),
                'domain_scores': consensus_result.get('domain_scores', {}),
                'critical_disagreements': [
                    f"{d[0]} vs {d[1]}: {d[2]:.3f}" 
                    for d in consensus_result.get('disagreements', []) 
                    if d[2] < 0.3
                ]
            }
            
        except:
            return {'error': 'Consensus analysis failed'}
    
    def _trace_decision_path(self, fusion_result, final_decision):
        """Trace the decision-making path"""
        try:
            final_score = fusion_result.get('final_score', 50)
            
            decision_path = {
                'final_score': final_score,
                'final_decision': final_decision,
                'decision_logic': self._explain_decision_logic(final_score, final_decision),
                'threshold_analysis': self._analyze_thresholds(final_score),
                'contributing_factors': self._identify_contributing_factors(fusion_result)
            }
            
            return decision_path
            
        except:
            return {'error': 'Decision path tracing failed'}
    
    def _explain_decision_logic(self, score, decision):
        """Explain the decision logic"""
        explanations = []
        
        if 'INCONCLUSIVE' in decision:
            explanations.append("Decision marked as inconclusive due to low confidence or quality")
        elif score >= 75:
            explanations.append(f"Score {score:.1f}% >= 75% threshold → AUTHENTIC")
        elif score >= 40:
            explanations.append(f"Score {score:.1f}% in 40-75% range → SUSPICIOUS")
        else:
            explanations.append(f"Score {score:.1f}% < 40% threshold → LIKELY_FAKE")
        
        return explanations
    
    def _analyze_thresholds(self, score):
        """Analyze how close the score is to decision thresholds"""
        thresholds = {'authentic': 75, 'suspicious_high': 40, 'fake': 0}
        
        analysis = {}
        for threshold_name, threshold_value in thresholds.items():
            distance = abs(score - threshold_value)
            analysis[threshold_name] = {
                'threshold': threshold_value,
                'distance': round(distance, 1),
                'crossed': score >= threshold_value if threshold_name != 'fake' else score <= threshold_value
            }
        
        return analysis
    
    def _identify_contributing_factors(self, fusion_result):
        """Identify main contributing factors to the decision"""
        try:
            weighted_scores = fusion_result.get('weighted_scores', {})
            
            if not weighted_scores:
                return []
            
            # Sort by weighted score impact
            sorted_factors = sorted(weighted_scores.items(), key=lambda x: x[1], reverse=True)
            
            factors = []
            for group, weighted_score in sorted_factors[:3]:  # Top 3 contributors
                factors.append({
                    'group': group,
                    'weighted_score': round(weighted_score, 3),
                    'impact': 'HIGH' if weighted_score > 0.6 else 'MEDIUM' if weighted_score > 0.3 else 'LOW'
                })
            
            return factors
            
        except:
            return []
    
    def _identify_issues(self, features, fusion_result, consensus_result):
        """Identify potential issues in the analysis"""
        issues = []
        
        try:
            # Check for missing methods
            total_expected = sum(len(methods) for methods in self.method_groups.values())
            total_available = len(features)
            
            if total_available < total_expected * 0.7:
                issues.append(f"Only {total_available}/{total_expected} methods available")
            
            # Check for extreme scores
            extreme_scores = [
                method for method, score in features.items() 
                if (score > 1 and score > 95) or (score <= 1 and score > 0.95) or score < 0.05
            ]
            
            if extreme_scores:
                issues.append(f"Extreme scores detected: {extreme_scores}")
            
            # Check fusion issues
            if fusion_result:
                group_scores = fusion_result.get('group_scores', {})
                if len(group_scores) > 1:
                    score_variance = np.var(list(group_scores.values()))
                    if score_variance > 0.1:
                        issues.append(f"High group score variance: {score_variance:.3f}")
            
            # Check consensus issues
            if consensus_result:
                disagreements = consensus_result.get('disagreements', [])
                if len(disagreements) > 2:
                    issues.append(f"Multiple domain disagreements: {len(disagreements)}")
            
            return issues
            
        except:
            return ['Issue identification failed']
    
    def print_debug_summary(self, debug_report):
        """Print a formatted debug summary"""
        try:
            print("\n" + "="*60)
            print("DEEPFAKE DETECTION DEBUG REPORT")
            print("="*60)
            
            # Method scores summary
            print("\n📊 METHOD SCORES:")
            method_scores = debug_report.get('method_scores', {})
            for method, data in method_scores.items():
                color_indicator = "🔴" if data['color'] == 'red' else "🟡" if data['color'] == 'yellow' else "🟢"
                print(f"  {color_indicator} {method}: {data['percentage']}% ({data['category']})")
            
            # Group analysis
            print("\n🔍 GROUP ANALYSIS:")
            group_analysis = debug_report.get('group_analysis', {})
            for group, data in group_analysis.items():
                if data.get('method_count', 0) > 0:
                    verdict_indicator = "🔴" if data['verdict'] == 'SUSPICIOUS' else "🟡" if data['verdict'] == 'UNCERTAIN' else "🟢"
                    print(f"  {verdict_indicator} {group}: {data['mean_score']:.3f} ({data['method_count']} methods) - {data['verdict']}")
            
            # Final decision
            print(f"\n⚖️  FINAL DECISION: {debug_report.get('decision_path', {}).get('final_decision', 'UNKNOWN')}")
            print(f"📈 FINAL SCORE: {debug_report.get('decision_path', {}).get('final_score', 0):.1f}%")
            
            # Issues
            issues = debug_report.get('potential_issues', [])
            if issues:
                print(f"\n⚠️  POTENTIAL ISSUES:")
                for issue in issues:
                    print(f"  - {issue}")
            
            print("="*60)
            
        except Exception as e:
            print(f"Debug summary printing failed: {e}")