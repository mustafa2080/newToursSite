import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Toast = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 5000,
  position = 'top-right' 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4 sm:left-6';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4 sm:right-6';
      case 'bottom-left':
        return 'bottom-4 left-4 sm:left-6';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4 sm:right-6';
      default:
        return 'top-4 right-4 sm:right-6';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed z-50 ${getPositionClasses()}`}
        >
          <div className={`
            max-w-sm sm:max-w-md lg:max-w-lg w-full mx-4 sm:mx-0 shadow-lg rounded-lg border p-4
            ${getBackgroundColor()}
          `}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className={`text-sm font-medium ${getTextColor()} break-words leading-relaxed`}>
                  {message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={onClose}
                  className={`
                    inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${type === 'success' ? 'text-green-400 hover:text-green-600 focus:ring-green-500' : ''}
                    ${type === 'error' ? 'text-red-400 hover:text-red-600 focus:ring-red-500' : ''}
                    ${type === 'warning' ? 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500' : ''}
                    ${type === 'info' ? 'text-blue-400 hover:text-blue-600 focus:ring-blue-500' : ''}
                  `}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            {duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`
                  mt-2 h-1 rounded-full
                  ${type === 'success' ? 'bg-green-300' : ''}
                  ${type === 'error' ? 'bg-red-300' : ''}
                  ${type === 'warning' ? 'bg-yellow-300' : ''}
                  ${type === 'info' ? 'bg-blue-300' : ''}
                `}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
