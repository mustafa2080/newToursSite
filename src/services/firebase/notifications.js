import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  onSnapshot,
  limit 
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const COLLECTION_NAME = 'admin_notifications';

/**
 * Notifications Service
 * Handles admin notifications and real-time updates
 */
export const notificationsService = {
  
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} - Creation result
   */
  createNotification: async (notificationData) => {
    try {
      console.log('🔔 Creating notification:', notificationData);
      
      const notificationDoc = {
        type: notificationData.type || 'info',
        title: notificationData.title || 'Notification',
        message: notificationData.message || '',
        data: notificationData.data || {},
        read: false,
        priority: notificationData.priority || 'normal',
        category: notificationData.category || 'general',
        created_at: serverTimestamp(),
        expires_at: notificationData.expires_at || null,
        action_url: notificationData.action_url || null,
        icon: notificationData.icon || null
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), notificationDoc);
      
      console.log('✅ Notification created successfully:', docRef.id);
      return {
        success: true,
        notificationId: docRef.id
      };
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get all notifications
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Notifications data
   */
  getAllNotifications: async (options = {}) => {
    try {
      console.log('📂 Loading notifications...');
      
      let q = collection(db, COLLECTION_NAME);
      
      // Apply filters
      if (options.unreadOnly) {
        q = query(q, where('read', '==', false));
      }
      
      if (options.type) {
        q = query(q, where('type', '==', options.type));
      }
      
      if (options.category) {
        q = query(q, where('category', '==', options.category));
      }
      
      // Order by creation date (newest first)
      q = query(q, orderBy('created_at', 'desc'));
      
      // Limit results if specified
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const notifications = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || new Date(),
          expires_at: data.expires_at?.toDate?.() || null
        });
      });

      console.log(`✅ Loaded ${notifications.length} notifications`);
      return {
        success: true,
        data: notifications,
        stats: {
          total: notifications.length,
          unread: notifications.filter(n => !n.read).length,
          read: notifications.filter(n => n.read).length
        }
      };
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Update result
   */
  markAsRead: async (notificationId) => {
    try {
      console.log(`📖 Marking notification ${notificationId} as read`);
      
      const notificationRef = doc(db, COLLECTION_NAME, notificationId);
      await updateDoc(notificationRef, {
        read: true,
        read_at: serverTimestamp()
      });
      
      console.log('✅ Notification marked as read');
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} - Update result
   */
  markAllAsRead: async () => {
    try {
      console.log('📖 Marking all notifications as read...');
      
      const q = query(
        collection(db, COLLECTION_NAME),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const batch = [];
      
      querySnapshot.forEach((doc) => {
        batch.push(
          updateDoc(doc.ref, {
            read: true,
            read_at: serverTimestamp()
          })
        );
      });
      
      await Promise.all(batch);
      
      console.log(`✅ Marked ${batch.length} notifications as read`);
      return {
        success: true,
        count: batch.length
      };
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Delete result
   */
  deleteNotification: async (notificationId) => {
    try {
      console.log(`🗑️ Deleting notification ${notificationId}...`);
      
      await deleteDoc(doc(db, COLLECTION_NAME, notificationId));
      
      console.log('✅ Notification deleted successfully');
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Listen to new notifications in real-time
   * @param {Function} callback - Callback function for new notifications
   * @returns {Function} - Unsubscribe function
   */
  listenToNotifications: (callback) => {
    console.log('👂 Setting up real-time listener for notifications...');
    
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('created_at', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      let hasNewNotifications = false;
      
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const notification = {
          id: change.doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || new Date(),
          expires_at: data.expires_at?.toDate?.() || null
        };
        
        if (change.type === 'added') {
          hasNewNotifications = true;
        }
        
        notifications.push(notification);
      });

      // Get all notifications for the callback
      snapshot.forEach((doc) => {
        const data = doc.data();
        const notification = {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || new Date(),
          expires_at: data.expires_at?.toDate?.() || null
        };
        
        if (!notifications.find(n => n.id === notification.id)) {
          notifications.push(notification);
        }
      });

      // Sort by creation date (newest first)
      notifications.sort((a, b) => b.created_at - a.created_at);

      console.log(`🔔 Notifications updated: ${notifications.length} total`);
      callback(notifications, hasNewNotifications);
    });
  },

  /**
   * Get unread notifications count
   * @returns {Promise<number>} - Unread count
   */
  getUnreadCount: async () => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }
};

export default notificationsService;
