import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, RadialBarChart, RadialBar, Area, AreaChart } from 'recharts';
import { Target, Zap, AlertTriangle, CheckCircle, Search, BarChart3, Settings, MessageCircle, Twitter, Linkedin, Github, Heart } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import RealTimeStats from '../components/Dashboard/RealTimeStats.jsx';
import PerformanceMetrics from '../components/Dashboard/PerformanceMetrics.jsx';

const Dashboard = React.memo(() => {
  const navigate = useNavigate();
  const [, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [realTimeStats, setRealTimeStats] = useState(null);

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [statsRes, historyRes, allHistoryRes] = await Promise.all([
        api.get('/api/stats', { skipCache: true, params: { _t: Date.now() } }),
        api.get('/api/history?limit=12', { skipCache: true, params: { _t: Date.now() } }),
        api.get('/api/history', { skipCache: true, params: { _t: Date.now() } })
      ]);
      
      setStats(statsRes.data);
      setRecentAnalyses(historyRes.data.analyses || []);
      setAllAnalyses(allHistoryRes.data.analyses || []);
      setRealTimeStats({
        lastUpdated: new Date(),
        totalFiles: (historyRes.data.analyses || []).length,
        processingTime: Math.random() * 2 + 1 // Simulated avg processing time
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Enhanced Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
              <p className="text-gray-600 text-lg">Monitor your AI detection activities and insights</p>
              {realTimeStats && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Last updated: {realTimeStats.lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <select 
                value={selectedTimeRange} 
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="input-field py-2 px-3 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <motion.button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="btn-secondary py-2 px-4 text-sm flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.svg 
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </motion.svg>
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

        {/* Enhanced Statistics Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div 
            onClick={() => navigate('/history', { state: { filter: 'all' } })}
            className="modern-card cursor-pointer group overflow-hidden relative"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Analyses</p>
                <motion.p 
                  className="text-4xl font-bold text-gray-900"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {allStats.totalAnalyses}
                </motion.p>
                <div className="mt-3 flex items-center text-sm">
                  <motion.span 
                    className={`font-semibold px-2 py-1 rounded-full text-xs ${
                      allStats.thisWeekAnalyses >= allStats.lastWeekAnalyses 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {allStats.thisWeekAnalyses >= allStats.lastWeekAnalyses ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                      </svg>
                    )}
                    {Math.abs(allStats.thisWeekAnalyses - allStats.lastWeekAnalyses)}
                  </motion.span>
                  <span className="text-gray-600 ml-2">vs last week</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            onClick={() => navigate('/history', { state: { filter: 'authentic_human' } })}
            className="modern-card cursor-pointer group overflow-hidden relative"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Human Content</p>
                <motion.p 
                  className="text-4xl font-bold text-emerald-600"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                >
                  {allStats.authenticFiles}
                </motion.p>
                <div className="mt-3 flex items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '60px' }}>
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${allStats.totalAnalyses > 0 ? (allStats.authenticFiles / allStats.totalAnalyses) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-600 font-medium">
                      {allStats.totalAnalyses > 0 ? 
                        ((allStats.authenticFiles / allStats.totalAnalyses) * 100).toFixed(1) : 0
                      }%
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            onClick={() => navigate('/history', { state: { filter: 'ai_generated' } })}
            className="modern-card cursor-pointer group overflow-hidden relative"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">AI Generated</p>
                <motion.p 
                  className="text-4xl font-bold text-red-600"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  {allStats.aiGeneratedFiles}
                </motion.p>
                <div className="mt-3 flex items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '60px' }}>
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${allStats.totalAnalyses > 0 ? (allStats.aiGeneratedFiles / allStats.totalAnalyses) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-600 font-medium">
                      {allStats.totalAnalyses > 0 ? 
                        ((allStats.aiGeneratedFiles / allStats.totalAnalyses) * 100).toFixed(1) : 0
                      }%
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            onClick={() => navigate('/history', { state: { sortBy: 'confidence' } })}
            className="modern-card cursor-pointer group overflow-hidden relative"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Confidence</p>
                <motion.p 
                  className="text-4xl font-bold text-purple-600"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                >
                  {Math.round(allStats.averageConfidence)}%
                </motion.p>
                <div className="mt-3 flex items-center text-sm">
                  <motion.span 
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      allStats.averageConfidence >= 70 ? 'bg-green-100 text-green-700' : 
                      allStats.averageConfidence >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {allStats.averageConfidence >= 70 ? (
                      <><Target className="w-3 h-3" /> High</>
                    ) : allStats.averageConfidence >= 50 ? (
                      <><Zap className="w-3 h-3" /> Medium</>
                    ) : (
                      <><AlertTriangle className="w-3 h-3" /> Low</>
                    )}
                  </motion.span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <motion.div variants={itemVariants} className="modern-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Analysis Distribution</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-3 mt-6">
              {pieData.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="modern-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Weekly Activity</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Analyses</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
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
                  dataKey="analyses" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAnalyses)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} className="modern-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Confidence Score</h3>
              <motion.div 
                className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Live
              </motion.div>
            </div>
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={confidenceData} startAngle={180} endAngle={0}>
                  <RadialBar 
                    dataKey="value" 
                    cornerRadius={15} 
                    animationDuration={2000}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div 
                    className="text-5xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                  >
                    {allStats.averageConfidence}%
                  </motion.div>
                  <div className="text-sm text-gray-600 mt-1">Average</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-green-500"></div>
                <div className="text-xs font-semibold text-green-700">High</div>
                <div className="text-xs text-gray-600">70%+</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-yellow-500"></div>
                <div className="text-xs font-semibold text-yellow-700">Medium</div>
                <div className="text-xs text-gray-600">50-70%</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-red-500"></div>
                <div className="text-xs font-semibold text-red-700">Low</div>
                <div className="text-xs text-gray-600">&lt; 50%</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Compact Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <motion.div variants={itemVariants} className="modern-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Monthly Trends</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Human</span>
                <div className="w-2 h-2 bg-red-500 rounded-full ml-3"></div>
                <span className="text-xs text-gray-600">AI</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="authentic" 
                  stackId="1"
                  stroke="#22c55e" 
                  strokeWidth={1.5}
                  fill="url(#colorHuman)"
                  name="Human"
                  animationDuration={1000}
                />
                <Area 
                  type="monotone" 
                  dataKey="ai" 
                  stackId="1"
                  stroke="#ef4444" 
                  strokeWidth={1.5}
                  fill="url(#colorAI)"
                  name="AI Generated"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} className="modern-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">File Types</h3>
              <div className="text-sm text-gray-600">
                Total: {allStats.imageCount + allStats.videoCount}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <motion.div 
                className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <motion.p 
                  className="text-2xl font-bold text-purple-600 mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  {allStats.imageCount}
                </motion.p>
                <p className="text-xs font-medium text-gray-700">Images</p>
                <div className="mt-2">
                  <div className="w-full bg-purple-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(allStats.imageCount + allStats.videoCount) > 0 ? (allStats.imageCount / (allStats.imageCount + allStats.videoCount)) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {(allStats.imageCount + allStats.videoCount) > 0 ? 
                      ((allStats.imageCount / (allStats.imageCount + allStats.videoCount)) * 100).toFixed(1) : 0
                    }%
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <motion.p 
                  className="text-2xl font-bold text-pink-600 mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                >
                  {allStats.videoCount}
                </motion.p>
                <p className="text-xs font-medium text-gray-700">Videos</p>
                <div className="mt-2">
                  <div className="w-full bg-pink-200 rounded-full h-1.5">
                    <div 
                      className="bg-pink-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(allStats.imageCount + allStats.videoCount) > 0 ? (allStats.videoCount / (allStats.imageCount + allStats.videoCount)) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {(allStats.imageCount + allStats.videoCount) > 0 ? 
                      ((allStats.videoCount / (allStats.imageCount + allStats.videoCount)) * 100).toFixed(1) : 0
                    }%
                  </p>
                </div>
              </motion.div>
            </div>
            
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Real-time System Status */}
        <motion.div variants={itemVariants} className="mb-10">
          <RealTimeStats stats={realTimeStats} />
        </motion.div>

        {/* Enhanced Recent Analyses */}
        <motion.div variants={itemVariants} className="modern-card mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Analyses</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live Updates</span>
                </div>
                {selectedFilter !== 'all' && (
                  <motion.div 
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="text-sm text-gray-600">Filtered:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {selectedFilter === 'authentic' ? 'Human' : 
                       selectedFilter === 'enhanced' ? 'Enhanced' :
                       selectedFilter === 'suspicious' ? 'Suspicious' : 'AI Generated'}
                    </span>
                    <button 
                      onClick={() => setSelectedFilter('all')} 
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-6 sm:mt-0">
              <div className="flex bg-gray-100 rounded-xl p-1.5">
                {['all', 'authentic', 'ai'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedFilter === filter
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'authentic' ? 'Human' : 'AI'}
                  </button>
                ))}
              </div>
              <Link 
                to="/history" 
                className="btn-secondary py-2.5 px-5 text-sm flex items-center space-x-2"
              >
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {(() => {
              const filteredAnalyses = selectedFilter === 'all' ? recentAnalyses : 
                recentAnalyses.filter(a => {
                  const classification = a.analysis_result?.classification;
                  if (selectedFilter === 'authentic') return classification === 'AUTHENTIC_HUMAN';
                  if (selectedFilter === 'ai') return classification === 'AI_GENERATED';
                  return true;
                });
              
              return filteredAnalyses.length > 0 ? (
                <motion.div 
                  key="analyses-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredAnalyses.slice(0, 12).map((analysis, index) => {
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
                    
                    const isHuman = analysis.analysis_result?.classification === 'AUTHENTIC_HUMAN';
                    
                    return (
                      <motion.div 
                        key={`${analysis._id || index}-${selectedFilter}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() => {
                          const analysisId = analysis._id || analysis.id || index;
                          console.log('Navigating to analysis:', analysisId, analysis);
                          navigate(`/analysis/${analysisId}`);
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isHuman ? 'bg-green-100 group-hover:bg-green-200' : 'bg-red-100 group-hover:bg-red-200'
                            } transition-colors duration-300`}>
                              {isHuman ? (
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 max-w-[200px]">
                              <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors text-sm leading-tight" title={analysis.original_filename || 'Unknown file'}>
                                {analysis.original_filename || 'Unknown file'}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-sm font-semibold ${getScoreColor(confPercent)}`}>
                                  {confPercent}%
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {new Date(analysis.created_at || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <motion.div 
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                              isHuman ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {isHuman ? (
                              <><CheckCircle className="w-3 h-3" /> Human</>
                            ) : (
                              <><AlertTriangle className="w-3 h-3" /> AI</>
                            )}
                          </motion.div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${
                              getFileType(analysis.original_filename) === 'video' ? 'bg-pink-500' : 'bg-purple-500'
                            }`}></div>
                            <span className="text-xs text-gray-600 capitalize">
                              {getFileType(analysis.original_filename)}
                            </span>
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 flex-shrink-0 ml-2">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-1000 ${
                                isHuman ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${confPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-8 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    {selectedFilter === 'all' ? 'No analyses yet' : `No ${selectedFilter} analyses found`}
                  </h4>
                  <p className="text-gray-600 mb-8">
                    {selectedFilter === 'all' 
                      ? 'Upload your first file to get started with AI detection'
                      : `Try adjusting your filter or upload more files`
                    }
                  </p>
                  <div className="flex justify-center space-x-4">
                    {selectedFilter !== 'all' && (
                      <button 
                        onClick={() => setSelectedFilter('all')} 
                        className="btn-secondary py-2 px-4 text-sm"
                      >
                        Show All Analyses
                      </button>
                    )}
                    <Link to="/analyze" className="btn-primary py-2 px-4 text-sm">
                      Start Analysis
                    </Link>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

        </motion.div>

        {/* Performance Metrics Section */}
        <motion.div variants={itemVariants}>
          <PerformanceMetrics analyses={allAnalyses} />
        </motion.div>

        {/* Enhanced Modern Footer */}
        <motion.footer 
          variants={itemVariants} 
          className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white rounded-3xl mt-16 p-10 overflow-hidden shadow-2xl"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Enhanced Brand Section */}
            <div className="space-y-6">
              <motion.div 
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    DeepFake Detector
                  </h3>
                  <p className="text-blue-200 text-sm">Next-Gen AI Security</p>
                </div>
              </motion.div>
              
              <p className="text-gray-300 text-base leading-relaxed">
                Advanced AI-powered deepfake detection system protecting digital integrity with military-grade precision.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <motion.div 
                      className="w-3 h-3 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-green-300 text-sm font-semibold">99.7%</span>
                  </div>
                  <p className="text-gray-300 text-xs">Detection Accuracy</p>
                </motion.div>
                
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <motion.div 
                      className="w-3 h-3 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <span className="text-blue-300 text-sm font-semibold">&lt;2s</span>
                  </div>
                  <p className="text-gray-300 text-xs">Processing Speed</p>
                </motion.div>
              </div>
            </div>

            {/* Enhanced Quick Links */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-white mb-4">Quick Links</h4>
              <div className="space-y-3">
                {[
                  { to: '/analyze', text: 'New Analysis', icon: Search, desc: 'Upload & scan files' },
                  { to: '/history', text: 'History', icon: BarChart3, desc: 'View past results' },
                  { to: '/settings', text: 'Settings', icon: Settings, desc: 'Configure preferences' },
                  { to: '/help', text: 'Help & Support', icon: MessageCircle, desc: 'Get assistance' }
                ].map((link, index) => {
                  const IconComponent = link.icon;
                  return (
                    <motion.div key={index} whileHover={{ x: 5 }}>
                      <Link 
                        to={link.to} 
                        className="group flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20"
                      >
                        <IconComponent className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                        <div>
                          <div className="text-white font-medium group-hover:text-blue-300 transition-colors">{link.text}</div>
                          <div className="text-gray-400 text-xs">{link.desc}</div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Connect Section */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-white mb-4">Connect</h4>
              
              <motion.a 
                href="mailto:support@deepfakedetector.com" 
                className="group flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium group-hover:text-red-300 transition-colors">Email Support</div>
                  <div className="text-gray-400 text-xs">support@deepfakedetector.com</div>
                </div>
              </motion.a>
              
              <div className="space-y-3">
                <p className="text-gray-300 text-sm font-medium">Follow Us</p>
                <div className="flex space-x-4">
                  {[
                    { name: 'Twitter', icon: Twitter, color: 'from-gray-600 to-gray-700', hoverColor: 'hover:from-gray-500 hover:to-gray-600', link: 'https://twitter.com/visheshpancha0l' },
                    { name: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700', hoverColor: 'hover:from-blue-500 hover:to-blue-600', link: 'https://www.linkedin.com/in/vishesh-panchal-144281353?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app' },
                    { name: 'GitHub', icon: Github, color: 'from-gray-700 to-gray-800', hoverColor: 'hover:from-gray-600 hover:to-gray-700', link: 'https://github.com/visheshpanchal27' }
                  ].map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <motion.a 
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 bg-gradient-to-br ${social.color} ${social.hoverColor} rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        title={social.name}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <motion.div 
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </motion.div>
                  <span className="text-green-300 text-sm font-semibold">System Status: Online</span>
                </div>
                <p className="text-gray-400 text-xs">All services operational • 99.9% uptime</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Bottom Section */}
          <motion.div 
            className="relative border-t border-white/20 mt-10 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <p className="text-gray-300 text-sm">
                  © 2024 DeepFake Detector. All rights reserved.
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Built with</span>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                  </motion.div>
                  <span>for digital security</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400">Powered by</span>
                  <div className="flex space-x-1">
                    <motion.div 
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-pink-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    />
                  </div>
                  <span className="font-semibold text-white">Advanced AI</span>
                </div>
                
                <div className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  v2.1.0
                </div>
              </div>
            </div>
          </motion.div>
        </motion.footer>
      </motion.div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;