import React, { useState } from 'react';
import RealTimeAnalysis from '../components/Analysis/RealTimeAnalysis';
import DetailedResultCard from '../components/Analysis/DetailedResultCard';
import ExplainabilityView from '../components/Analysis/ExplainabilityView';

const AnalyzePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showExplainability, setShowExplainability] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setResult(null);
  };

  const handleAnalysisComplete = (data) => {
    setResult(data);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI DeepFake Detection
        </h1>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <input
              type="file"
              onChange={handleFileSelect}
              accept="image/*,video/*"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <div className="space-y-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-gray-600">
                  <span className="text-blue-600 font-semibold">Click to upload</span>
                  {' '}or drag and drop
                </div>
                <p className="text-sm text-gray-500">
                  Images (JPG, PNG, GIF) or Videos (MP4, AVI, MOV)
                </p>
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="mt-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                  <div>
                    <p className="font-semibold">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-Time Analysis */}
        {analyzing && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <RealTimeAnalysis
              file={selectedFile}
              onComplete={handleAnalysisComplete}
            />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            <DetailedResultCard result={result} />

            {/* Explainability Toggle */}
            <div className="text-center">
              <button
                onClick={() => setShowExplainability(!showExplainability)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {showExplainability ? '▲ Hide' : '▼ Show'} AI Explainability
              </button>
            </div>

            {showExplainability && result._id && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <ExplainabilityView analysisId={result._id} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;
