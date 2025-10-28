import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, CheckCircle, Circle, Mail } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }));
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { register, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const passwordRequirements = React.useMemo(() => ({
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  }), [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        toast.success(result.message);
        setShowOTP(true);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyOTP(formData.email, otp);
      
      if (result.success) {
        toast.success('Welcome! Your account is ready.');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 animated-gradient opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-white/90 to-blue-50/80"></div>
        
        <motion.div 
          className="relative max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="modern-card text-center">
            <motion.div 
              className="mx-auto h-20 w-20 gradient-bg rounded-3xl flex items-center justify-center shadow-2xl mb-6"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Mail className="w-10 h-10 text-white" strokeWidth={2.5} />
            </motion.div>
            
            <h2 className="text-4xl font-extrabold gradient-text mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-8">
              We sent a 6-digit verification code to<br />
              <span className="font-semibold text-blue-600">{formData.email}</span>
            </p>

            <form className="space-y-6" onSubmit={handleOTPSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-3">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary flex justify-center items-center text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="Verifying..." />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verify Email
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 animated-gradient opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/90 to-blue-50/80"></div>
      
      <motion.div 
        className="relative max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="modern-card">
          <div className="text-center mb-8">
            <motion.div 
              className="mx-auto h-16 w-16 gradient-bg rounded-2xl flex items-center justify-center shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <UserPlus className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <motion.h2 
              className="mt-6 text-4xl font-extrabold gradient-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Join Us Today
            </motion.h2>
            <motion.p 
              className="mt-3 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in here
              </Link>
            </motion.p>
          </div>

          <motion.form 
            className="space-y-5" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-field pr-10"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 text-xs space-y-1">
                    <div className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordRequirements.minLength ? <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> : <Circle className="w-3.5 h-3.5 mr-1.5" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordRequirements.hasUpperCase ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Circle className="w-3.5 h-3.5 mr-1" />}A-Z
                      </span>
                      <span className={`flex items-center ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordRequirements.hasLowerCase ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Circle className="w-3.5 h-3.5 mr-1" />}a-z
                      </span>
                      <span className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordRequirements.hasNumber ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Circle className="w-3.5 h-3.5 mr-1" />}0-9
                      </span>
                      <span className={`flex items-center ${passwordRequirements.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordRequirements.hasSpecial ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Circle className="w-3.5 h-3.5 mr-1" />}!@#$
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="input-field pr-10"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className={`flex items-center ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.password === formData.confirmPassword ? <CheckCircle className="w-4 h-4 mr-2" /> : <Circle className="w-4 h-4 mr-2" />}
                      {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3 mt-6">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" onClick={() => setShowPrivacy(true)} className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Privacy Policy
                </button>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center items-center text-lg mt-8"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Creating account..." />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Terms of Service</h2>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-3 text-xs text-gray-700">
              <p className="text-xs text-gray-500">Last Updated: January 2024</p>
              
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">1. Acceptance of Terms</h3>
                <p>By accessing and using DeepFake Detector, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">2. Service Description</h3>
                <p>DeepFake Detector provides AI-powered content analysis to detect deepfakes and AI-generated media. Our service includes:</p>
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                  <li>Image and video analysis using machine learning algorithms</li>
                  <li>Authenticity scoring and risk assessment</li>
                  <li>Detailed analysis reports and history tracking</li>
                  <li>Cloud storage for analyzed content</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">3. User Responsibilities</h3>
                <p className="mb-1">You agree to:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>Provide accurate registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Not upload illegal, harmful, or copyrighted content without permission</li>
                  <li>Not attempt to reverse engineer or compromise our systems</li>
                  <li>Use the service only for lawful purposes</li>
                  <li>Not share your account with unauthorized users</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">4. Content Upload and Analysis</h3>
                <p className="mb-1">When you upload content:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>You retain ownership of your uploaded content</li>
                  <li>You grant us temporary rights to process and analyze the content</li>
                  <li>Files are automatically deleted after analysis completion</li>
                  <li>Maximum file sizes: 100MB for images, 500MB for videos</li>
                  <li>Supported formats: JPG, PNG, GIF, WebP, MP4, AVI, MOV, WebM</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">5. Accuracy and Limitations</h3>
                <p>While we strive for high accuracy (85%+), our service:</p>
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                  <li>Provides analysis results as guidance, not absolute truth</li>
                  <li>Should not be solely relied upon for critical decisions</li>
                  <li>May produce false positives or false negatives</li>
                  <li>Is continuously improving but not infallible</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">6. Prohibited Uses</h3>
                <p className="mb-1">You may not:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>Use the service to create or distribute deepfakes</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Attempt to overwhelm our systems (DDoS attacks)</li>
                  <li>Scrape or extract data without permission</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">7. Account Termination</h3>
                <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the service.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">8. Intellectual Property</h3>
                <p>All service content, features, and functionality are owned by DeepFake Detector and protected by copyright, trademark, and other intellectual property laws.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">9. Disclaimer of Warranties</h3>
                <p>The service is provided "as is" without warranties of any kind, either express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">10. Limitation of Liability</h3>
                <p>DeepFake Detector shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">11. Payment & Refunds</h3>
                <p className="mb-1">For paid services:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>All fees are in USD and non-refundable unless required by law</li>
                  <li>Subscription auto-renews unless cancelled 24 hours before renewal</li>
                  <li>Price changes notified 30 days in advance</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">12. Indemnification</h3>
                <p>You agree to indemnify DeepFake Detector from any claims arising from your use of the service.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">13. Governing Law & Disputes</h3>
                <p>These terms are governed by applicable laws. Disputes resolved through arbitration.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">14. Contact</h3>
                <p>Questions: <a href="mailto:deepfakedetector2.0@gmail.com" className="font-semibold text-blue-600 hover:underline">legal@deepfakedetector.com</a></p>
              </section>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-3xl z-10">
              <button onClick={() => setShowTerms(false)} className="w-full btn-primary">I Understand</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-3 text-xs text-gray-700">
              <p className="text-xs text-gray-500">Last Updated: January 2024</p>
              
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">1. Information We Collect</h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-0.5 text-xs">Personal Information:</h4>
                    <ul className="list-disc ml-5 space-y-0.5">
                      <li>Name and email address (for account creation)</li>
                      <li>Password (encrypted and never stored in plain text)</li>
                      <li>Profile information you choose to provide</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-0.5 text-xs">Usage Data:</h4>
                    <ul className="list-disc ml-5 space-y-0.5">
                      <li>Files uploaded for analysis (temporarily stored)</li>
                      <li>Analysis results and history</li>
                      <li>Device information and IP addresses</li>
                      <li>Browser type and operating system</li>
                      <li>Usage patterns and feature interactions</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">2. How We Use Your Information</h3>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>Provide and maintain our detection services</li>
                  <li>Process and analyze uploaded content</li>
                  <li>Send verification emails and important notifications</li>
                  <li>Improve our algorithms and service quality</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                  <li>Provide customer support</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">3. Data Storage and Security</h3>
                <p className="mb-1">We implement industry-standard security measures:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>256-bit AES encryption for data at rest</li>
                  <li>TLS/SSL encryption for data in transit</li>
                  <li>Secure cloud storage with MongoDB Atlas</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Automatic file deletion after analysis</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">4. Data Retention</h3>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>Uploaded files: Deleted immediately after analysis</li>
                  <li>Analysis results: Retained in your account history</li>
                  <li>Account data: Retained until account deletion</li>
                  <li>Logs and analytics: Retained for 90 days</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">5. Third-Party Services</h3>
                <p className="mb-1">We use trusted third-party services:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li><strong>Cloudinary:</strong> Temporary file storage and processing</li>
                  <li><strong>MongoDB Atlas:</strong> Database hosting</li>
                  <li><strong>Email Service:</strong> Verification and notifications</li>
                  <li>These services have their own privacy policies</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">6. Data Sharing</h3>
                <p className="mb-1">We do NOT sell your personal data. We may share data only:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With service providers under strict confidentiality</li>
                  <li>In case of business transfer (merger/acquisition)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">7. Your Rights</h3>
                <p className="mb-1">You have the right to:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data (data portability)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to data processing</li>
                  <li>Lodge a complaint with authorities</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">8. Cookies and Tracking</h3>
                <p className="mb-1">We use cookies for:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>Authentication and session management</li>
                  <li>Remembering preferences</li>
                  <li>Analytics and performance monitoring</li>
                  <li>You can control cookies through browser settings</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">9. Children's Privacy</h3>
                <p>Not intended for users under 13. We do not knowingly collect children's data.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">10. International Transfers</h3>
                <p>Data may be transferred internationally with appropriate safeguards.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">11. Data Breach Notification</h3>
                <p>We notify affected users within 72 hours of any data breach.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">12. Do Not Track</h3>
                <p>We honor DNT browser signals and will not track users with DNT enabled.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">13. CCPA Rights (California)</h3>
                <p className="mb-1">California residents have rights to:</p>
                <ul className="list-disc ml-5 space-y-0.5">
                  <li>Know what personal information is collected</li>
                  <li>Delete personal information</li>
                  <li>Opt-out of sale (we don't sell data)</li>
                  <li>Non-discrimination for exercising rights</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">14. Changes to Policy</h3>
                <p>We may update this policy periodically with email notification.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">15. Contact</h3>
                <p>Privacy: <span className="text-blue-600">privacy@deepfakedetector.com</span> | DPO: <span className="text-blue-600">dpo@deepfakedetector.com</span></p>
              </section>

              <section className="bg-blue-50 p-2.5 rounded-xl">
                <h3 className="text-xs font-bold text-blue-900 mb-1">GDPR & Compliance</h3>
                <p className="text-xs text-blue-800">Committed to GDPR, CCPA, and international privacy law compliance.</p>
              </section>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-3xl z-10">
              <button onClick={() => setShowPrivacy(false)} className="w-full btn-primary">I Understand</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;