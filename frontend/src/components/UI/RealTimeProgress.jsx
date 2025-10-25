import React, { useEffect, useState } from 'react';

const RealTimeProgress = ({ sessionId, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Starting analysis...');

  useEffect(() => {
    if (!sessionId) return;

    const eventSource = new EventSource(
      `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/progress/${sessionId}`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data.progress);
        setMessage(data.message);

        if (data.progress >= 100) {
          eventSource.close();
          if (onComplete) onComplete();
        }
      } catch (error) {
        console.error('Progress parse error:', error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, onComplete]);

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        <span className="text-sm font-bold text-blue-600">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full w-full animate-pulse bg-white opacity-20"></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
        <div className={`flex items-center ${progress >= 25 ? 'text-green-600 font-semibold' : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${progress >= 25 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Loading
        </div>
        <div className={`flex items-center ${progress >= 50 ? 'text-green-600 font-semibold' : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Deep Learning
        </div>
        <div className={`flex items-center ${progress >= 75 ? 'text-green-600 font-semibold' : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${progress >= 75 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Physics Analysis
        </div>
        <div className={`flex items-center ${progress >= 100 ? 'text-green-600 font-semibold' : ''}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Complete
        </div>
      </div>
    </div>
  );
};

export default RealTimeProgress;
