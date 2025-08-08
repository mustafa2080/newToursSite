import { onSnapshot, collection, query, where, orderBy, limit, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

class RealTimeNotificationService {
  constructor() {
    this.listeners = new Map();
    this.notifications = [];
    this.callbacks = new Set();
  }

  // Subscribe to notifications for a user
  subscribeToNotifications(userId, callback) {
    if (!userId) return () => {};

    console.log('🔔 Setting up real-time notifications for user:', userId);

    // Create query for user notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      
      snapshot.docChanges().forEach((change) => {
        const notification = {
          id: change.doc.id,
          ...change.doc.data(),
          createdAt: change.doc.data().createdAt?.toDate() || new Date()
        };

        if (change.type === 'added') {
          console.log('🔔 New notification:', notification);
          notifications.push(notification);
          
          // Show toast for new notifications
          if (callback) {
            callback({
              type: 'new',
              notification
            });
          }
        } else if (change.type === 'modified') {
          console.log('🔔 Updated notification:', notification);
          if (callback) {
            callback({
              type: 'updated',
              notification
            });
          }
        }
      });

      // Update local notifications list
      this.notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    }, (error) => {
      console.error('❌ Error listening to notifications:', error);
    });

    // Store listener for cleanup
    this.listeners.set(userId, unsubscribe);
    
    return unsubscribe;
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(userId) {
    const unsubscribe = this.listeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(userId);
      console.log('🔔 Unsubscribed from notifications for user:', userId);
    }
  }

  // Create a new notification
  async createNotification(notificationData) {
    try {
      console.log('🔔 Creating notification:', notificationData);
      
      const notification = {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false,
        id: Date.now().toString() // Temporary ID
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      
      console.log('✅ Notification created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Create booking notification
  async createBookingNotification(userId, bookingData) {
    return this.createNotification({
      userId,
      type: 'booking',
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for "${bookingData.tripTitle || bookingData.hotelName}" has been confirmed. Check your email for details.`,
      data: {
        bookingId: bookingData.id,
        type: bookingData.tripId ? 'trip' : 'hotel',
        itemId: bookingData.tripId || bookingData.hotelId
      },
      action: {
        label: 'View Booking',
        url: '/profile?tab=bookings'
      }
    });
  }

  // Create favorite notification
  async createFavoriteNotification(userId, itemData) {
    return this.createNotification({
      userId,
      type: 'favorite',
      title: 'Added to Favorites! ❤️',
      message: `"${itemData.title || itemData.name}" has been added to your wishlist. View it anytime!`,
      data: {
        itemId: itemData.id,
        type: itemData.type
      },
      action: {
        label: 'View Wishlist',
        url: '/wishlist'
      }
    });
  }

  // Create welcome notification
  async createWelcomeNotification(userId, userName) {
    return this.createNotification({
      userId,
      type: 'success',
      title: 'Welcome to Tours! 🌟',
      message: `Hi ${userName}! Your account has been created successfully. Discover amazing destinations and book your dream vacation with us.`,
      data: {
        type: 'welcome'
      },
      action: {
        label: 'Explore Trips',
        url: '/trips'
      }
    });
  }

  // Create system notification
  async createSystemNotification(userId, title, message, type = 'info') {
    return this.createNotification({
      userId,
      type,
      title,
      message,
      data: {
        type: 'system'
      }
    });
  }

  // Create profile update notification
  async createProfileUpdateNotification(userId) {
    return this.createNotification({
      userId,
      type: 'success',
      title: 'Profile Updated! ✅',
      message: 'Your profile information has been updated successfully.',
      data: {
        type: 'profile'
      },
      action: {
        label: 'View Profile',
        url: '/profile'
      }
    });
  }

  // Create password change notification
  async createPasswordChangeNotification(userId) {
    return this.createNotification({
      userId,
      type: 'success',
      title: 'Password Changed! 🔒',
      message: 'Your password has been changed successfully. Your account is now more secure.',
      data: {
        type: 'security'
      }
    });
  }

  // Create booking cancellation notification
  async createBookingCancellationNotification(userId, bookingData) {
    return this.createNotification({
      userId,
      type: 'warning',
      title: 'Booking Cancelled ⚠️',
      message: `Your booking for "${bookingData.tripTitle || bookingData.hotelName}" has been cancelled. Refund will be processed within 3-5 business days.`,
      data: {
        bookingId: bookingData.id,
        type: 'cancellation'
      },
      action: {
        label: 'View Details',
        url: '/profile?tab=bookings'
      }
    });
  }

  // Cleanup all listeners
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    this.notifications = [];
    console.log('🔔 Notification service cleaned up');
  }
}

export const notificationService = new RealTimeNotificationService();
export default notificationService;
