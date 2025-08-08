import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/firebase/messaging';
import { notificationService as realtimeNotificationService } from '../services/notificationService';

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
  const [toastNotifications, setToastNotifications] = useState([]);

  // Initialize notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications();
      setupRealtimeNotifications();
    } else {
      // Cleanup when user logs out
      realtimeNotificationService.cleanup();
      setToastNotifications([]);
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

  // Setup real-time notifications
  const setupRealtimeNotifications = () => {
    if (!user?.uid) return;

    console.log('🔔 Setting up real-time notifications for user:', user.uid);

    const unsubscribe = realtimeNotificationService.subscribeToNotifications(
      user.uid,
      (event) => {
        if (event.type === 'new') {
          // Add to toast notifications
          const toastNotification = {
            id: event.notification.id,
            type: event.notification.type || 'info',
            title: event.notification.title,
            message: event.notification.message,
            timestamp: Date.now(),
            autoDismiss: true,
            duration: 5000,
            action: event.notification.action
          };

          setToastNotifications(prev => [toastNotification, ...prev.slice(0, 4)]);

          // Auto remove after duration
          setTimeout(() => {
            removeToastNotification(toastNotification.id);
          }, toastNotification.duration);

          // Update unread count (count both toast and persistent notifications)
          setUnreadCount(prev => prev + 1);
        }
      }
    );

    return unsubscribe;
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

  // Toast notification functions
  const removeToastNotification = (id) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markToastAsRead = async (id) => {
    try {
      await realtimeNotificationService.markAsRead(id);
      removeToastNotification(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Calculate total unread count from all sources
  const getTotalUnreadCount = () => {
    const toastUnread = toastNotifications.filter(n => !n.read).length;
    const persistentUnread = notifications.filter(n => !n.read).length;
    return toastUnread + persistentUnread;
  };

  // Create notification functions
  const createBookingNotification = async (bookingData) => {
    if (!user?.uid) return;
    return realtimeNotificationService.createBookingNotification(user.uid, bookingData);
  };

  const createFavoriteNotification = async (itemData) => {
    if (!user?.uid) return;
    return realtimeNotificationService.createFavoriteNotification(user.uid, itemData);
  };

  const createWelcomeNotification = async () => {
    if (!user?.uid) return;
    return realtimeNotificationService.createWelcomeNotification(user.uid, user.displayName || user.email);
  };

  const createProfileUpdateNotification = async () => {
    if (!user?.uid) return;
    return realtimeNotificationService.createProfileUpdateNotification(user.uid);
  };

  const createPasswordChangeNotification = async () => {
    if (!user?.uid) return;
    return realtimeNotificationService.createPasswordChangeNotification(user.uid);
  };

  const createBookingCancellationNotification = async (bookingData) => {
    if (!user?.uid) return;
    return realtimeNotificationService.createBookingCancellationNotification(user.uid, bookingData);
  };

  const showToastNotification = (notification) => {
    const toastNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: Date.now(),
      autoDismiss: notification.autoDismiss !== false,
      duration: notification.duration || 5000
    };

    setToastNotifications(prev => [toastNotification, ...prev.slice(0, 4)]);

    if (toastNotification.autoDismiss) {
      setTimeout(() => {
        removeToastNotification(toastNotification.id);
      }, toastNotification.duration);
    }
  };



  const value = {
    notifications,
    unreadCount: getTotalUnreadCount(), // Use calculated total
    isPermissionGranted,
    fcmToken,
    toastNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    // Real-time notification functions
    removeToastNotification,
    markToastAsRead,
    createBookingNotification,
    createFavoriteNotification,
    createWelcomeNotification,
    createProfileUpdateNotification,
    createPasswordChangeNotification,
    createBookingCancellationNotification,
    showToastNotification,
    getTotalUnreadCount
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
