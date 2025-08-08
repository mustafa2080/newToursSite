import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  CalendarDaysIcon,
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useAuth } from '../../contexts/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    toastNotifications,
    unreadCount,
    removeToastNotification,
    markToastAsRead,
    notifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Combine toast notifications with persistent notifications
  useEffect(() => {
    const combined = [
      ...toastNotifications.map(n => ({ ...n, isPersistent: false })),
      ...notifications.map(n => ({ ...n, isPersistent: true }))
    ].sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
    
    setAllNotifications(combined.slice(0, 20)); // Show last 20 notifications
  }, [toastNotifications, notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <ShoppingCartIcon className="h-5 w-5 text-blue-600" />;
      case 'favorite':
        return <HeartIcon className="h-5 w-5 text-pink-600" />;
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'user':
        return <UserIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return 'border-l-blue-500 bg-blue-50';
      case 'favorite':
        return 'border-l-pink-500 bg-pink-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'user':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (notification.isPersistent) {
      markToastAsRead(notification.id);
    } else {
      removeToastNotification(notification.id);
    }

    // Navigate based on notification type and action
    if (notification.action?.url) {
      navigate(notification.action.url);
    } else {
      // Default navigation based on type
      switch (notification.type) {
        case 'booking':
          navigate('/profile?tab=bookings');
          break;
        case 'favorite':
          navigate('/wishlist');
          break;
        case 'success':
          if (notification.data?.type === 'welcome') {
            navigate('/trips');
          }
          break;
        default:
          // Do nothing for info notifications
          break;
      }
    }

    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Don't show if user is not logged in
  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {allNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm mt-1">We'll notify you when something happens!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {allNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`
                        p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors
                        ${getNotificationColor(notification.type)}
                        ${!notification.read ? 'bg-blue-50' : 'bg-white'}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message || notification.body}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatTime(notification.timestamp || notification.createdAt)}
                            </p>
                            {notification.action && (
                              <span className="text-xs text-blue-600 font-medium">
                                Click to {notification.action.label?.toLowerCase() || 'view'}
                              </span>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {allNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => {
                    navigate('/profile?tab=notifications');
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
