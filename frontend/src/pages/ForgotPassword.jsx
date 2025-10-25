import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import { KeyRound, Mail, Lock, CheckCircle, Circle } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate password in real-time
    if (name === 'password') {
      setPasswordValidation({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/forgot-password', {
        email: formData.email
      });
      
      toast.success('Password reset OTP sent to your email');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password requirements
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      toast.error('Please meet all password requirements');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/reset-password', {
        email: formData.email,
        otp: formData.otp,
        password: formData.password
      });
      
      toast.success('Password reset successfully');
      setStep(1);
      setFormData({ email: '', otp: '', password: '', confirmPassword: '' });
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 animated-gradient opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white/90 to-red-50/80"></div>
      
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
              <KeyRound className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <motion.h2 
              className="mt-6 text-4xl font-extrabold gradient-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'Reset Password'}
            </motion.h2>
            <motion.p 
              className="mt-3 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {step === 1 ? 'Enter your email to receive reset instructions' : 
               step === 2 ? 'Enter the OTP sent to your email' : 
               'Enter your new password'}
            </motion.p>
          </div>

          {step === 1 && (
            <motion.form 
              className="space-y-6" 
              onSubmit={handleEmailSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
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

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center items-center text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="Sending..." />
                ) : (
                  'Send Reset Code'
                )}
              </motion.button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Back to Login
                </Link>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              className="space-y-6" 
              onSubmit={handleOTPSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                  maxLength={6}
                />
              </div>

              <motion.button
                type="submit"
                disabled={formData.otp.length !== 6}
                className="w-full btn-primary flex justify-center items-center text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Verify Code
              </motion.button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form 
              className="space-y-6" 
              onSubmit={handlePasswordSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                />
                
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-gray-600 font-medium mb-2">Password Requirements:</div>
                    <div className="grid grid-cols-1 gap-1">
                      <div className={`flex items-center text-xs ${
                        passwordValidation.length ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {passwordValidation.length ? <CheckCircle className="w-3.5 h-3.5 mr-2" /> : <Circle className="w-3.5 h-3.5 mr-2" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center text-xs ${
                        passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {passwordValidation.uppercase ? <CheckCircle className="w-3.5 h-3.5 mr-2" /> : <Circle className="w-3.5 h-3.5 mr-2" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center text-xs ${
                        passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {passwordValidation.lowercase ? <CheckCircle className="w-3.5 h-3.5 mr-2" /> : <Circle className="w-3.5 h-3.5 mr-2" />}
                        One lowercase letter
                      </div>
                      <div className={`flex items-center text-xs ${
                        passwordValidation.number ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {passwordValidation.number ? <CheckCircle className="w-3.5 h-3.5 mr-2" /> : <Circle className="w-3.5 h-3.5 mr-2" />}
                        One number
                      </div>
                      <div className={`flex items-center text-xs ${
                        passwordValidation.special ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {passwordValidation.special ? <CheckCircle className="w-3.5 h-3.5 mr-2" /> : <Circle className="w-3.5 h-3.5 mr-2" />}
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading || !Object.values(passwordValidation).every(Boolean) || formData.password !== formData.confirmPassword}
                className="w-full btn-primary flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="Resetting..." />
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;