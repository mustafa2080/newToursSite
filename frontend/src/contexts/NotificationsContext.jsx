import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/firebase/messaging';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);

  // Initialize notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications();
    }
  }, [isAuthenticated, user]);

  // Load notifications from localStorage
  useEffect(() => {
    loadNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Only initialize for admin users and don't auto-request permission
      if (user?.email?.includes('admin') || user?.role === 'admin') {
        console.log('🔔 Admin user detected, notifications available');

        // Check if permission is already granted
        if (Notification.permission === 'granted') {
          const token = await notificationService.initializeForAdmin(user.uid);
          if (token) {
            setFcmToken(token);
            setIsPermissionGranted(true);
            console.log('✅ Notifications initialized for admin');
          }
        } else {
          console.log('⚠️ Notification permission not granted yet');
          setIsPermissionGranted(false);
        }
      }

      // Listen for foreground messages (only if permission granted)
      if (Notification.permission === 'granted') {
        const unsubscribe = notificationService.onMessage((payload) => {
          handleNewNotification(payload);
        });
        return unsubscribe;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      // Continue without FCM - local notifications will still work
    }
  };

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem('admin_notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = (newNotifications) => {
    try {
      localStorage.setItem('admin_notifications', JSON.stringify(newNotifications));
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const handleNewNotification = (payload) => {
    const newNotification = {
      id: Date.now().toString(),
      title: payload.notification?.title || 'New Notification',
      body: payload.notification?.body || '',
      type: payload.data?.type || 'general',
      data: payload.data || {},
      timestamp: new Date().toISOString(),
      read: false
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // Keep only last 50
    saveNotifications(updatedNotifications);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50);
    saveNotifications(updatedNotifications);
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  // Simulate admin notifications for demo
  const simulateBookingNotification = () => {
    addNotification({
      title: 'New Booking Received',
      body: 'A new trip booking has been submitted and requires approval.',
      type: 'booking',
      data: { bookingId: 'BK' + Date.now(), action: 'view_booking' }
    });
  };

  const simulatePaymentNotification = () => {
    addNotification({
      title: 'Payment Received',
      body: 'Payment of $599 has been received for booking BK001.',
      type: 'payment',
      data: { bookingId: 'BK001', amount: 599 }
    });
  };

  const simulateReviewNotification = () => {
    addNotification({
      title: 'New Review Posted',
      body: 'A customer has posted a 5-star review for Mountain Hiking Expedition.',
      type: 'review',
      data: { tripId: '2', rating: 5 }
    });
  };

  const value = {
    notifications,
    unreadCount,
    isPermissionGranted,
    fcmToken,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    // Demo functions
    simulateBookingNotification,
    simulatePaymentNotification,
    simulateReviewNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
