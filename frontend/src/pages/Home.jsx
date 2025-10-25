import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Rocket, ScanSearch, LayoutDashboard, CheckCircle, Zap, Lock, BarChart3, Shield, FileImage, Video, Newspaper, Building2, Scale, ShieldCheck, Sparkles, User } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const scrollToSection = () => {
      if (location.hash) {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          const navbarHeight = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const timer = setTimeout(scrollToSection, 100);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/40 to-purple-50/80"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              <span>Advanced AI Detection Technology</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="text-gray-900">Detect</span>
            <span className="gradient-text"> AI-Generated</span>
            <br />
            <span className="text-gray-900">Content Instantly</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Harness the power of cutting-edge machine learning to identify deepfakes and AI-generated content with 
            <span className="font-semibold text-blue-600"> 85%+ accuracy</span> in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Link to="/analyze" className="btn-primary text-lg px-10 py-4 neon-glow flex items-center gap-2">
                  <ScanSearch className="w-5 h-5" />
                  <span>Start Analysis</span>
                </Link>
                <Link to="/dashboard" className="btn-secondary text-lg px-10 py-4 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  <span>View Dashboard</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-10 py-4 neon-glow flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Get Started Free</span>
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-10 py-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">85%+ Accuracy</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">2-5s Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Detection Features
          </h2>
          <p className="text-lg text-gray-600">
            Powered by state-of-the-art machine learning algorithms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="modern-card text-center floating-card">
            <div className="w-16 h-16 gradient-bg rounded-2xl mx-auto mb-6 flex items-center justify-center pulse-glow">
              <ScanSearch className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Analysis</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Lightning-fast detection using state-of-the-art neural networks that process multiple detection algorithms simultaneously.
            </p>
            <button 
              onClick={() => setActiveModal('realtime')}
              className="mt-6 inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors cursor-pointer"
            >
              Learn More →
            </button>
          </div>

          <div className="modern-card text-center floating-card">
            <div className="w-16 h-16 gradient-bg rounded-2xl mx-auto mb-6 flex items-center justify-center pulse-glow">
              <BarChart3 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Detailed Insights</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Comprehensive analysis reports with authenticity scores, confidence metrics, and detailed risk assessments.
            </p>
            <button 
              onClick={() => setActiveModal('insights')}
              className="mt-6 inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors cursor-pointer"
            >
              View Sample →
            </button>
          </div>

          <div className="modern-card text-center floating-card">
            <div className="w-16 h-16 gradient-bg rounded-2xl mx-auto mb-6 flex items-center justify-center pulse-glow">
              <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Military-grade security with 85%+ accuracy for detecting the latest AI-generated content and deepfakes.
            </p>
            <button 
              onClick={() => setActiveModal('security')}
              className="mt-6 inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors cursor-pointer"
            >
              Security Details →
            </button>
          </div>
        </div>
      </div>

      <div id="performance" className="bg-gradient-to-r from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Analysis Distribution & Performance</h2>
            <p className="text-xl text-gray-700">Real-time insights into our detection capabilities</p>
          </div>
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-5xl font-extrabold gradient-text mb-3">92.5%</div>
              <div className="text-gray-800 font-bold text-lg">Detection Accuracy</div>
              <div className="text-sm text-gray-600 mt-2">Latest AI Models</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{width: '92.5%'}}></div>
              </div>
            </div>
            
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-5xl font-extrabold gradient-text mb-3">1.8s</div>
              <div className="text-gray-800 font-bold text-lg">Avg Analysis Time</div>
              <div className="text-sm text-gray-600 mt-2">Ultra-Fast Processing</div>
              <div className="flex justify-center mt-4 space-x-1">
                <div className="w-2 h-8 bg-purple-500 rounded animate-pulse"></div>
                <div className="w-2 h-6 bg-purple-400 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-4 bg-purple-300 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
            
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FileImage className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-5xl font-extrabold gradient-text mb-3">500MB</div>
              <div className="text-gray-800 font-bold text-lg">Max File Size</div>
              <div className="text-sm text-gray-600 mt-2">Large Media Support</div>
              <div className="flex justify-center mt-4 space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Images</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Videos</span>
              </div>
            </div>
            
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-green-100">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-5xl font-extrabold gradient-text mb-3">99.9%</div>
              <div className="text-gray-800 font-bold text-lg">Uptime</div>
              <div className="text-sm text-gray-600 mt-2">Always Available</div>
              <div className="flex justify-center mt-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full ml-2"></div>
              </div>
            </div>
          </div>
          
          {/* Detection Methods Breakdown */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Detection Method Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle cx="48" cy="48" r="40" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="75.36" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">70%</span>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Neural Network Analysis</h4>
                <p className="text-sm text-gray-600">Deep learning pattern recognition</p>
              </div>
              
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle cx="48" cy="48" r="40" stroke="#8b5cf6" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="125.6" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">50%</span>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Metadata Forensics</h4>
                <p className="text-sm text-gray-600">Digital fingerprint analysis</p>
              </div>
              
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="100.48" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">60%</span>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Pixel Artifact Detection</h4>
                <p className="text-sm text-gray-600">Compression inconsistencies</p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              <p className="text-center text-sm text-gray-700">
                <span className="font-semibold">Combined Confidence:</span> Our multi-layered approach achieves 92.5% accuracy by analyzing multiple detection vectors simultaneously
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-700">Simple 3-step process to detect AI-generated content</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Content</h3>
              <p className="text-gray-700 text-lg">Drag and drop your image or video file. Supports JPG, PNG, MP4, AVI, and more formats up to 500MB.</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-700 text-lg">Our advanced neural networks analyze pixel patterns, compression artifacts, and metadata inconsistencies.</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Results</h3>
              <p className="text-gray-700 text-lg">Receive detailed authenticity scores, risk levels, and comprehensive analysis reports in seconds.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Formats Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Supported File Formats</h2>
            <p className="text-xl text-gray-700">Comprehensive detection across multiple media types</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="modern-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FileImage className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Images</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <div className="font-semibold text-blue-800">JPG</div>
                  <div className="text-sm text-blue-600">JPEG</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <div className="font-semibold text-blue-800">PNG</div>
                  <div className="text-sm text-blue-600">Portable</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <div className="font-semibold text-blue-800">WebP</div>
                  <div className="text-sm text-blue-600">Modern</div>
                </div>
              </div>
              <p className="text-gray-700 mt-4">Maximum size: <span className="font-semibold text-blue-600">100MB</span></p>
            </div>
            <div className="modern-card p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Video className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Videos</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                  <div className="font-semibold text-purple-800">MP4</div>
                  <div className="text-sm text-purple-600">Standard</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                  <div className="font-semibold text-purple-800">AVI</div>
                  <div className="text-sm text-purple-600">Classic</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                  <div className="font-semibold text-purple-800">MOV</div>
                  <div className="text-sm text-purple-600">QuickTime</div>
                </div>
              </div>
              <p className="text-gray-700 mt-4">Maximum size: <span className="font-semibold text-purple-600">500MB</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Uses DeepFake Detector</h2>
            <p className="text-xl text-gray-700">Trusted across industries for content verification</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Newspaper className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Journalists</h3>
              <p className="text-gray-700">Verify authenticity of news content and sources</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprises</h3>
              <p className="text-gray-700">Protect brand reputation and detect fraud</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Scale className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Teams</h3>
              <p className="text-gray-700">Evidence verification and forensic analysis</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-700">Cybersecurity and threat intelligence</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 border-2 border-white/30">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-2xl">
              Ready to Secure Your Content?
            </h2>
            <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto leading-relaxed font-semibold drop-shadow-lg">
              Join thousands of professionals, journalists, and security experts protecting against AI-generated misinformation.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link to="/register" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-10 rounded-xl shadow-2xl hover:shadow-white/40 transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Start Free Analysis</span>
                </Link>
                <Link to="/login" className="bg-white/20 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-10 rounded-xl transition-all duration-300 text-lg">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {activeModal === 'realtime' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-gray-900">🔍 Real-time Analysis</h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <div className="space-y-6">
                  <p className="text-lg text-gray-700">Our real-time analysis engine processes content using multiple AI detection algorithms simultaneously for maximum accuracy.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h4 className="font-bold text-blue-900 mb-2">⚡ Speed</h4>
                      <p className="text-sm text-blue-800">Average processing time of 1.8 seconds per file</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <h4 className="font-bold text-green-900 mb-2">🎯 Accuracy</h4>
                      <p className="text-sm text-green-800">92.5% detection accuracy on latest AI models</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-3">Detection Methods:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Neural network pattern analysis</li>
                      <li>• Pixel-level artifact detection</li>
                      <li>• Metadata forensics</li>
                      <li>• Compression inconsistency analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {activeModal === 'insights' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-gray-900">📊 Detailed Insights</h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <div className="space-y-6">
                  <p className="text-lg text-gray-700">Get comprehensive analysis reports with detailed breakdowns and confidence metrics.</p>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-4">Sample Analysis Report:</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">87%</div>
                        <div className="text-sm text-gray-600">Authenticity Score</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">LOW</div>
                        <div className="text-sm text-gray-600">Risk Level</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p><strong>Classification:</strong> AUTHENTIC_HUMAN</p>
                      <p><strong>Confidence:</strong> High (94.2%)</p>
                      <p><strong>Processing Time:</strong> 1.3 seconds</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeModal === 'security' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-gray-900">🛡️ Enterprise Security</h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <div className="space-y-6">
                  <p className="text-lg text-gray-700">Military-grade security protocols protect your data while delivering industry-leading detection accuracy.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-xl">
                      <h4 className="font-bold text-red-900 mb-2">🔒 Data Protection</h4>
                      <p className="text-sm text-red-800">End-to-end encryption, zero data retention</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <h4 className="font-bold text-green-900 mb-2">✅ Compliance</h4>
                      <p className="text-sm text-green-800">GDPR, SOC 2, ISO 27001 certified</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-3">Security Features:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• 256-bit AES encryption</li>
                      <li>• Secure file processing in isolated environments</li>
                      <li>• Automatic file deletion after analysis</li>
                      <li>• Multi-factor authentication support</li>
                      <li>• Enterprise SSO integration</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;