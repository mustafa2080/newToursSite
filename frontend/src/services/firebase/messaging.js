import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../../config/firebase';

// Initialize Firebase Messaging with error handling
let messaging;
try {
  messaging = getMessaging(app);
  console.log('✅ Firebase Messaging initialized');
} catch (error) {
  console.error('❌ Firebase Messaging initialization failed:', error);
  messaging = null;
}

// Vapid key for web push notifications (you'll need to generate this in Firebase Console)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BKxvxhk6f0JlJpwIhivAxKNKFAXjPZ_gqSWzVb7aGWXzgEjVrtIl9CqwGAuLTfnpGjEKR1rX4Hi6RkjfLKdOeQE';

class NotificationService {
  constructor() {
    this.token = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Request notification permission
  async requestPermission() {
    try {
      if (!this.isSupported) {
        console.warn('Notifications not supported in this browser');
        return false;
      }

      // Check current permission
      if (Notification.permission === 'granted') {
        console.log('✅ Notification permission already granted');
        return true;
      }

      if (Notification.permission === 'denied') {
        console.log('❌ Notification permission denied by user');
        return false;
      }

      // Only request permission if it's default (not asked yet)
      if (Notification.permission === 'default') {
        console.log('🔔 Requesting notification permission...');
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
          return true;
        } else {
          console.log('❌ Notification permission denied');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get FCM token
  async getToken() {
    try {
      if (!this.isSupported) {
        throw new Error('Notifications not supported');
      }

      if (!messaging) {
        throw new Error('Firebase Messaging not initialized');
      }

      const permission = await this.requestPermission();
      if (!permission) {
        throw new Error('Notification permission not granted');
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        console.log('FCM Token:', token);
        this.token = token;
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Listen for foreground messages
  onMessage(callback) {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return () => {};
    }

    if (!messaging) {
      console.warn('Firebase Messaging not initialized');
      return () => {};
    }

    return onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show browser notification
      this.showNotification(payload);
      
      // Call callback with payload
      if (callback) {
        callback(payload);
      }
    });
  }

  // Show browser notification
  showNotification(payload) {
    const { notification, data } = payload;
    
    if (!notification) return;

    const notificationTitle = notification.title || 'New Notification';
    const notificationOptions = {
      body: notification.body || '',
      icon: notification.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: data?.type || 'general',
      data: data || {},
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(notificationTitle, notificationOptions);
      });
    } else {
      new Notification(notificationTitle, notificationOptions);
    }
  }

  // Send token to server
  async saveTokenToServer(token, userId) {
    try {
      // Here you would send the token to your backend
      // For now, we'll store it in localStorage
      const tokens = JSON.parse(localStorage.getItem('fcm_tokens') || '[]');
      const tokenData = {
        token,
        userId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      // Remove old tokens for this user
      const filteredTokens = tokens.filter(t => t.userId !== userId);
      filteredTokens.push(tokenData);
      
      localStorage.setItem('fcm_tokens', JSON.stringify(filteredTokens));
      console.log('Token saved to server');
      
      return true;
    } catch (error) {
      console.error('Error saving token to server:', error);
      return false;
    }
  }

  // Initialize notifications for admin
  async initializeForAdmin(userId) {
    try {
      const token = await this.getToken();
      if (token) {
        await this.saveTokenToServer(token, userId);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
