import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  FireIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import Button from '../common/Button';

const FirebaseSetupGuide = ({ onClose }) => {
  const steps = [
    {
      step: 1,
      title: 'Open Firebase Console',
      description: 'Go to Firebase Console and select your project',
      action: 'https://console.firebase.google.com/project/tours-52d78',
      buttonText: 'Open Console'
    },
    {
      step: 2,
      title: 'Navigate to Authentication',
      description: 'Click on "Authentication" in the left sidebar',
      icon: '🔐'
    },
    {
      step: 3,
      title: 'Go to Sign-in Method',
      description: 'Click on the "Sign-in method" tab',
      icon: '⚙️'
    },
    {
      step: 4,
      title: 'Enable Email/Password',
      description: 'Find "Email/Password" provider and click "Enable"',
      icon: '📧'
    },
    {
      step: 5,
      title: 'Save Settings',
      description: 'Click "Save" to enable the authentication method',
      icon: '💾'
    },
    {
      step: 6,
      title: 'Refresh This Page',
      description: 'Come back here and try creating the admin account again',
      icon: '🔄'
    }
  ];

  const troubleshooting = [
    {
      issue: 'Can\'t find the project?',
      solution: 'Make sure you\'re logged in with the correct Google account that has access to the Firebase project.'
    },
    {
      issue: 'Authentication tab is missing?',
      solution: 'Ensure you have the proper permissions (Owner or Editor) for this Firebase project.'
    },
    {
      issue: 'Still getting errors?',
      solution: 'Check the browser console (F12) for detailed error messages and contact support.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FireIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">
                  Firebase Setup Required
                </h3>
                <p className="text-sm text-red-600">
                  Authentication needs to be enabled in Firebase Console
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Authentication Not Enabled
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Firebase Authentication is not enabled for this project. Follow the steps below to enable it.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Setup Steps:
            </h4>
            
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {step.step}
                  </span>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">
                    {step.title}
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                  {step.action && (
                    <div className="mt-2">
                      <a
                        href={step.action}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        {step.buttonText}
                        <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
                {step.icon && (
                  <div className="text-2xl">
                    {step.icon}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Troubleshooting */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Troubleshooting:
            </h4>
            
            <div className="space-y-3">
              {troubleshooting.map((item, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h5 className="text-sm font-medium text-blue-800">
                    {item.issue}
                  </h5>
                  <p className="text-sm text-blue-700 mt-1">
                    {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            After setup, refresh this page and try again
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="small"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              size="small"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FirebaseSetupGuide;
