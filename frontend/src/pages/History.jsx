import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  CheckCircle, 
  Bot, 
  Target, 
  Search, 
  Grid3X3, 
  List, 
  Download, 
  RefreshCw, 
  ChevronRight, 
  Video, 
  Image as ImageIcon,
  HelpCircle,
  Play,
  FolderOpen,
  User,
  Clock,
  Calendar,
  SortAsc,
  Zap,
  X
} from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';

const History = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/history');
      setAnalyses(response.data.analyses || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to load analysis history');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(analysis => {
      if (filter !== 'all' && !analysis.analysis_result?.classification?.toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const filename = (analysis.original_filename || '').toLowerCase();
        const classification = (analysis.analysis_result?.classification || '').toLowerCase();
        if (!filename.includes(query) && !classification.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [analyses, filter, searchQuery]);

  const sortedAnalyses = useMemo(() => {
    return [...filteredAnalyses].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp);
      } else if (sortBy === 'confidence') {
        return (b.analysis_result?.authenticity_score || 0) - (a.analysis_result?.authenticity_score || 0);
      } else if (sortBy === 'filename') {
        return (a.original_filename || '').localeCompare(b.original_filename || '');
      }
      return 0;
    });
  }, [filteredAnalyses, sortBy]);

  const stats = useMemo(() => {
    const total = analyses.length;
    const authentic = analyses.filter(a => a.analysis_result?.classification === 'AUTHENTIC_HUMAN').length;
    const aiGenerated = analyses.filter(a => a.analysis_result?.classification?.includes('AI_GENERATED')).length;
    const avgScore = analyses.reduce((sum, a) => sum + (a.analysis_result?.authenticity_score || 0), 0) / (total || 1);
    return { total, authentic, aiGenerated, avgScore };
  }, [analyses]);

  const exportData = () => {
    const dataToExport = selectedItems.length > 0 
      ? analyses.filter((_, idx) => selectedItems.includes(idx))
      : sortedAnalyses;
    
    // Create properly formatted Excel data
    const reportInfo = [
      ['DeepFake Detector - Analysis Report'],
      ['Generated on:', new Date().toLocaleString()],
      ['Total Analyses:', dataToExport.length],
      ['Filter Applied:', filter === 'all' ? 'All Files' : filter.replace('_', ' ')],
      [''],
      ['SUMMARY STATISTICS'],
      ['Total Files:', stats.total],
      ['Human Content:', stats.authentic],
      ['AI Generated:', stats.aiGenerated],
      ['Average Score:', `${Math.round(stats.avgScore)}%`],
      [''],
      ['DETAILED ANALYSIS DATA']
    ];
    
    const headers = [
      'File Name', 'Type', 'Date', 'Classification', 'Score %', 'Risk', 'Confidence %', 'Methods', 'Status'
    ];
    
    const rows = dataToExport.map(analysis => {
      const result = analysis.analysis_result || {};
      const scores = result.individual_scores || {};
      const fileType = analysis.original_filename?.match(/\.(mp4|avi|mov|webm|mkv)$/i) ? 'Video' : 'Image';
      
      const fileName = analysis.original_filename || 'Unknown';
      const truncatedFileName = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
      
      return [
        truncatedFileName,
        fileType,
        new Date(analysis.created_at).toLocaleDateString(),
        (result.classification || 'Unknown').replace(/_/g, ' '),
        Math.round(result.authenticity_score || 0),
        result.risk_level || 'Unknown',
        Math.round((result.confidence || 0) * 100),
        Object.keys(scores).length,
        'Completed'
      ];
    });
    
    // Create Excel-compatible CSV format
    const csvRows = [
      ...reportInfo.map(row => row.join(',')),
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const cleanCell = String(cell).replace(/[\r\n,]/g, ' ').trim();
        return `"${cleanCell}"`;
      }).join(','))
    ];
    
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DeepFake-Analysis-Report-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`📊 Exported ${dataToExport.length} analyses to Excel format`);
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} selected analyses?`)) return;
    
    try {
      const deletePromises = selectedItems.map(idx => {
        const analysis = analyses[idx];
        return api.delete(`/api/analysis/${analysis.file_id}`);
      });
      
      await Promise.all(deletePromises);
      
      setAnalyses(prev => prev.filter((_, idx) => !selectedItems.includes(idx)));
      setSelectedItems([]);
      toast.success(`${selectedItems.length} analyses deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete some analyses');
    }
  };

  const clearFilters = () => {
    setFilter('all');
    setSortBy('newest');
    setSearchQuery('');
    setSelectedItems([]);
    toast.success('Filters cleared');
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'AUTHENTIC_HUMAN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'AI_GENERATED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'AUTHENTIC_HUMAN':
        return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      case 'AI_GENERATED':
        return <Bot className="w-6 h-6 text-red-600" />;
      default:
        return <HelpCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" text="Loading history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Analysis History
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Review and manage your AI detection analyses with advanced filtering and insights
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div 
                onClick={() => setFilter('all')}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                  filter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setFilter('authentic_human')}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                  filter === 'authentic_human' ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Human</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.authentic}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setFilter('ai_generated')}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                  filter === 'ai_generated' ? 'ring-2 ring-red-500 bg-red-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Generated</p>
                    <p className="text-3xl font-bold text-red-600">{stats.aiGenerated}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setSortBy('confidence')}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                  sortBy === 'confidence' ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Score</p>
                    <p className="text-3xl font-bold text-purple-600">{Math.round(stats.avgScore)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <motion.div 
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex items-center gap-3">
                {/* Advanced Filter Dropdown */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none pl-10 pr-10 py-3 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur-sm border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-gray-700 hover:from-blue-50 hover:to-white group-hover:scale-105"
                  >
                    <option value="all" className="bg-white text-gray-700 py-2">All Files ({analyses.length})</option>
                    <option value="authentic_human" className="bg-emerald-50 text-emerald-700 py-2">Human Content ({stats.authentic})</option>
                    <option value="ai_generated" className="bg-red-50 text-red-700 py-2">AI Generated ({stats.aiGenerated})</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-blue-500 rotate-90 group-hover:rotate-180 transition-transform duration-300" />
                  </div>
                </div>

                {/* Advanced Sort Dropdown */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                    <SortAsc className="w-4 h-4 text-purple-500" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-10 pr-10 py-3 bg-gradient-to-r from-white/90 to-purple-50/80 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-gray-700 hover:from-purple-50 hover:to-white group-hover:scale-105"
                  >
                    <option value="newest" className="bg-white text-gray-700 py-2">Newest First</option>
                    <option value="oldest" className="bg-gray-50 text-gray-700 py-2">Oldest First</option>
                    <option value="confidence" className="bg-green-50 text-green-700 py-2">Highest Score</option>
                    <option value="filename" className="bg-blue-50 text-blue-700 py-2">Filename A-Z</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-purple-500 rotate-90 group-hover:rotate-180 transition-transform duration-300" />
                  </div>
                </div>

                {/* Enhanced View Mode */}
                <div className="flex bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-1 shadow-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:bg-white/50 hover:text-blue-600'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:block">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:bg-white/50 hover:text-blue-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:block">List</span>
                  </button>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportData}
                    className="group px-4 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 flex items-center gap-2 font-medium"
                  >
                    <Download className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="hidden sm:block">Export</span>
                  </button>

                  {(filter !== 'all' || sortBy !== 'newest' || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="group p-3 bg-gradient-to-r from-gray-500 via-slate-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
                      title="Clear All Filters"
                    >
                      <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                  )}

                  <button
                    onClick={fetchHistory}
                    className="group p-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-blue-600">{sortedAnalyses.length}</span> of <span className="font-semibold">{analyses.length}</span> analyses
                </p>
                {sortedAnalyses.length > 0 && (
                  <button
                    onClick={() => {
                      const allIndices = sortedAnalyses.map(analysis => analyses.findIndex(a => a === analysis));
                      setSelectedItems(prev => 
                        allIndices.every(idx => prev.includes(idx)) 
                          ? prev.filter(idx => !allIndices.includes(idx))
                          : [...new Set([...prev, ...allIndices])]
                      );
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {sortedAnalyses.every(analysis => selectedItems.includes(analyses.findIndex(a => a === analysis))) ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results */}
          {sortedAnalyses.length > 0 ? (
            <motion.div 
              className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {sortedAnalyses.map((analysis, index) => {
                const originalIndex = analyses.findIndex(a => a === analysis);
                return (
                  <motion.div
                    key={originalIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-gray-50/90 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer group hover:scale-[1.02] hover:-translate-y-1 ${
                      selectedItems.includes(originalIndex) ? 'ring-4 ring-blue-400/50 bg-gradient-to-br from-blue-50/90 to-indigo-50/80 border-blue-300/60' : ''
                    }`}
                    onClick={() => navigate(`/analysis/${originalIndex}`)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(originalIndex)}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedItems(prev => 
                                prev.includes(originalIndex) 
                                  ? prev.filter(i => i !== originalIndex)
                                  : [...prev, originalIndex]
                              );
                            }}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {selectedItems.includes(originalIndex) && (
                            <div className="absolute inset-0 bg-blue-500 rounded-lg animate-pulse" />
                          )}
                        </div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-white/50 group-hover:shadow-xl transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {analysis.cloudinary_url ? (
                            analysis.original_filename?.match(/\.(mp4|avi|mov|webm|mkv)$/i) ? (
                              <Video className="w-7 h-7 text-blue-600 relative z-10" />
                            ) : (
                              <img 
                                src={analysis.cloudinary_url} 
                                alt={analysis.original_filename || 'Thumbnail'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.outerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                }}
                              />
                            )
                          ) : (
                            <div className="w-6 h-6">{getClassificationIcon(analysis.analysis_result?.classification)}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getClassificationColor(analysis.analysis_result?.classification)}`}>
                        {analysis.analysis_result?.classification?.replace(/_/g, ' ') || 'Unknown'}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 truncate mb-1" title={analysis.original_filename}>
                        {analysis.original_filename || 'Unknown File'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(analysis.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Authenticity Score</span>
                        <span className="font-semibold">
                          {Math.round(analysis.analysis_result?.authenticity_score || 0)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            (analysis.analysis_result?.authenticity_score || 0) >= 50 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.round(analysis.analysis_result?.authenticity_score || 0)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analysis.analysis_result?.risk_level === 'SAFE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {analysis.analysis_result?.risk_level || 'Unknown'} Risk
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/analysis/${originalIndex}`);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Analysis History</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {analyses.length === 0 
                  ? "You haven't performed any analyses yet. Start by uploading your first file!" 
                  : "No analyses match your current filters. Try adjusting your search criteria."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/analyze')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Start Analysis
                </button>
                <button 
                  onClick={fetchHistory}
                  className="px-6 py-3 bg-white/50 text-gray-700 rounded-xl hover:bg-white/70 transition-all border border-gray-200 font-medium"
                >
                  Refresh History
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;