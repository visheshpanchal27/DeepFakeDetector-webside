import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, RadialBarChart, RadialBar } from 'recharts';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';

const Dashboard = React.memo(() => {
  const navigate = useNavigate();
  const [, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, historyRes, allHistoryRes] = await Promise.all([
        api.get('/api/stats', { skipCache: true, params: { _t: Date.now() } }),
        api.get('/api/history?limit=8', { skipCache: true, params: { _t: Date.now() } }),
        api.get('/api/history', { skipCache: true, params: { _t: Date.now() } })
      ]);
      
      setStats(statsRes.data);
      setRecentAnalyses(historyRes.data.analyses || []);
      setAllAnalyses(allHistoryRes.data.analyses || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getFileType = useCallback((filename) => {
    if (!filename) return 'image';
    const ext = filename.toLowerCase().split('.').pop();
    const videoExts = ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv'];
    return videoExts.includes(ext) ? 'video' : 'image';
  }, []);

  const getScoreColor = useCallback((score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  const calculateStats = useCallback((analyses) => {
    if (!analyses || analyses.length === 0) {
      return {
        totalAnalyses: 0,
        authenticFiles: 0,
        humanEnhancedFiles: 0,
        suspiciousFiles: 0,
        aiGeneratedFiles: 0,
        averageConfidence: 0,
        thisWeekAnalyses: 0,
        lastWeekAnalyses: 0,
        imageCount: 0,
        videoCount: 0
      };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekAnalyses = analyses.filter(a => new Date(a.created_at) >= weekAgo).length;
    const lastWeekAnalyses = analyses.filter(a => {
      const date = new Date(a.created_at);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    const authenticFiles = analyses.filter(a => 
      a.analysis_result?.classification === 'AUTHENTIC_HUMAN'
    ).length;
    
    const aiGeneratedFiles = analyses.filter(a => 
      a.analysis_result?.classification === 'AI_GENERATED'
    ).length;

    const imageCount = analyses.filter(a => getFileType(a.original_filename) === 'image').length;
    const videoCount = analyses.filter(a => getFileType(a.original_filename) === 'video').length;

    const avgConfidence = analyses.reduce((sum, a) => 
      sum + ((a.analysis_result?.confidence || 0) * 100), 0
    ) / analyses.length;

    return {
      totalAnalyses: analyses.length,
      authenticFiles,
      aiGeneratedFiles,
      averageConfidence: Math.round(avgConfidence),
      thisWeekAnalyses,
      lastWeekAnalyses,
      imageCount,
      videoCount
    };
  }, [getFileType]);

  const allStats = useMemo(() => calculateStats(allAnalyses), [allAnalyses, calculateStats]);

  const pieData = useMemo(() => [
    { name: 'Human', value: allStats.authenticFiles, color: '#22c55e' },
    { name: 'AI Generated', value: allStats.aiGeneratedFiles, color: '#ef4444' }
  ].filter(item => item.value > 0), [allStats]);

  useEffect(() => {
    fetchDashboardData();
    
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    const handleStorageChange = (e) => {
      if (e.key === 'dashboardRefresh') {
        fetchDashboardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('refreshDashboard', handleRefresh);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }



  const fileTypeData = [
    { name: 'Images', value: allStats.imageCount, fill: '#8b5cf6' },
    { name: 'Videos', value: allStats.videoCount, fill: '#ec4899' }
  ].filter(item => item.value > 0);

  const getMonthlyData = (analyses) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(month => ({ name: month, analyses: 0, authentic: 0, suspicious: 0, ai: 0 }));
    
    analyses.forEach(analysis => {
      const monthIndex = new Date(analysis.created_at).getMonth();
      monthlyData[monthIndex].analyses++;
      const classification = analysis.analysis_result?.classification;
      if (classification === 'AUTHENTIC_HUMAN') monthlyData[monthIndex].authentic++;
      else if (classification === 'AI_GENERATED') monthlyData[monthIndex].ai++;
    });
    
    return monthlyData.filter(m => m.analyses > 0);
  };

  const confidenceData = [{
    name: 'Confidence',
    value: allStats.averageConfidence,
    fill: allStats.averageConfidence >= 70 ? '#22c55e' : allStats.averageConfidence >= 50 ? '#f59e0b' : '#ef4444'
  }];

  const monthlyData = getMonthlyData(allAnalyses);

  const getWeeklyData = (analyses) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map(day => ({ name: day, analyses: 0 }));
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    analyses.filter(a => new Date(a.created_at) >= weekAgo).forEach(analysis => {
      const dayIndex = new Date(analysis.created_at).getDay();
      weeklyData[dayIndex].analyses++;
    });
    
    return weeklyData;
  };

  const weeklyData = getWeeklyData(allAnalyses);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor your AI detection activities and insights</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/analyze" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">New Analysis</h3>
                <p className="text-gray-600 text-sm">Upload and analyze files</p>
              </div>
            </div>
          </Link>

          <Link to="/history" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">View History</h3>
                <p className="text-gray-600 text-sm">Browse past analyses</p>
              </div>
            </div>
          </Link>

          <Link to="/settings" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600 text-sm">Manage preferences</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            onClick={() => navigate('/history', { state: { filter: 'all' } })}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-3xl font-bold text-gray-900">{allStats.totalAnalyses}</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className={`font-medium ${
                    allStats.thisWeekAnalyses >= allStats.lastWeekAnalyses ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {allStats.thisWeekAnalyses >= allStats.lastWeekAnalyses ? '+' : ''}
                    {allStats.thisWeekAnalyses - allStats.lastWeekAnalyses}
                  </span>
                  <span className="text-gray-600 ml-1">from last week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/history', { state: { filter: 'authentic_human' } })}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Human</p>
                <p className="text-3xl font-bold text-emerald-600">{allStats.authenticFiles}</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-600">
                    {allStats.totalAnalyses > 0 ? 
                      ((allStats.authenticFiles / allStats.totalAnalyses) * 100).toFixed(1) : 0
                    }% of total
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/history', { state: { filter: 'ai_generated' } })}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Generated</p>
                <p className="text-3xl font-bold text-red-600">{allStats.aiGeneratedFiles}</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-600">
                    {allStats.totalAnalyses > 0 ? 
                      ((allStats.aiGeneratedFiles / allStats.totalAnalyses) * 100).toFixed(1) : 0
                    }% of total
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/history', { state: { sortBy: 'confidence' } })}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-3xl font-bold text-purple-600">{Math.round(allStats.averageConfidence)}%</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    allStats.averageConfidence >= 70 ? 'bg-green-100 text-green-700' : 
                    allStats.averageConfidence >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {allStats.averageConfidence >= 70 ? 'High' : allStats.averageConfidence >= 50 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div variants={itemVariants} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="analyses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Confidence</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={confidenceData} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={10} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold" fill="#1f2937">
                  {allStats.averageConfidence}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                <span className="text-sm text-gray-600">High (70%+)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-orange-500"></div>
                <span className="text-sm text-gray-600">Medium (50-70%)</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div variants={itemVariants} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="authentic" stroke="#22c55e" strokeWidth={2} name="Human" />

                <Line type="monotone" dataKey="ai" stroke="#ef4444" strokeWidth={2} name="AI Generated" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{allStats.imageCount}</p>
                <p className="text-sm text-gray-600">Images</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">{allStats.videoCount}</p>
                <p className="text-sm text-gray-600">Videos</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Analyses */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Analyses</h3>
              {selectedFilter !== 'all' && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing: <span className="font-semibold text-blue-600">
                    {selectedFilter === 'authentic' ? 'Human' : 
                     selectedFilter === 'enhanced' ? 'Enhanced' :
                     selectedFilter === 'suspicious' ? 'Suspicious' : 'AI Generated'}
                  </span>
                  <button onClick={() => setSelectedFilter('all')} className="ml-2 text-xs text-red-600 hover:text-red-700">
                    Clear Filter
                  </button>
                </p>
              )}
            </div>
            <Link to="/history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {(() => {
            const filteredAnalyses = selectedFilter === 'all' ? recentAnalyses : 
              recentAnalyses.filter(a => {
                const classification = a.analysis_result?.classification;
                if (selectedFilter === 'authentic') return classification === 'AUTHENTIC_HUMAN';
                if (selectedFilter === 'ai') return classification === 'AI_GENERATED';
                return true;
              });
            
            return filteredAnalyses.length > 0 ? (
              <div className="space-y-4">
                {filteredAnalyses.slice(0, 8).map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      analysis.analysis_result?.classification === 'AUTHENTIC_HUMAN' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {analysis.analysis_result?.classification === 'AUTHENTIC_HUMAN' ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 truncate max-w-xs" title={analysis.original_filename || 'Unknown file'}>
                        {analysis.original_filename || 'Unknown file'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const confidence = analysis.analysis_result?.confidence;
                          let confPercent = 0;
                          if (confidence) {
                            if (confidence > 100) {
                              confPercent = Math.round(confidence / 100);
                            } else if (confidence > 1) {
                              confPercent = Math.round(confidence);
                            } else {
                              confPercent = Math.round(confidence * 100);
                            }
                          }
                          return (
                            <>
                              <span className={`font-semibold ${getScoreColor(confPercent)}`}>
                                {confPercent}%
                              </span> confidence • {new Date(analysis.created_at || Date.now()).toLocaleDateString()}
                            </>
                          );
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    analysis.analysis_result?.classification === 'AUTHENTIC_HUMAN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {analysis.analysis_result?.classification?.replace(/_/g, ' ') || 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                {selectedFilter === 'all' ? 'No analyses yet' : `No ${selectedFilter} analyses found`}
              </p>
              {selectedFilter !== 'all' && (
                <button onClick={() => setSelectedFilter('all')} className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4">
                  Show All Analyses
                </button>
              )}
            </div>
          );
          })()}
          
          {recentAnalyses.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">No analyses yet</p>
              <Link to="/analyze" className="btn-primary">
                Start Your First Analysis
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;