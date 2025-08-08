import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationsContext';
import Button from '../common/Button';
import Card from '../common/Card';

const NotificationsTab = () => {
  const {
    notifications,
    toastNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    removeToastNotification
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Combine all notifications
  const allNotifications = [
    ...toastNotifications.map(n => ({ ...n, isPersistent: false })),
    ...notifications.map(n => ({ ...n, isPersistent: true }))
  ].sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

  // Filter notifications
  const filteredNotifications = allNotifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <ShoppingCartIcon className="h-6 w-6 text-blue-600" />;
      case 'favorite':
        return <HeartIcon className="h-6 w-6 text-pink-600" />;
      case 'success':
        return <CheckIcon className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'user':
        return <UserIcon className="h-6 w-6 text-purple-600" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return 'border-l-blue-500';
      case 'favorite':
        return 'border-l-pink-500';
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'user':
        return 'border-l-purple-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const handleMarkAsRead = (notification) => {
    if (notification.isPersistent) {
      markAsRead(notification.id);
    } else {
      removeToastNotification(notification.id);
    }
  };

  const handleDelete = (notification) => {
    if (notification.isPersistent) {
      deleteNotification(notification.id);
    } else {
      removeToastNotification(notification.id);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BellIcon className="h-7 w-7 mr-3 text-blue-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            Stay updated with your bookings, favorites, and account activity
          </p>
        </div>
        
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              icon={<CheckIcon className="h-4 w-4" />}
            >
              Mark All Read
            </Button>
          )}
          {allNotifications.length > 0 && (
            <Button
              onClick={clearAllNotifications}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
              icon={<TrashIcon className="h-4 w-4" />}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All', count: allNotifications.length },
          { key: 'unread', label: 'Unread', count: allNotifications.filter(n => !n.read).length },
          { key: 'read', label: 'Read', count: allNotifications.filter(n => n.read).length }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === filterOption.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filterOption.label}
            {filterOption.count > 0 && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {filterOption.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' 
                ? 'No notifications yet'
                : filter === 'unread'
                ? 'No unread notifications'
                : 'No read notifications'
              }
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "We'll notify you when something important happens!"
                : filter === 'unread'
                ? 'All caught up! Check back later for new updates.'
                : 'Read notifications will appear here.'
              }
            </p>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'bg-blue-50' : 'bg-white'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-700 mb-2">
                            {notification.message || notification.body}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(notification.timestamp || notification.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          
                          <div className="flex space-x-1">
                            {!notification.read && (
                              <Button
                                onClick={() => handleMarkAsRead(notification)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                icon={<CheckIcon className="h-4 w-4" />}
                                title="Mark as read"
                              />
                            )}
                            
                            <Button
                              onClick={() => handleDelete(notification)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              icon={<XMarkIcon className="h-4 w-4" />}
                              title="Delete notification"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {notification.action && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            {notification.action.label}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Cog6ToothIcon className="h-5 w-5 mr-2" />
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Booking Notifications</h4>
              <p className="text-sm text-gray-600">Get notified about booking confirmations and updates</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Favorite Notifications</h4>
              <p className="text-sm text-gray-600">Get notified when items are added to your wishlist</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">System Notifications</h4>
              <p className="text-sm text-gray-600">Get notified about account and system updates</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationsTab;
