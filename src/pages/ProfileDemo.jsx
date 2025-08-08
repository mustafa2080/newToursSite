import React from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  CameraIcon,
  CheckCircleIcon,
  StarIcon,
  MapPinIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProfileImageUpload from '../components/common/ProfileImageUpload';
import { toast } from 'react-hot-toast';

const ProfileDemo = () => {
  const { user, isAuthenticated } = useAuth();

  const handleImageUpdate = (newImageUrl) => {
    toast.success('Profile picture updated successfully!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to view this demo.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Profile Image Demo</h1>
            <p className="text-xl text-blue-100">
              Upload and manage your profile picture with Firebase Storage
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Image Upload Demo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Profile Picture</h2>
              
              <div className="text-center mb-8">
                <ProfileImageUpload
                  currentImage={user?.profileImage}
                  onImageUpdate={handleImageUpdate}
                  size="xlarge"
                  showUploadButton={true}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Automatic image optimization and compression
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Secure Firebase Storage integration
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Real-time preview before upload
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Automatic old image cleanup
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Upload Requirements:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Supported formats: JPG, PNG, GIF</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Minimum dimensions: 100x100 pixels</li>
                  <li>• Recommended: Square images for best results</li>
                </ul>
              </div>
            </Card>
          </motion.div>

          {/* Profile Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Preview</h2>
              
              {/* User Card Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <UserIcon className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.displayName || 'User Name'
                      }
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center mt-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">4.9 • 127 reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navbar Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">Premium Tours</div>
                  <div className="flex items-center space-x-2">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-transparent hover:border-blue-300"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName || 'User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Card Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Recent Booking</h4>
                      <span className="text-sm text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Magical Cappadocia Adventure • 5 days
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      <span>March 15-20, 2024</span>
                      <MapPinIcon className="w-4 h-4 ml-3 mr-1" />
                      <span>Cappadocia, Turkey</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Your image appears in:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Navigation bar dropdown</li>
                  <li>• Profile page header</li>
                  <li>• Booking confirmations</li>
                  <li>• Review submissions</li>
                  <li>• Admin dashboard (if admin)</li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Profile Image Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CameraIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Upload</h3>
                <p className="text-sm text-gray-600">
                  Simple drag-and-drop or click to upload with instant preview
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Auto Optimization</h3>
                <p className="text-sm text-gray-600">
                  Automatic compression and optimization for fast loading
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
                <p className="text-sm text-gray-600">
                  Firebase Storage ensures your images are safe and accessible
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileDemo;
