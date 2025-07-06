import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { registerUser } from '../../services/firebase/auth';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { checkFirebaseSetup, getFirebaseSetupInstructions, getFirebaseErrorMessage } from '../../utils/firebaseChecker';

const SecretAdminSetup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    secretKey: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Secret key for admin setup (في الإنتاج، هذا يجب أن يكون في متغير بيئة)
  const ADMIN_SECRET_KEY = 'TOURS_ADMIN_2024_SECRET';

  useEffect(() => {
    // إذا كان المستخدم مسجل دخول بالفعل، اتجه إلى الصفحة الرئيسية
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateSecretKey = () => {
    if (formData.secretKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      setError('');
      setSuccess('✅ Secret key verified! You can now create admin account.');
    } else {
      setError('❌ Invalid secret key. Access denied.');
      setIsAuthorized(false);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.phone.trim()) return 'Phone number is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthorized) {
      setError('Please verify the secret key first');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: 'admin', // هذا هو المهم - إنشاء حساب admin
        dateOfBirth: new Date('1990-01-01'), // تاريخ افتراضي
      };

      const result = await registerUser(userData);

      if (result.success) {
        setSuccess('🎉 Admin account created successfully! Please wait...');

        // Log the success
        console.log('✅ Admin account created successfully');

        // Wait for auth state to update, then redirect
        setTimeout(() => {
          console.log('🔄 Redirecting to admin dashboard...');
          // Force a full page reload to ensure auth state is properly updated
          window.location.href = '/admin';
        }, 4000);
      } else {
        // Handle specific Firebase errors
        let errorMessage = result.error || 'Failed to create admin account';

        if (errorMessage.includes('auth/configuration-not-found') ||
            errorMessage.includes('Firebase Authentication is not enabled') ||
            errorMessage.includes('configuration-not-found')) {
          setError(`🔥 Firebase Authentication Not Enabled!

📋 Follow these steps to fix:

1️⃣ Open Firebase Console:
   https://console.firebase.google.com/project/tours-52d78/authentication/providers

2️⃣ Click "Get Started" if you see it

3️⃣ Go to "Sign-in method" tab

4️⃣ Find "Email/Password" and click it

5️⃣ Toggle "Enable" and click "Save"

6️⃣ Come back here and try again

🔧 Technical Error: ${result.error}`);
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Admin registration error:', error);

      let errorMessage = error.message || 'An error occurred during registration';

      if (errorMessage.includes('auth/configuration-not-found') ||
          errorMessage.includes('Firebase Authentication') ||
          errorMessage.includes('configuration-not-found')) {
        setError(`🔥 Firebase Authentication Not Enabled!

📋 Quick Fix Steps:

1️⃣ Open this link in a new tab:
   https://console.firebase.google.com/project/tours-52d78/authentication/providers

2️⃣ Click "Get Started" (if you see it)

3️⃣ Click on "Sign-in method" tab

4️⃣ Find "Email/Password" provider

5️⃣ Click on it and toggle "Enable"

6️⃣ Click "Save"

7️⃣ Refresh this page and try again

🔧 Error Details: ${error.message}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            🔐 Secret Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Restricted access - Admin account creation
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Secret Key Verification */}
          {!isAuthorized && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-sm font-medium text-red-800">
                  Authorization Required
                </h3>
              </div>
              <div className="space-y-3">
                <input
                  type="password"
                  name="secretKey"
                  placeholder="Enter secret admin key"
                  value={formData.secretKey}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <Button
                  type="button"
                  onClick={validateSecretKey}
                  variant="outline"
                  size="small"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  Verify Secret Key
                </Button>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <pre className="text-sm text-red-600 whitespace-pre-wrap font-mono">
                    {error}
                  </pre>
                  {error.includes('Firebase Authentication Not Enabled') && (
                    <div className="mt-4 flex space-x-3">
                      <a
                        href="https://console.firebase.google.com/project/tours-52d78/authentication/providers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        🔥 Open Firebase Console
                      </a>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        🔄 Refresh Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            </div>
          )}

          {/* Admin Registration Form */}
          {isAuthorized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="space-y-4 bg-white rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Admin Account
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                loading={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Create Admin Account
              </Button>
            </motion.div>
          )}
        </motion.form>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            ⚠️ This page is for authorized personnel only
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SecretAdminSetup;
