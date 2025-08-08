import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  StarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationsContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const NotificationsManagement = () => {
  const {
    notifications,
    unreadCount,
    isPermissionGranted,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    simulateBookingNotification,
    simulatePaymentNotification,
    simulateReviewNotification,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all, unread, read

  const handleRequestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        // Reload the page to reinitialize notifications
        window.location.reload();
      } else {
        console.log('❌ Notification permission denied');
        alert('Notification permission denied. Please enable notifications in your browser settings.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert('Error requesting notification permission. Please try again.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <CalendarDaysIcon className="h-6 w-6 text-blue-600" />;
      case 'payment':
        return <CreditCardIcon className="h-6 w-6 text-green-600" />;
      case 'review':
        return <StarIcon className="h-6 w-6 text-yellow-600" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return 'border-l-blue-500 bg-blue-50';
      case 'payment':
        return 'border-l-green-500 bg-green-50';
      case 'review':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
          <p className="text-gray-600">Manage and monitor system notifications</p>
        </div>
        <div className="flex space-x-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="flex items-center"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllNotifications}
              className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Notifications', 
            value: notifications.length, 
            color: 'blue',
            icon: BellIcon 
          },
          { 
            label: 'Unread', 
            value: unreadCount, 
            color: 'red',
            icon: ExclamationTriangleIcon 
          },
          { 
            label: 'Booking Alerts', 
            value: notifications.filter(n => n.type === 'booking').length, 
            color: 'blue',
            icon: CalendarDaysIcon 
          },
          { 
            label: 'Payment Alerts', 
            value: notifications.filter(n => n.type === 'payment').length, 
            color: 'green',
            icon: CreditCardIcon 
          },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <IconComponent className={`h-8 w-8 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                  <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Notification Permission */}
      {!isPermissionGranted && (
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-4" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Enable Notifications</h3>
              <p className="text-yellow-700 mb-4">
                To receive real-time notifications, please enable browser notifications.
              </p>
              <Button
                onClick={handleRequestPermission}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <BellIcon className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Demo Notification Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Notifications</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={simulateBookingNotification}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            Simulate Booking
          </Button>
          <Button
            onClick={simulatePaymentNotification}
            className="bg-green-600 hover:bg-green-700"
          >
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Simulate Payment
          </Button>
          <Button
            onClick={simulateReviewNotification}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <StarIcon className="h-4 w-4 mr-2" />
            Simulate Review
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex space-x-4">
        {['all', 'unread', 'read'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            {filterOption === 'unread' && unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p>
              {filter === 'all' 
                ? 'No notifications yet. Test the notification system using the buttons above.'
                : `No ${filter} notifications found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  p-6 border-l-4 transition-colors
                  ${getNotificationColor(notification.type)}
                  ${!notification.read ? 'bg-blue-50' : 'bg-white'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-lg font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{notification.body}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${notification.type === 'booking' ? 'bg-blue-100 text-blue-800' : ''}
                          ${notification.type === 'payment' ? 'bg-green-100 text-green-800' : ''}
                          ${notification.type === 'review' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${notification.type === 'general' ? 'bg-gray-100 text-gray-800' : ''}
                        `}>
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                        title="Mark as read"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                      title="Delete notification"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsManagement;
