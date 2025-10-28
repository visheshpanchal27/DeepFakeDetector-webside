import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';

const PerformanceMetrics = ({ analyses }) => {
  const getPerformanceData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        accuracy: 85 + Math.random() * 10,
        speed: 1.2 + Math.random() * 0.8,
        throughput: Math.floor(Math.random() * 50) + 20
      };
    });
    return last7Days;
  };

  const performanceData = getPerformanceData();
  const avgAccuracy = performanceData.reduce((sum, day) => sum + day.accuracy, 0) / performanceData.length;
  const avgSpeed = performanceData.reduce((sum, day) => sum + day.speed, 0) / performanceData.length;
  const totalThroughput = performanceData.reduce((sum, day) => sum + day.throughput, 0);

  const metrics = [
    {
      title: 'Detection Accuracy',
      value: `${avgAccuracy.toFixed(1)}%`,
      change: '+2.3%',
      trend: 'up',
      color: 'emerald',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Avg Processing Speed',
      value: `${avgSpeed.toFixed(1)}s`,
      change: '-0.2s',
      trend: 'up',
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: 'Weekly Throughput',
      value: totalThroughput.toString(),
      change: '+12%',
      trend: 'up',
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '+0.1%',
      trend: 'up',
      color: 'orange',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Performance Metrics Cards */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 rounded-2xl p-4 border border-${metric.color}-200`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-${metric.color}-500 rounded-xl flex items-center justify-center text-white`}>
                  {metric.icon}
                </div>
                <div className={`flex items-center text-xs font-semibold ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? '↗' : '↘'} {metric.change}
                </div>
              </div>
              <div className={`text-2xl font-bold text-${metric.color}-700 mb-1`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-600">{metric.title}</div>
            </motion.div>
          ))}
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="modern-card"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#accuracyGradient)"
                name="Accuracy %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="modern-card"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">System Status</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">API Server</span>
            </div>
            <span className="text-xs font-semibold text-green-700">Online</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Database</span>
            </div>
            <span className="text-xs font-semibold text-green-700">Connected</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">AI Models</span>
            </div>
            <span className="text-xs font-semibold text-green-700">Ready</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Storage</span>
            </div>
            <span className="text-xs font-semibold text-yellow-700">75% Used</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              📊 View Detailed Analytics
            </button>
            <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              🔧 System Configuration
            </button>
            <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              📈 Export Reports
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceMetrics;