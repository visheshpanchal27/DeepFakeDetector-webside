import React from 'react';
import { motion } from 'framer-motion';

const DetailedResultCard = ({ result }) => {
  if (!result) return null;

  const getVerdictColor = (score) => {
    if (score > 70) return 'text-green-600 bg-green-100';
    if (score > 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getVerdict = (classification) => {
    const verdicts = {
      'AUTHENTIC_HUMAN': '✓ HUMAN',
      'HUMAN_ENHANCED': '⚠ HUMAN ENHANCED',
      'SUSPICIOUS': '⚠ SUSPICIOUS',
      'AI_GENERATED': '✗ AI GENERATED'
    };
    return verdicts[classification] || 'UNKNOWN';
  };

  const scores = result.individual_scores || {};
  const forensic = scores.forensic || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 space-y-6"
    >
      {/* Main Verdict */}
      <div className={`text-center p-6 rounded-lg ${getVerdictColor(result.authenticity_score)}`}>
        <h2 className="text-3xl font-bold mb-2">
          {getVerdict(result.classification)}
        </h2>
        <p className="text-5xl font-bold">
          {Math.round(result.authenticity_score)}%
        </p>
        <p className="text-sm mt-2">Authenticity Score</p>
      </div>

      {/* Confidence */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Confidence Level</span>
          <span className="font-semibold">{Math.round(result.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Layer 1: Deep Learning Models */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg border-b pb-2">Detection Methods</h3>
        
        {Object.entries(scores).map(([key, value]) => {
          if (key === 'forensic') return null;
          if (typeof value !== 'number' || isNaN(value)) return null;
          
          const labels = {
            'deep_learning': 'Deep Learning',
            'texture_variance': 'Texture Variance',
            'camera_metadata': 'Camera Metadata',
            'watermark': 'Watermark Detection',
            'mobilenet_v2': 'MobileNetV2',
            'vision_transformer': 'Vision Transformer',
            'visual_artifacts': 'Visual Artifacts'
          };
          
          return (
            <ScoreBar
              key={key}
              label={labels[key] || key}
              score={value}
              color="blue"
            />
          );
        })}
      </div>

      {/* Layer 2: Forensic Analysis */}
      {forensic.combined !== undefined && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">Layer 2: Forensic Analysis</h3>
          
          <ScoreBar label="PRNU (Sensor Pattern)" score={forensic.prnu || 0} color="green" />
          <ScoreBar label="ELA (Compression)" score={forensic.ela || 0} color="green" />
          <ScoreBar label="Wavelet (Texture)" score={forensic.wavelet || 0} color="green" />
          <ScoreBar label="Chromatic Aberration" score={forensic.chromatic || 0} color="green" />
          <ScoreBar label="Reflection Analysis" score={forensic.reflection || 0} color="green" />
          <ScoreBar label="Noise Variance" score={forensic.noise_variance || 0} color="green" />
          <ScoreBar label="JPEG Ghost" score={forensic.jpeg_ghost || 0} color="green" />
          
          <div className="pt-2 border-t">
            <ScoreBar
              label="Forensic Combined"
              score={forensic.combined || 0}
              color="emerald"
              bold
            />
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Risk Level:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(result.risk_level)}`}>
            {result.risk_level}
          </span>
        </div>
      </div>

      {/* Method Count */}
      <div className="text-center text-sm text-gray-600">
        Analysis performed using {result.method_count || 3} detection methods
      </div>
    </motion.div>
  );
};

const ScoreBar = ({ label, score, color, bold }) => {
  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-600'
  };

  // Hide if score is NaN, null, undefined, or not a number
  if (typeof score !== 'number' || isNaN(score)) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={bold ? 'font-semibold' : ''}>{label}</span>
        <span className={bold ? 'font-bold' : 'font-semibold'}>
          {Math.round(score)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
};

const getRiskColor = (risk) => {
  const colors = {
    'SAFE': 'bg-green-100 text-green-800',
    'LOW': 'bg-blue-100 text-blue-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'HIGH': 'bg-red-100 text-red-800'
  };
  return colors[risk] || 'bg-gray-100 text-gray-800';
};

export default DetailedResultCard;
