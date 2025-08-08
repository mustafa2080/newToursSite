import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  BellIcon,
  HeartIcon,
  ShoppingCartIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const NotificationToast = ({ notifications, onRemove, onMarkAsRead }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'booking':
        return <ShoppingCartIcon className="h-6 w-6 text-blue-500" />;
      case 'favorite':
        return <HeartIcon className="h-6 w-6 text-pink-500" />;
      case 'user':
        return <UserIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'booking':
        return 'bg-blue-50 border-blue-200';
      case 'favorite':
        return 'bg-pink-50 border-pink-200';
      case 'user':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
              relative p-4 rounded-lg border shadow-lg backdrop-blur-sm
              ${getBackgroundColor(notification.type)}
              hover:shadow-xl transition-shadow duration-200
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {notification.message}
                </p>
                
                {notification.action && (
                  <button
                    onClick={() => {
                      notification.action.onClick();
                      onMarkAsRead(notification.id);
                    }}
                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {notification.action.label}
                  </button>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            {notification.autoDismiss && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: notification.duration || 5, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
