import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, FolderOpen, Brain, Zap, CheckCircle, Clock, Microscope, Target, Sparkles, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import FileUpload from '../components/UI/FileUpload.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import ResultCard from '../components/Analysis/ResultCard.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import toast from 'react-hot-toast';
import { sendAnalysisCompleteNotification } from '../utils/notifications';

const Analyze = React.memo(() => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [result, setResult] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const maxFileSize = settings?.analysis?.maxFileSize || 500;
  const abortControllerRef = useRef(null);

  useEffect(() => {
    localStorage.removeItem('analysisResult');
    fetchRecentAnalyses();
  }, []);

  const fetchRecentAnalyses = async () => {
    try {
      const response = await api.get('/api/history?limit=3');
      setRecentAnalyses(response.data.analyses || []);
    } catch (error) {
      console.error('Failed to fetch recent analyses:', error);
    }
  };



  const handleFileSelect = useCallback((file, error) => {
    if (error) {
      toast.error(error);
      return;
    }

    if (!file) {
      resetAnalysis();
      return;
    }

    setSelectedFile(file);
    setResult(null);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    abortControllerRef.current = new AbortController();
    setAnalyzing(true);
    setProgress(5);
    setAnalysisStage('Uploading file...');
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    let intervalId = null;

    try {
      // Start analysis
      const analysisPromise = api.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortControllerRef.current.signal,
        timeout: 600000
      });

      // Smooth progress with incremental updates
      const progressStages = [
        { start: 5, end: 15, message: 'Loading image...', duration: 800 },
        { start: 15, end: 35, message: 'Analyzing lighting and texture...', duration: 1200 },
        { start: 35, end: 60, message: 'Running deep learning models...', duration: 1500 },
        { start: 60, end: 85, message: 'Physics-based analysis: Lighting, geometry, texture...', duration: 2000 },
        { start: 85, end: 95, message: 'Finalizing results...', duration: 1000 }
      ];

      let stageIndex = 0;
      
      const animateStage = () => {
        if (stageIndex >= progressStages.length) return;
        
        const stage = progressStages[stageIndex];
        setAnalysisStage(stage.message);
        
        const steps = stage.end - stage.start;
        const stepDuration = stage.duration / steps;
        let currentProgress = stage.start;
        
        intervalId = setInterval(() => {
          currentProgress++;
          setProgress(currentProgress);
          
          if (currentProgress >= stage.end) {
            clearInterval(intervalId);
            stageIndex++;
            setTimeout(animateStage, 100);
          }
        }, stepDuration);
      };
      animateStage();

      // Wait for analysis to complete
      const response = await analysisPromise;
      
      if (intervalId) clearInterval(intervalId);
      
      const data = response.data;
      setProgress(100);
      setAnalysisStage('Analysis complete!');
      
      if (data.authenticity_score !== undefined) {
        setResult(data);
        fetchRecentAnalyses();
        window.dispatchEvent(new Event('refreshDashboard'));
        window.dispatchEvent(new Event('refreshHistory'));
        localStorage.setItem('dashboardRefresh', Date.now().toString());
        localStorage.setItem('historyRefresh', Date.now().toString());
        toast.success('Analysis completed successfully!');
        sendAnalysisCompleteNotification(data);
      }
      
      setTimeout(() => setAnalyzing(false), 500);
    } catch (error) {
      if (intervalId) clearInterval(intervalId);
      if (error.name === 'CanceledError') {
        toast.error('Analysis cancelled');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - video may be too large');
      } else {
        toast.error(error.response?.data?.error || 'Analysis failed. Please try again.');
      }
      setAnalyzing(false);
      setProgress(0);
      setAnalysisStage('');
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const resetAnalysis = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
  }, []);

  const getScoreColor = useCallback((score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
          <Search className="w-4 h-4" />
          Advanced AI Detection
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          <span className="gradient-text">Analyze</span>
          <span className="text-gray-900"> Your Content</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Upload images or videos for 
          <span className="font-semibold text-blue-600">physics-based deepfake detection</span> with 
          <span className="font-semibold text-green-600">multi-stage classification</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="modern-card">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center mr-3">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upload Your File
              </h2>
            </div>
            
            <div className="relative">
              <div className={selectedFile ? "max-h-[550px] overflow-y-auto rounded-xl" : ""} style={selectedFile ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}>
                <style>{`
                  .max-h-\[550px\]::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept={{
                    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
                    'video/*': ['.mp4', '.avi', '.mov', '.webm', '.mkv']
                  }}
                  maxSize={maxFileSize * 1024 * 1024}
                  selectedFile={selectedFile}
                />
              </div>

              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 sticky bottom-0 z-20"
                >
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                    whileHover={{ scale: analyzing ? 1 : 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                    whileTap={{ scale: analyzing ? 1 : 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      {analyzing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-lg">Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-lg">Analyze File</span>
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </div>
                    {!analyzing && (
                      <motion.div
                        className="absolute inset-0 bg-white opacity-0"
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                  <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure • Encrypted • Private</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </motion.div>

        <div className="space-y-6">
          {analyzing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card"
            >
              <div className="text-center">
                <LoadingSpinner size="lg" text={analysisStage || "Analyzing your file..."} />
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                    </motion.div>
                  </div>
                </div>
                {/* Real-time Stage Indicators */}
                <div className="mt-6 grid grid-cols-4 gap-3">
                  {[
                    { name: 'Loading', icon: <FolderOpen className="w-5 h-5" />, threshold: 20 },
                    { name: 'Deep Learning', icon: <Brain className="w-5 h-5" />, threshold: 50 },
                    { name: 'Physics Analysis', icon: <Zap className="w-5 h-5" />, threshold: 80 },
                    { name: 'Complete', icon: <CheckCircle className="w-5 h-5" />, threshold: 100 }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                      progress >= item.threshold ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 border-2 border-gray-200'
                    }`}>
                      <div className="mb-1">{item.icon}</div>
                      <span className={`text-xs font-medium text-center ${
                        progress >= item.threshold ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  {selectedFile?.type.startsWith('video/') 
                    ? '✓ Temporal integrity • Enhancement detection • Frequency analysis • Motion consistency'
                    : '✓ Lighting consistency • Edge analysis • Enhancement traces • Frequency patterns'}
                </p>
              </div>
            </motion.div>
          )}

          {result && !analyzing && (
            <ResultCard result={result} />
          )}

          {!selectedFile && !analyzing && !result && recentAnalyses.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Analyses
                </h3>
                <button
                  onClick={() => navigate('/history')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <span>View All</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {recentAnalyses.map((analysis, idx) => {
                  const allAnalysesIndex = idx;
                  return (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-200"
                    onClick={() => navigate(`/analysis/${allAnalysesIndex}`, { state: { from: '/analyze' } })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {analysis.original_filename || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(() => {
                            const confidence = analysis.analysis_result?.confidence;
                            let confPercent = 0;
                            if (confidence) {
                              // Handle different confidence formats
                              if (confidence > 100) {
                                confPercent = Math.round(confidence / 100); // 5725 -> 57
                              } else if (confidence > 1) {
                                confPercent = Math.round(confidence); // 57.25 -> 57
                              } else {
                                confPercent = Math.round(confidence * 100); // 0.5725 -> 57
                              }
                            }
                            return `${confPercent}% confidence • ${new Date(analysis.created_at).toLocaleDateString()}`;
                          })()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${(() => {
                          const classification = analysis.analysis_result?.classification;
                          if (classification === 'AUTHENTIC_HUMAN' || classification === 'LIKELY_AUTHENTIC') return 'bg-green-100 text-green-800';
                          if (classification === 'SUSPICIOUS') return 'bg-yellow-100 text-yellow-800';
                          if (classification === 'AI_GENERATED') return 'bg-red-100 text-red-800';
                          return 'bg-gray-100 text-gray-800';
                        })()}`}>
                          {analysis.analysis_result?.classification?.replace(/_/g, ' ') || 'UNKNOWN'}
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                );
                })}
              </div>
            </motion.div>
          )}
          
          {!selectedFile && !analyzing && !result && recentAnalyses.length === 0 && (
            <div className="card text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-600" />
              </div>
              <p>Analysis results will appear here</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Microscope className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Physics-Based Detection</h3>
          <p className="text-sm text-gray-600">No AI • Pure computer vision</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Multi-Stage Classification</h3>
          <p className="text-sm text-gray-600">Human • Enhanced • AI • Generated</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Enhancement Detection</h3>
          <p className="text-sm text-gray-600">Filters • AI upscaling • Traces</p>
        </div>
      </div>
    </div>
  );
});

Analyze.displayName = 'Analyze';

export default Analyze;