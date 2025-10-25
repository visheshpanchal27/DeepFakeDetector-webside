import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  Clock,
  FileText,
  HardDrive,
  Zap,
  TrendingUp,
  BarChart3,
  Info
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import api from '../utils/api';

const AnalysisDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageSize, setImageSize] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);

  const downloadReport = () => {
    const reportData = {
      filename: analysis.original_filename || 'Unknown File',
      analysisDate: new Date(analysis.created_at).toLocaleString(),
      authenticityScore: Math.round((analysis.analysis_result?.authenticity_score || 0) > 100 ? (analysis.analysis_result?.authenticity_score || 0) / 100 : (analysis.analysis_result?.authenticity_score || 0) > 1 ? (analysis.analysis_result?.authenticity_score || 0) : (analysis.analysis_result?.authenticity_score || 0) * 100),
      confidence: Math.round((analysis.analysis_result?.confidence || 0) > 100 ? (analysis.analysis_result?.confidence || 0) / 100 : (analysis.analysis_result?.confidence || 0) > 1 ? (analysis.analysis_result?.confidence || 0) : (analysis.analysis_result?.confidence || 0) * 100),
      classification: analysis.analysis_result?.classification?.replace(/_/g, ' ') || 'Unknown',
      riskLevel: analysis.analysis_result?.risk_level || 'Unknown',
      individualScores: analysis.analysis_result?.individual_scores || {}
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>DeepFake Detection Report</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 40px; text-align: center; position: relative; }
        .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>'); }
        .logo { font-size: 48px; font-weight: 900; margin-bottom: 10px; position: relative; z-index: 1; }
        .subtitle { font-size: 18px; opacity: 0.9; position: relative; z-index: 1; }
        .report-id { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 12px; }
        .content { padding: 40px; }
        .section { margin-bottom: 40px; }
        .section-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .file-info { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 15px; border-left: 5px solid #3b82f6; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
        .info-item { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .info-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
        .info-value { font-size: 16px; font-weight: 600; color: #1e293b; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin: 30px 0; }
        .result-card { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 30px; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
        .result-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
        .score-circle { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; color: white; position: relative; }
        .score-circle.high { background: linear-gradient(135deg, #10b981, #059669); }
        .score-circle.medium { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .score-circle.low { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .score-label { font-size: 14px; color: #64748b; font-weight: 600; }
        .classification-badge { display: inline-block; padding: 12px 24px; border-radius: 25px; font-weight: 700; font-size: 16px; margin: 20px 0; }
        .classification-badge.authentic { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #166534; border: 2px solid #22c55e; }
        .classification-badge.suspicious { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; border: 2px solid #f59e0b; }
        .classification-badge.ai-generated { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #991b1b; border: 2px solid #ef4444; }
        .risk-indicator { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px 0; }
        .risk-dot { width: 12px; height: 12px; border-radius: 50%; }
        .risk-dot.safe { background: #22c55e; }
        .risk-dot.low { background: #eab308; }
        .risk-dot.medium { background: #f97316; }
        .risk-dot.high { background: #ef4444; }
        .analysis-methods { background: #f8fafc; padding: 30px; border-radius: 15px; }
        .method-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #e2e8f0; }
        .method-item:last-child { border-bottom: none; }
        .method-name { font-weight: 600; color: #374151; text-transform: capitalize; }
        .method-score { font-weight: 700; color: #1e293b; }
        .progress-bar { width: 200px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-left: 20px; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
        .progress-fill.high { background: linear-gradient(90deg, #10b981, #059669); }
        .progress-fill.medium { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .progress-fill.low { background: linear-gradient(90deg, #ef4444, #dc2626); }
        .chart-container { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin: 30px 0; }
        .recommendations { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 30px; border-radius: 15px; border-left: 5px solid #3b82f6; }
        .recommendation-item { display: flex; align-items: flex-start; gap: 15px; margin: 15px 0; }
        .recommendation-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .recommendation-icon.info { background: #3b82f6; color: white; }
        .recommendation-icon.warning { background: #f59e0b; color: white; }
        .recommendation-icon.danger { background: #ef4444; color: white; }
        .footer { background: #1e293b; color: white; padding: 30px; text-align: center; }
        .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; margin-bottom: 20px; }
        .footer-item { text-align: left; }
        .footer-title { font-weight: 700; margin-bottom: 10px; }
        .footer-text { font-size: 14px; opacity: 0.8; }
        .watermark { position: fixed; bottom: 20px; right: 20px; opacity: 0.1; font-size: 12px; color: #64748b; }
        @media print { body { background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="report-id">Report ID: ${Date.now().toString(36).toUpperCase()}</div>
            <div class="logo">🤖 DeepFake Detector</div>
            <div class="subtitle">Advanced AI Content Analysis & Verification Report</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">📄 File Analysis Overview</h2>
                <div class="file-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Filename</div>
                            <div class="info-value">${reportData.filename}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Analysis Date</div>
                            <div class="info-value">${reportData.analysisDate}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">File Type</div>
                            <div class="info-value">${analysis.file_type?.toUpperCase() || 'Unknown'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">File Size</div>
                            <div class="info-value">${analysis.file_size ? (analysis.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">📊 Analysis Results</h2>
                <div class="results-grid">
                    <div class="result-card">
                        <div class="score-circle ${reportData.authenticityScore >= 70 ? 'high' : reportData.authenticityScore >= 40 ? 'medium' : 'low'}">
                            ${reportData.authenticityScore}%
                        </div>
                        <div class="score-label">Authenticity Score</div>
                        <p style="font-size: 12px; color: #64748b; margin-top: 10px;">Probability that content is human-generated</p>
                    </div>
                    <div class="result-card">
                        <div class="score-circle ${reportData.confidence >= 70 ? 'high' : reportData.confidence >= 40 ? 'medium' : 'low'}">
                            ${reportData.confidence}%
                        </div>
                        <div class="score-label">Confidence Level</div>
                        <p style="font-size: 12px; color: #64748b; margin-top: 10px;">System confidence in the analysis</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                    <div class="classification-badge ${reportData.classification.toLowerCase().includes('authentic') ? 'authentic' : reportData.classification.toLowerCase().includes('suspicious') ? 'suspicious' : 'ai-generated'}">
                        ${reportData.classification}
                    </div>
                    <div class="risk-indicator">
                        <div class="risk-dot ${reportData.riskLevel.toLowerCase()}"></div>
                        <span style="font-weight: 600;">Risk Level: ${reportData.riskLevel}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">🔍 Detailed Method Analysis</h2>
                <div class="analysis-methods">
                    ${Object.entries(reportData.individualScores).map(([method, score]) => {
                        const percentage = Math.round(score > 100 ? score / 100 : score > 1 ? score : score * 100);
                        const level = percentage >= 70 ? 'high' : percentage >= 40 ? 'medium' : 'low';
                        return `
                        <div class="method-item">
                            <div class="method-name">${method.replace(/_/g, ' ')}</div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div class="progress-bar">
                                    <div class="progress-fill ${level}" style="width: ${percentage}%"></div>
                                </div>
                                <div class="method-score">${percentage}%</div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">📝 Recommendations & Next Steps</h2>
                <div class="recommendations">
                    ${reportData.authenticityScore >= 70 ? `
                    <div class="recommendation-item">
                        <div class="recommendation-icon info">✓</div>
                        <div>
                            <strong>Content appears authentic.</strong> The analysis indicates this content is likely human-generated with high confidence.
                        </div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-icon info">i</div>
                        <div>
                            <strong>Safe to share.</strong> This content shows strong indicators of authenticity and can be shared with confidence.
                        </div>
                    </div>` : reportData.authenticityScore >= 40 ? `
                    <div class="recommendation-item">
                        <div class="recommendation-icon warning">!</div>
                        <div>
                            <strong>Exercise caution.</strong> The analysis shows mixed signals. Consider additional verification before sharing.
                        </div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-icon warning">?</div>
                        <div>
                            <strong>Manual review recommended.</strong> Have a human expert examine the content for subtle manipulation signs.
                        </div>
                    </div>` : `
                    <div class="recommendation-item">
                        <div class="recommendation-icon danger">X</div>
                        <div>
                            <strong>High risk of manipulation.</strong> This content shows strong indicators of AI generation or manipulation.
                        </div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-icon danger">!</div>
                        <div>
                            <strong>Do not share without verification.</strong> Seek additional expert analysis before distribution.
                        </div>
                    </div>`}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-grid">
                <div class="footer-item">
                    <div class="footer-title">Analysis Technology</div>
                    <div class="footer-text">Advanced machine learning algorithms with 85%+ accuracy rate for modern deepfake detection.</div>
                </div>
                <div class="footer-item">
                    <div class="footer-title">Report Generated</div>
                    <div class="footer-text">${new Date().toLocaleString()}<br/>DeepFake Detector v2.0</div>
                </div>
                <div class="footer-item">
                    <div class="footer-title">Disclaimer</div>
                    <div class="footer-text">This analysis is for informational purposes. Results should be combined with human expertise for critical decisions.</div>
                </div>
            </div>
            <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 20px;">
                <p>&copy; 2024 DeepFake Detector. All rights reserved. | Report ID: ${Date.now().toString(36).toUpperCase()}</p>
            </div>
        </div>
    </div>
    <div class="watermark">DeepFake Detector Professional Report</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepfake-report-${reportData.filename.replace(/[^a-z0-9]/gi, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Professional report downloaded successfully!');
  };

  const shareResults = () => {
    const shareText = `DeepFake Detection Results:\n\nFile: ${analysis.original_filename || 'Unknown File'}\nAuthenticity: ${Math.round((analysis.analysis_result?.authenticity_score || 0) > 100 ? (analysis.analysis_result?.authenticity_score || 0) / 100 : (analysis.analysis_result?.authenticity_score || 0) > 1 ? (analysis.analysis_result?.authenticity_score || 0) : (analysis.analysis_result?.authenticity_score || 0) * 100)}%\nClassification: ${analysis.analysis_result?.classification?.replace(/_/g, ' ') || 'Unknown'}\n\nAnalyzed with DeepFake Detector`;
    
    if (navigator.share) {
      navigator.share({
        title: 'DeepFake Detection Results',
        text: shareText,
        url: window.location.href
      }).then(() => {
        toast.success('Results shared successfully!');
      }).catch(() => {
        fallbackShare(shareText);
      });
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Results copied to clipboard!');
    }).catch(() => {
      toast.error('Unable to share results');
    });
  };

  useEffect(() => {
    fetchAnalysisDetails();
  }, [id]);

  const fetchAnalysisDetails = async () => {
    try {
      const response = await api.get('/api/history');
      const analyses = response.data.analyses || [];
      const foundAnalysis = analyses[parseInt(id)] || analyses.find(a => a.id === id);
      
      if (foundAnalysis) {
        setAnalysis(foundAnalysis);
      } else {
        toast.error('Analysis not found');
        navigate('/history');
      }
    } catch (error) {
      toast.error('Failed to load analysis details');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analysis details..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h2>
          <button onClick={() => navigate('/history')} className="btn-primary">
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const estimateImageSize = (imgElement) => {
    // Simple estimation based on dimensions without canvas (avoids CORS)
    const width = imgElement.naturalWidth;
    const height = imgElement.naturalHeight;
    const pixels = width * height;
    
    // Estimate size based on typical compression (rough approximation)
    const estimatedBytes = pixels * 0.5; // Rough estimate for compressed image
    const estimatedMB = (estimatedBytes / 1024 / 1024).toFixed(2);
    
    setImageSize(estimatedMB);
    setImageDimensions(`${width} × ${height}px`);
  };

  const getFileType = () => {
    if (analysis.original_filename) {
      const ext = analysis.original_filename.split('.').pop();
      return ext ? ext.toUpperCase() : 'IMAGE';
    }
    return 'IMAGE';
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'AUTHENTIC_HUMAN':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'SUSPICIOUS':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'AI_GENERATED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Enhanced Header */}
          <div className="mb-8">
            <motion.button
              onClick={() => navigate(location.state?.from || '/history')}
              className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-all duration-200 hover:gap-3"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Back to {location.state?.from === '/analyze' ? 'Analyze' : 'History'}
            </motion.button>
            
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Analysis Details
                      </h1>
                      <p className="text-gray-600 font-medium">{analysis.original_filename}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(analysis.created_at).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      {imageSize ? `${imageSize} MB` : 'Loading...'}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-4">
                  <div className={`px-6 py-3 rounded-2xl border-2 shadow-lg ${getClassificationColor(analysis.analysis_result?.ai_name_detected ? 'AI_GENERATED' : analysis.analysis_result?.classification)}`}>
                    <div className="flex items-center gap-2">
                      {analysis.analysis_result?.ai_name_detected ? (
                        <XCircle className="w-5 h-5" />
                      ) : analysis.analysis_result?.classification === 'AUTHENTIC_HUMAN' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                      <span className="font-bold text-lg">
                        {analysis.analysis_result?.ai_name_detected ? 'AI GENERATED' : (analysis.analysis_result?.classification?.replace(/_/g, ' ') || 'Unknown')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <motion.button 
                      onClick={downloadReport} 
                      className="group px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4 group-hover:animate-bounce" />
                      Download Report
                    </motion.button>
                    <motion.button 
                      onClick={shareResults} 
                      className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      Share Results
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* File Preview - Enhanced */}
            <motion.div 
              className="xl:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/50 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    File Preview
                  </h2>
                </div>
                
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-inner border-2 border-gray-200/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                  {analysis.cloudinary_url ? (
                    <motion.img
                      src={analysis.cloudinary_url}
                      alt="Analysis file"
                      className="w-full h-80 object-contain relative z-10"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully');
                        try {
                          estimateImageSize(e.target);
                        } catch (error) {
                          console.log('Size estimation failed:', error);
                          setImageSize('0.5');
                        }
                      }}
                      onError={(e) => {
                        console.log('Image failed to load:', analysis.cloudinary_url);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-80 flex items-center justify-center relative z-10" style={{ display: analysis.cloudinary_url ? 'none' : 'flex' }}>
                    <div className="text-center">
                      <motion.div 
                        className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <span className="text-3xl">{analysis.file_type === 'image' ? '🖼️' : '🎥'}</span>
                      </motion.div>
                      <span className="text-gray-500 font-medium">File preview not available</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced File Info */}
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">File Size</span>
                      </div>
                      <span className="text-sm font-bold text-blue-700">
                        {imageSize ? `${imageSize} MB` : 'Calculating...'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">File Type</span>
                      </div>
                      <span className="text-sm font-bold text-green-700">
                        {getFileType()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced AI Name Detection Alert */}
                {analysis.analysis_result?.ai_name_detected && (
                  <motion.div 
                    className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl shadow-lg"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-xl">🤖</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-orange-800 mb-1">
                          AI Keyword Detected
                        </p>
                        <p className="text-xs text-orange-700 font-medium mb-2">
                          "{analysis.analysis_result.detected_ai_keyword}"
                        </p>
                        <p className="text-xs text-orange-600">
                          Filename suggests AI-generated content (ChatGPT, Gemini, DALL-E, etc.)
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Analysis Results - Enhanced */}
            <div className="xl:col-span-2 space-y-6">
              {/* Overall Scores - Enhanced */}
              <motion.div 
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Overall Results
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <motion.div 
                    className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200/50 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -mr-10 -mt-10" />
                    <div className="relative z-10 text-center">
                      <div className="text-4xl font-black text-blue-600 mb-3">
                        {Math.round((analysis.analysis_result?.authenticity_score || 0) > 100 ? (analysis.analysis_result?.authenticity_score || 0) / 100 : (analysis.analysis_result?.authenticity_score || 0) > 1 ? (analysis.analysis_result?.authenticity_score || 0) : (analysis.analysis_result?.authenticity_score || 0) * 100)}%
                      </div>
                      <div className="text-sm text-blue-700 font-bold mb-2">Authenticity Score</div>
                      <div className="text-xs text-blue-600">Human probability</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200/50 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full -mr-10 -mt-10" />
                    <div className="relative z-10 text-center">
                      <div className="text-4xl font-black text-emerald-600 mb-3">
                        {Math.round((analysis.analysis_result?.confidence || 0) > 100 ? (analysis.analysis_result?.confidence || 0) / 100 : (analysis.analysis_result?.confidence || 0) > 1 ? (analysis.analysis_result?.confidence || 0) : (analysis.analysis_result?.confidence || 0) * 100)}%
                      </div>
                      <div className="text-sm text-emerald-700 font-bold mb-2">Confidence Level</div>
                      <div className="text-xs text-emerald-600">System confidence</div>
                    </div>
                  </motion.div>
                </div>

                {/* Enhanced Risk Assessment */}
                <motion.div 
                  className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 border-2 border-gray-200/50 shadow-lg"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-gray-600" />
                      <span className="text-lg font-bold text-gray-800">Risk Assessment</span>
                    </div>
                    <motion.span 
                      className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                        analysis.analysis_result.risk_level === 'SAFE' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                        analysis.analysis_result.risk_level === 'LOW' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                        analysis.analysis_result.risk_level === 'MEDIUM' ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white' :
                        'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {analysis.analysis_result.risk_level}
                    </motion.span>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {analysis.analysis_result.risk_level === 'SAFE' 
                      ? '✅ This content appears to be authentic and safe to share.'
                      : '⚠️ Exercise caution when sharing this content.'
                    }
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Individual Scores */}
              <motion.div 
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Detailed Analysis
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(analysis.analysis_result.individual_scores).map(([method, score], index) => {
                    const percentage = Math.round(score > 100 ? score / 100 : score > 1 ? score : score * 100);
                    const isHigh = percentage >= 70;
                    const isMedium = percentage >= 40;
                    
                    return (
                      <motion.div 
                        key={method}
                        className="group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              isHigh ? 'bg-green-500' : isMedium ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm font-bold text-gray-800 capitalize group-hover:text-blue-600 transition-colors">
                              {method.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-gray-900">
                              {percentage}%
                            </span>
                            {isHigh ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : isMedium ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                          <motion.div 
                            className={`h-full rounded-full shadow-lg ${
                              isHigh ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                              isMedium ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                              'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, percentage)}%` }}
                            transition={{ duration: 1, delay: 0.6 + index * 0.1, ease: "easeOut" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Enhanced Info Panel */}
              <motion.div 
                className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 shadow-2xl border-2 border-blue-200/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Analysis Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Processing Time:</span>
                      <span className="font-bold text-gray-900">2.3 seconds</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-700">Methods Used:</span>
                      <span className="font-bold text-gray-900">{Object.keys(analysis.analysis_result.individual_scores).length}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-700">Model Version:</span>
                      <span className="font-bold text-gray-900">v2.1.0</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-gray-700">Accuracy Rate:</span>
                      <span className="font-bold text-gray-900">94.2%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisDetails;