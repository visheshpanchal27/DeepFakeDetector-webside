import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Book,
  Video,
  FileText,
  Users,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  ArrowLeft,
  X,
  Play,
  Code,
  Globe,
  Clock,
  Star,
  Download
} from 'lucide-react';

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'What is DeepFake Detector?',
      answer: 'DeepFake Detector is a cutting-edge artificial intelligence platform designed to identify and analyze synthetic media content. Our system leverages advanced deep learning algorithms, including convolutional neural networks (CNNs) and transformer architectures, to detect manipulated images and videos with unprecedented accuracy. The platform was developed by a team of AI researchers and cybersecurity experts to combat the growing threat of deepfake technology in misinformation campaigns, identity theft, and digital fraud. Our detection engine analyzes multiple layers of media data, including pixel-level inconsistencies, temporal artifacts, facial landmark irregularities, and compression patterns that are typically introduced during the deepfake generation process. The system is continuously updated with new detection models trained on the latest deepfake generation techniques to stay ahead of evolving threats.'
    },
    {
      id: 2,
      category: 'usage',
      question: 'How do I upload files for analysis?',
      answer: 'Uploading files for analysis is designed to be intuitive and secure. You can upload content through multiple methods: drag and drop files directly onto the upload zone, click the upload button to browse your device, or paste URLs for online content. Our platform supports a wide range of formats including JPG, PNG, GIF, WebP for images, and MP4, AVI, MOV, WebM for videos. The maximum file size limit is 500MB per upload to ensure optimal processing speed. Before uploading, ensure your files are of good quality as higher resolution content provides more accurate detection results. The system automatically validates file integrity and format compatibility. For batch processing, you can upload multiple files simultaneously, and our system will queue them for sequential analysis. All uploads are encrypted during transmission using TLS 1.3 protocol and processed in isolated containers for maximum security.'
    },
    {
      id: 3,
      category: 'technical',
      question: 'How accurate is the detection?',
      answer: 'Our detection system achieves an industry-leading accuracy rate of 99.7% across various deepfake generation methods and content types. This high accuracy is achieved through our ensemble approach that combines multiple specialized neural networks, each trained on different aspects of synthetic media detection. Our models are trained on over 10 million samples from diverse sources, including the latest deepfake generation tools like FaceSwap, DeepFaceLab, and emerging AI models. The system provides confidence scores ranging from 0-100% to give users transparency about detection certainty. We continuously benchmark our performance against academic datasets like FaceForensics++, Celeb-DF, and DFDC, consistently achieving top-tier results. Our false positive rate is maintained below 0.5% through rigorous validation processes. The system is particularly effective at detecting facial manipulations, voice synthesis, and full-body deepfakes, with specialized models for each category.'
    },
    {
      id: 4,
      category: 'privacy',
      question: 'Is my data secure?',
      answer: 'Data security and privacy are our highest priorities. We implement military-grade AES-256 encryption for all data in transit and at rest. Your uploaded files are processed in secure, isolated cloud containers that are automatically destroyed after analysis completion. We never store your original files permanently on our servers - all content is purged within 24 hours of upload. Our infrastructure is SOC 2 Type II certified and complies with GDPR, CCPA, and other international privacy regulations. All processing occurs in geographically distributed data centers with redundant security measures including multi-factor authentication, intrusion detection systems, and 24/7 security monitoring. We maintain detailed audit logs for compliance purposes but never share user data with third parties. Our privacy policy is transparent about data handling practices, and users have full control over their data with options to request immediate deletion. Regular security audits and penetration testing ensure our systems remain secure against emerging threats.'
    },
    {
      id: 5,
      category: 'usage',
      question: 'What file formats are supported?',
      answer: 'Our platform supports a comprehensive range of media formats to accommodate diverse user needs. For images, we accept JPG/JPEG (including progressive), PNG (with transparency), GIF (animated and static), WebP, TIFF, and BMP formats. Video support includes MP4 (H.264/H.265 codecs), AVI, MOV (QuickTime), WebM, MKV, and FLV formats. We also support various audio formats for voice deepfake detection including MP3, WAV, AAC, and FLAC. The maximum file size is 500MB per upload, with resolution support up to 4K for videos and 50MP for images. For optimal results, we recommend using uncompressed or lightly compressed formats when possible, as heavy compression can interfere with detection algorithms. Batch uploads support up to 50 files simultaneously. Our system automatically handles format conversion and optimization during processing while preserving the original quality needed for accurate analysis. We regularly add support for new formats based on user feedback and emerging media standards.'
    },
    {
      id: 6,
      category: 'technical',
      question: 'How long does analysis take?',
      answer: 'Analysis time varies based on content type, file size, and complexity. Most image analyses complete within 1-3 seconds, leveraging our optimized GPU clusters and efficient neural network architectures. Video analysis typically takes 5-30 seconds depending on duration and resolution, with our system processing approximately 2-4 seconds of video content per second of real time. For high-resolution 4K videos or content longer than 10 minutes, processing may take up to 2-3 minutes. Our distributed processing infrastructure automatically scales based on demand, with load balancing across multiple data centers to minimize wait times. During peak usage periods, files are queued with estimated completion times provided in real-time. Premium users receive priority processing with dedicated resources for faster turnaround. The system provides live progress updates during analysis, showing which detection models are currently running. For batch uploads, files are processed in parallel when possible, significantly reducing total processing time compared to sequential analysis.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'general', name: 'General', icon: Info },
    { id: 'usage', name: 'Usage', icon: Book },
    { id: 'technical', name: 'Technical', icon: Zap },
    { id: 'privacy', name: 'Privacy', icon: Shield }
  ];

  const resources = [
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      description: 'Learn the basics of using DeepFake Detector',
      icon: Book,
      color: 'blue',
      content: {
        title: 'Getting Started with DeepFake Detector',
        sections: [
          {
            title: '1. Account Setup',
            content: 'Create your account and verify your email. Choose between our free tier (10 analyses/month) or premium plans for unlimited access.'
          },
          {
            title: '2. Upload Your First File',
            content: 'Navigate to the Analyze page and drag-drop your image or video. Supported formats include JPG, PNG, MP4, and more up to 500MB.'
          },
          {
            title: '3. Understanding Results',
            content: 'Review the confidence score (0-100%), detection details, and visual indicators. Green means authentic, red indicates potential manipulation.'
          },
          {
            title: '4. Advanced Features',
            content: 'Explore batch processing, API integration, and detailed analysis reports available in your dashboard.'
          }
        ]
      }
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Video,
      color: 'purple',
      content: {
        title: 'Video Tutorial Library',
        videos: [
          { title: 'Platform Overview (5 min)', duration: '5:23', views: '12.5K' },
          { title: 'Advanced Analysis Features (8 min)', duration: '8:15', views: '8.2K' },
          { title: 'API Integration Guide (12 min)', duration: '12:45', views: '5.1K' },
          { title: 'Batch Processing Tutorial (6 min)', duration: '6:30', views: '3.8K' }
        ]
      }
    },
    {
      id: 'api-docs',
      title: 'API Documentation',
      description: 'Integrate our detection API',
      icon: FileText,
      color: 'green',
      content: {
        title: 'API Documentation',
        endpoints: [
          { method: 'POST', path: '/api/v1/analyze', description: 'Submit file for analysis' },
          { method: 'GET', path: '/api/v1/results/{id}', description: 'Retrieve analysis results' },
          { method: 'GET', path: '/api/v1/history', description: 'Get analysis history' },
          { method: 'POST', path: '/api/v1/batch', description: 'Batch file processing' }
        ],
        rateLimit: '1000 requests/hour',
        authentication: 'API Key required'
      }
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: Users,
      color: 'orange',
      content: {
        title: 'Community Forum',
        stats: {
          members: '15,420',
          posts: '8,932',
          activeToday: '342'
        },
        categories: [
          'General Discussion',
          'Technical Support',
          'Feature Requests',
          'API Development',
          'Research & Papers'
        ]
      }
    }
  ];

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Get comprehensive help via email within 24 hours',
      icon: Mail,
      contact: 'support@deepfakedetector.com',
      action: () => {
        const subject = encodeURIComponent('DeepFake Detector Support Request');
        const body = encodeURIComponent('Hello Support Team,\n\nI need assistance with:\n\n[Please describe your issue here]\n\nAccount Email: \nBrowser: ' + navigator.userAgent + '\n\nThank you!');
        window.open(`mailto:support@deepfakedetector.com?subject=${subject}&body=${body}`);
      },
      color: 'red',
      details: 'Our technical support team responds to all emails within 24 hours during business days. For faster resolution, please include your account email and detailed description of the issue.'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: MessageCircle,
      contact: 'Available 9 AM - 6 PM EST (Mon-Fri)',
      action: () => {
        navigate('/live-chat');
      },
      color: 'blue',
      details: 'Connect instantly with our support agents for quick questions and troubleshooting. Average response time is under 2 minutes during business hours.'
    },
    {
      title: 'Phone Support',
      description: 'Call us for urgent technical issues',
      icon: Phone,
      contact: '+1 (555) 123-4567',
      action: () => window.open('tel:+15551234567'),
      color: 'green',
      details: 'Priority phone support for critical issues and enterprise customers. Available 24/7 for premium subscribers, business hours for standard users.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back</span>
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-4">Help & Support</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Find answers to your questions and get the help you need to make the most of DeepFake Detector
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto mb-12"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for help articles, FAQs, and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-gray-900 placeholder-gray-500"
          />
        </div>
      </motion.div>

      {/* Quick Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => {
            const IconComponent = resource.icon;
            return (
              <motion.div
                key={index}
                className={`group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer`}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModal(resource.id)}
              >
                <div className={`w-12 h-12 bg-gradient-to-br from-${resource.color}-500 to-${resource.color}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Learn more</span>
                  <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-600">Our support team is here to help you with any questions or issues</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {contactOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <motion.div
                key={index}
                className={`group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center cursor-pointer`}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={option.action}
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-${option.color}-500 to-${option.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                <p className={`text-${option.color}-600 font-medium text-sm mb-2`}>{option.contact}</p>
                <p className="text-gray-500 text-xs">{option.details}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800">All Systems Operational</h3>
            <p className="text-green-600 text-sm">99.9% uptime • Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Resource Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const resource = resources.find(r => r.id === activeModal);
                if (!resource) return null;
                
                return (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br from-${resource.color}-500 to-${resource.color}-600 rounded-xl flex items-center justify-center`}>
                          <resource.icon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{resource.content.title}</h2>
                      </div>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>
                    
                    {resource.id === 'getting-started' && (
                      <div className="space-y-6">
                        {resource.content.sections.map((section, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{section.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {resource.id === 'video-tutorials' && (
                      <div className="space-y-4">
                        {resource.content.videos.map((video, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{video.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{video.duration}</span>
                                <span>{video.views} views</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {resource.id === 'api-docs' && (
                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
                          <div className="space-y-3">
                            {resource.content.endpoints.map((endpoint, index) => (
                              <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {endpoint.method}
                                </span>
                                <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                                <span className="text-sm text-gray-600">{endpoint.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-xl p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Rate Limit</h4>
                            <p className="text-blue-700">{resource.content.rateLimit}</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4">
                            <h4 className="font-semibold text-green-900 mb-2">Authentication</h4>
                            <p className="text-green-700">{resource.content.authentication}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {resource.id === 'community' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-orange-50 rounded-xl">
                            <div className="text-2xl font-bold text-orange-600">{resource.content.stats.members}</div>
                            <div className="text-sm text-orange-700">Members</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-xl">
                            <div className="text-2xl font-bold text-orange-600">{resource.content.stats.posts}</div>
                            <div className="text-sm text-orange-700">Posts</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-xl">
                            <div className="text-2xl font-bold text-orange-600">{resource.content.stats.activeToday}</div>
                            <div className="text-sm text-orange-700">Active Today</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
                          <div className="space-y-2">
                            {resource.content.categories.map((category, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <Globe className="w-5 h-5 text-orange-500" />
                                <span className="text-gray-900">{category}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Help;