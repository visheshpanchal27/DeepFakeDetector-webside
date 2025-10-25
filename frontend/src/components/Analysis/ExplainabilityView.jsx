import React, { useState, useEffect } from 'react';

const ExplainabilityView = ({ analysisId }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) return;

    const fetchExplanation = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/explainability/analysis/${analysisId}/explain`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setExplanation(data);
        }
      } catch (error) {
        console.error('Failed to load explanation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating AI explanation...</p>
      </div>
    );
  }

  if (!explanation) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">AI Explainability</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attention Heatmap */}
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3">Attention Heatmap</h4>
          <p className="text-sm text-gray-600 mb-3">
            Shows where the AI focused during analysis
          </p>
          <img
            src={`http://localhost:8000${explanation.explanation_url}`}
            alt="AI Attention Heatmap"
            className="w-full rounded-lg"
          />
        </div>

        {/* Forensic Visualization */}
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3">Forensic Analysis</h4>
          <p className="text-sm text-gray-600 mb-3">
            ELA, noise patterns, and frequency analysis
          </p>
          <img
            src={`http://localhost:8000${explanation.forensic_url}`}
            alt="Forensic Analysis"
            className="w-full rounded-lg"
          />
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Detection Scores</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {explanation.scores && Object.entries(explanation.scores).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-gray-600 capitalize">{key.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {typeof value === 'number' ? Math.round(value) : value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityView;
