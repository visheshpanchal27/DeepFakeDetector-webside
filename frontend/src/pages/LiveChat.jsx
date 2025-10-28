import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  ArrowLeft, 
  Send, 
  Bot, 
  User,
  Clock,
  CheckCircle
} from 'lucide-react';

const LiveChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const chatFlow = {
    start: {
      message: "Hello! I'm here to help you with DeepFake Detector. What can I assist you with today?",
      options: [
        { id: 'upload', text: 'How to upload files?', next: 'upload' },
        { id: 'results', text: 'Understanding results', next: 'results' },
        { id: 'account', text: 'Account issues', next: 'account' },
        { id: 'technical', text: 'Technical problems', next: 'technical' },
        { id: 'pricing', text: 'Pricing & Plans', next: 'pricing' },
        { id: 'api', text: 'API Integration', next: 'api' }
      ]
    },
    upload: {
      message: "Great! I can help you with file uploads. What specifically would you like to know?",
      options: [
        { id: 'formats', text: 'Supported file formats', next: 'formats' },
        { id: 'size', text: 'File size limits', next: 'size' },
        { id: 'batch', text: 'Batch upload', next: 'batch' },
        { id: 'back', text: '← Back to main menu', next: 'start' }
      ]
    },
    results: {
      message: "I'll help you understand your analysis results. What would you like to know?",
      options: [
        { id: 'confidence', text: 'Confidence scores', next: 'confidence' },
        { id: 'authentic', text: 'What means authentic?', next: 'authentic' },
        { id: 'fake', text: 'What means fake?', next: 'fake' },
        { id: 'back', text: '← Back to main menu', next: 'start' }
      ]
    },
    account: {
      message: "I can help with account-related questions. What's the issue?",
      options: [
        { id: 'login', text: 'Login problems', next: 'login' },
        { id: 'password', text: 'Reset password', next: 'password' },
        { id: 'upgrade', text: 'Upgrade account', next: 'upgrade' },
        { id: 'back', text: '← Back to main menu', next: 'start' }
      ]
    },
    technical: {
      message: "Let me help you with technical issues. What's happening?",
      options: [
        { id: 'slow', text: 'Analysis is slow', next: 'slow' },
        { id: 'error', text: 'Getting errors', next: 'error' },
        { id: 'browser', text: 'Browser issues', next: 'browser' },
        { id: 'back', text: '← Back to main menu', next: 'start' }
      ]
    },
    formats: {
      message: "We support these file formats:\n\n📸 Images: JPG, PNG, GIF, WebP, TIFF, BMP\n🎥 Videos: MP4, AVI, MOV, WebM, MKV\n🎵 Audio: MP3, WAV, AAC, FLAC\n\nAll formats are processed with the same high accuracy!",
      options: [
        { id: 'upload', text: '← Back to upload help', next: 'upload' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    size: {
      message: "File size limits:\n\n• Maximum: 500MB per file\n• Recommended: Under 100MB for faster processing\n• Batch uploads: Up to 50 files at once\n\nLarger files take longer to process but maintain the same accuracy.",
      options: [
        { id: 'upload', text: '← Back to upload help', next: 'upload' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    batch: {
      message: "Batch upload features:\n\n• Upload up to 50 files simultaneously\n• Drag & drop multiple files at once\n• Queue system processes files in order\n• Real-time progress tracking\n• Download results as ZIP file",
      options: [
        { id: 'upload', text: '← Back to upload help', next: 'upload' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    confidence: {
      message: "Confidence scores explained:\n\n🟢 90-100%: Very high confidence\n🟡 70-89%: High confidence\n🟠 50-69%: Medium confidence\n🔴 Below 50%: Low confidence\n\nHigher scores mean more certainty in the detection result.",
      options: [
        { id: 'results', text: '← Back to results help', next: 'results' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    authentic: {
      message: "Authentic content means:\n\n✅ Original, unmodified media\n✅ No AI manipulation detected\n✅ Natural facial movements and expressions\n✅ Consistent lighting and shadows\n\nGreen indicators show authentic content.",
      options: [
        { id: 'results', text: '← Back to results help', next: 'results' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    fake: {
      message: "Fake/Manipulated content shows:\n\n❌ AI-generated or altered media\n❌ Inconsistent facial features\n❌ Unnatural movements or expressions\n❌ Compression artifacts from manipulation\n\nRed indicators show potential deepfakes.",
      options: [
        { id: 'results', text: '← Back to results help', next: 'results' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    login: {
      message: "Login troubleshooting:\n\n1. Check your email and password\n2. Clear browser cache and cookies\n3. Try incognito/private mode\n4. Reset password if needed\n5. Contact support if issues persist\n\nNeed a password reset link?",
      options: [
        { id: 'password', text: 'Yes, reset password', next: 'password' },
        { id: 'account', text: '← Back to account help', next: 'account' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    password: {
      message: "To reset your password:\n\n1. Go to login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your email for reset link\n5. Follow the instructions\n\nCheck spam folder if you don't see the email!",
      options: [
        { id: 'account', text: '← Back to account help', next: 'account' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    upgrade: {
      message: "Account upgrade benefits:\n\n🚀 Unlimited analyses\n⚡ Priority processing\n📊 Advanced analytics\n🔧 API access\n📞 Phone support\n\nUpgrade in Settings → Billing section.",
      options: [
        { id: 'account', text: '← Back to account help', next: 'account' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    slow: {
      message: "If analysis is slow:\n\n• Check your internet connection\n• Try smaller file sizes\n• Use supported formats\n• Clear browser cache\n• Try during off-peak hours\n\nPremium users get priority processing!",
      options: [
        { id: 'technical', text: '← Back to technical help', next: 'technical' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    error: {
      message: "Common error solutions:\n\n• Refresh the page\n• Check file format and size\n• Disable ad blockers\n• Try different browser\n• Clear cache and cookies\n\nStill getting errors? Contact our support team!",
      options: [
        { id: 'technical', text: '← Back to technical help', next: 'technical' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    browser: {
      message: "Browser compatibility:\n\n✅ Chrome (recommended)\n✅ Firefox\n✅ Safari\n✅ Edge\n\nFor best experience:\n• Enable JavaScript\n• Allow cookies\n• Update to latest version",
      options: [
        { id: 'technical', text: '← Back to technical help', next: 'technical' },
        { id: 'start', text: '← Main menu', next: 'start' }
      ]
    },
    pricing: {
      message: "Our pricing plans:\n\n🆓 Free: 10 analyses/month\n💎 Pro ($19/month): Unlimited analyses\n🚀 Enterprise ($99/month): API access + priority\n\nAll plans include 99.7% accuracy!",
      options: [
        { id: 'compare', text: 'Compare plans', next: 'compare' },
        { id: 'billing', text: 'Billing questions', next: 'billing' },
        { id: 'start', text: '← Back to main menu', next: 'start' }
      ]
    },
    api: {
      message: "API Integration help:\n\n📚 Full REST API documentation\n🔑 API key management\n⚡ Rate limits: 1000 req/hour\n🛡️ Secure authentication\n\nAvailable for Pro+ plans only.",
      options: [
        { id: 'apikey', text: 'Get API key', next: 'apikey' },
        { id: 'apidocs', text: 'View documentation', next: 'apidocs' },
        { id: 'start', text: '← Back to main menu', next: 'start' }
      ]
    },
    compare: {
      message: "Plan comparison:\n\n🆓 Free: 10/month, web only\n💎 Pro: Unlimited, batch upload\n🚀 Enterprise: Everything + API\n\nUpgrade in Settings!",
      options: [
        { id: 'upgrade', text: 'How to upgrade?', next: 'upgrade' },
        { id: 'pricing', text: '← Back to pricing', next: 'pricing' }
      ]
    },
    billing: {
      message: "Billing information:\n\n💳 Monthly/yearly billing\n🔄 Cancel anytime\n💰 30-day refund policy\n📧 Invoices via email\n\nManage in Settings → Billing.",
      options: [
        { id: 'cancel', text: 'How to cancel?', next: 'cancel' },
        { id: 'pricing', text: '← Back to pricing', next: 'pricing' }
      ]
    },
    apikey: {
      message: "To get your API key:\n\n1. Upgrade to Pro or Enterprise\n2. Go to Settings → API\n3. Click 'Generate API Key'\n4. Copy and secure your key\n\nKeep your API key secret!",
      options: [
        { id: 'api', text: '← Back to API help', next: 'api' }
      ]
    },
    apidocs: {
      message: "API Documentation includes:\n\n📖 Complete endpoint reference\n💡 Code examples\n🔧 SDKs and libraries\n📊 Response formats\n\nAccess at /api/docs after upgrading.",
      options: [
        { id: 'api', text: '← Back to API help', next: 'api' }
      ]
    },
    cancel: {
      message: "To cancel subscription:\n\n1. Go to Settings → Billing\n2. Click 'Cancel Subscription'\n3. Confirm cancellation\n4. Access until period ends\n\nNo cancellation fees!",
      options: [
        { id: 'billing', text: '← Back to billing', next: 'billing' }
      ]
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }

    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      text: chatFlow.start.message,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setCurrentOptions(chatFlow.start.options);
  }, []);

  const saveChatHistory = (messages) => {
    const chatSession = {
      id: Date.now(),
      messages,
      timestamp: new Date()
    };
    const updatedHistory = [chatSession, ...chatHistory.slice(0, 4)];
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  };

  const clearChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      text: chatFlow.start.message,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setCurrentOptions(chatFlow.start.options);
  };

  const addMessage = (text, type = 'user') => {
    const message = {
      id: Date.now(),
      type,
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleOptionClick = (option) => {
    // Add user's selection
    addMessage(option.text, 'user');
    
    // Show typing indicator
    setIsTyping(true);
    setCurrentOptions([]);
    
    // Simulate bot response delay
    setTimeout(() => {
      const nextFlow = chatFlow[option.next];
      if (nextFlow) {
        addMessage(nextFlow.message, 'bot');
        setCurrentOptions(nextFlow.options);
      }
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Live Chat Support</h1>
        <p className="text-gray-600">
          Get instant help with our interactive chat assistant
        </p>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[70vh] flex flex-col"
      >
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Support Assistant</h3>
                <div className="flex items-center space-x-2 text-blue-100 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Clock className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={clearChat}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gray-100'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat History */}
        {showHistory && (
          <div className="border-t border-gray-100 p-3 bg-gray-50 max-h-24 overflow-y-auto">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Recent Chats</h4>
            {chatHistory.length > 0 ? (
              <div className="space-y-1">
                {chatHistory.map((session) => (
                  <button
                    key={session.id}
                    className="w-full text-left p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors text-xs"
                  >
                    <div className="font-medium text-gray-900 truncate">
                      Chat Session
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs">No chat history yet</p>
            )}
          </div>
        )}

        {/* Options */}
        {currentOptions.length > 0 && (
          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Choose an option:</p>
              <button
                onClick={() => saveChatHistory(messages)}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Save Chat
              </button>
            </div>
            <div className={`grid gap-2 ${
              currentOptions.length <= 2 ? 'grid-cols-1' :
              currentOptions.length <= 4 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {currentOptions.map((option) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionClick(option)}
                  className="text-left p-2 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200 text-xs"
                >
                  <span className="text-gray-900">{option.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 grid grid-cols-3 gap-2"
      >
        <button
          onClick={() => navigate('/help')}
          className="p-3 bg-white rounded-lg shadow border border-gray-100 hover:shadow-md transition-all text-center group"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:bg-blue-200 transition-colors">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-xs">Help Center</h3>
        </button>
        
        <a
          href="mailto:deepfakedetector2.0@gmail.com"
          className="p-3 bg-white rounded-lg shadow border border-gray-100 hover:shadow-md transition-all text-center group"
        >
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:bg-green-200 transition-colors">
            <Send className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-xs">Email Support</h3>
        </a>
        
        <button
          onClick={clearChat}
          className="p-3 bg-white rounded-lg shadow border border-gray-100 hover:shadow-md transition-all text-center group"
        >
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:bg-purple-200 transition-colors">
            <MessageCircle className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-xs">New Chat</h3>
        </button>
      </motion.div>
    </div>
  );
};

export default LiveChat;