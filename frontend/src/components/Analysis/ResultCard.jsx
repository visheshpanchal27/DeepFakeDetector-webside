import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultCard = React.memo(({ result }) => {
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'safe': return 'text-success-600 bg-success-50';
      case 'low': return 'text-warning-600 bg-warning-50';
      case 'medium': return 'text-warning-600 bg-warning-50';
      case 'high': return 'text-danger-600 bg-danger-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score) => {
    const normalizedScore = score > 1 ? score / 100 : score;
    if (normalizedScore >= 0.8) return 'text-success-600';
    if (normalizedScore >= 0.6) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getMethodDescription = (method) => {
    const descriptions = {
      'deep_learning': 'Neural network analysis detecting AI patterns and artifacts',
      'forensic': 'Advanced forensic analysis including PRNU, ELA, and compression artifacts',
      'texture_variance': 'Statistical texture analysis for unnatural smoothness detection',
      'watermark': 'AI watermark and signature detection in image corners',
      'camera_metadata': 'EXIF metadata validation for authentic camera information',
      'visual_artifacts': 'Detection of visual inconsistencies and manipulation traces'
    };
    return descriptions[method] || 'Advanced detection algorithm';
  };

  return (
    <motion.div 
      className="card hover-lift"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
        <motion.span 
          className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(result.risk_level)}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {result.risk_level}
        </motion.span>
      </div>

      {result.overall_average !== undefined && (
        <motion.div 
          className="relative overflow-hidden text-center p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl mb-4 shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative z-10">
            <motion.div 
              className="text-5xl font-black text-white mb-2 drop-shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
            >
              {Math.round(result.overall_average > 100 ? result.overall_average / 100 : result.overall_average > 1 ? result.overall_average : result.overall_average * 100)}%
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-base font-bold text-white mb-1">Authenticity Score</p>
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <span className="text-xs">Analyzed with</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {Object.keys(result.individual_scores || {}).length} Methods
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <motion.div 
          className="relative overflow-hidden p-4 rounded-xl border-2 hover:shadow-lg transition-all"
          style={{
            background: result.classification === 'AUTHENTIC_HUMAN'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderColor: 'transparent'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -3 }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center space-x-3">
            <div className="text-3xl">
              {result.classification === 'AUTHENTIC_HUMAN' ? '✅' : '🚨'}
            </div>
            <div>
              <div className="text-xs text-white opacity-80 uppercase tracking-wider">Classification</div>
              <div className="text-lg font-bold text-white">
                {result.classification?.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="relative overflow-hidden p-4 rounded-xl border-2 hover:shadow-lg transition-all"
          style={{
            background: result.risk_level === 'SAFE'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : result.risk_level === 'LOW'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : result.risk_level === 'MEDIUM'
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderColor: 'transparent'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -3 }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center space-x-3">
            <div className="text-3xl">
              {result.risk_level === 'SAFE' ? '🔒' : result.risk_level === 'LOW' ? '✅' : result.risk_level === 'MEDIUM' ? '⚠️' : '🚨'}
            </div>
            <div>
              <div className="text-xs text-white opacity-80 uppercase tracking-wider">Risk Assessment</div>
              <div className="text-lg font-bold text-white">
                {result.risk_level} RISK
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {result.individual_scores && Object.keys(result.individual_scores).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-bold text-gray-900 text-xl flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Detection Methods Breakdown
            </h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
            >
              <span>{showDetails ? 'Hide' : 'Show'} Details</span>
              <motion.span
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </button>
          </div>
          <div className="space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
            {Object.entries(result.individual_scores).map(([method, score], index) => {
              const getMethodIcon = (methodName) => {
                if (methodName.includes('deep') || methodName.includes('learning')) return '🧠';
                if (methodName.includes('forensic')) return '🔬';
                if (methodName.includes('texture')) return '🔍';
                if (methodName.includes('watermark')) return '💧';
                if (methodName.includes('metadata') || methodName.includes('camera')) return '📷';
                if (methodName.includes('Lighting')) return '💡';
                if (methodName.includes('Geometry') || methodName.includes('Facial')) return '📐';
                if (methodName.includes('Enhancement')) return '✨';
                if (methodName.includes('Frequency')) return '📊';
                if (methodName.includes('Temporal')) return '⏱️';
                if (methodName.includes('Motion')) return '🎬';
                if (methodName.includes('Audio')) return '🔊';
                if (methodName.includes('Eye')) return '👁️';
                if (methodName.includes('Blink')) return '👀';
                if (methodName.includes('Shadow')) return '🌑';
                return '🔬';
              };
              
              const getScoreColor = (score) => {
                const normalizedScore = score > 1 ? score / 100 : score;
                if (normalizedScore >= 0.8) return { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-300' };
                if (normalizedScore >= 0.6) return { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-300' };
                return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-300' };
              };

              const colors = getScoreColor(score);
              const normalizedScore = Math.min(100, score > 100 ? score / 100 : score > 1 ? score : score * 100);
              const isExpanded = expandedMethod === method;
              
              return (
                <motion.div 
                  key={method}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-200"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedMethod(isExpanded ? null : method)}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <motion.span 
                          className="text-2xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {getMethodIcon(method)}
                        </motion.span>
                        <div>
                          <span className="text-base text-gray-900 font-bold capitalize">
                            {method.replace(/_/g, ' ')}
                          </span>
                          {showDetails && (
                            <p className="text-xs text-gray-500 mt-1">
                              {getMethodDescription(method)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <motion.span 
                          className={`text-lg font-black ${colors.text}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 + index * 0.1, type: 'spring' }}
                        >
                          {Math.round(normalizedScore)}%
                        </motion.span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className={`h-3 rounded-full ${colors.bg} relative overflow-hidden`}
                          initial={{ width: 0 }}
                          animate={{ width: `${normalizedScore}%` }}
                          transition={{ delay: 0.9 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/30"
                            animate={{ x: ['0%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            style={{ width: '50%' }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 bg-gray-50 border-t border-gray-200"
                      >
                        <div className="pt-3 space-y-2 text-sm text-gray-600">
                          <p><strong>Status:</strong> {normalizedScore >= 80 ? '✅ Passed' : normalizedScore >= 60 ? '⚠️ Warning' : '❌ Failed'}</p>
                          <p><strong>Confidence:</strong> {normalizedScore >= 80 ? 'High' : normalizedScore >= 60 ? 'Medium' : 'Low'}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {result.inconclusive_reason && (
        <motion.div 
          className="mt-6 p-4 rounded-lg border-2 bg-yellow-50 border-yellow-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-100">
              <span className="text-lg">❓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                <strong>Analysis Inconclusive:</strong> {result.inconclusive_reason}
              </p>
              <p className="text-xs mt-1 text-yellow-600">
                Manual review recommended for accurate assessment
              </p>
            </div>
          </div>
        </motion.div>
      )}



      {result.ai_name_detected && (
        <motion.div 
          className="mt-6 p-4 rounded-lg border-2 bg-orange-50 border-orange-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-800">
                <strong>AI Keyword Detected:</strong> Filename contains "{result.detected_ai_keyword}"
              </p>
              <p className="text-xs mt-1 text-orange-600">
                This suggests the content was created by AI (ChatGPT, Gemini, DALL-E, etc.)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div 
        className={`mt-6 p-5 rounded-xl border-2 ${result.is_deepfake ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4, type: 'spring' }}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.is_deepfake ? 'bg-red-100' : 'bg-green-100'} flex-shrink-0`}>
            <span className="text-2xl">{result.is_deepfake ? '🚨' : '✅'}</span>
          </div>
          <div className="flex-1">
            <p className={`text-base font-bold ${result.is_deepfake ? 'text-red-900' : 'text-green-900'} mb-2`}>
              {result.is_deepfake ? 'AI-Generated or Manipulated Content' : 'Real Content'}
            </p>
            <p className={`text-sm ${result.is_deepfake ? 'text-red-700' : 'text-green-700'}`}>
              {result.is_deepfake ? 
                'This content shows signs of AI generation or digital manipulation. Exercise caution when sharing or trusting this content.' :
                'This content appears to be genuine and created by humans without significant AI manipulation.'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

ResultCard.displayName = 'ResultCard';

export default ResultCard;