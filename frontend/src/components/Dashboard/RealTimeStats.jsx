import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RealTimeStats = ({ stats }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div 
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">System Status</h4>
        <div className="flex items-center space-x-2">
          <motion.div 
            className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 metric-number">{formatTime(currentTime)}</div>
          <div className="text-xs text-gray-600">Current Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 metric-number">
            {stats?.totalFiles || 0}
          </div>
          <div className="text-xs text-gray-600">Files Processed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 metric-number">
            {stats?.processingTime ? `${stats.processingTime.toFixed(1)}s` : '0.0s'}
          </div>
          <div className="text-xs text-gray-600">Avg Process Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 metric-number">99.9%</div>
          <div className="text-xs text-gray-600">Uptime</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last Updated:</span>
          <span>{stats?.lastUpdated ? stats.lastUpdated.toLocaleTimeString() : 'Never'}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RealTimeStats;