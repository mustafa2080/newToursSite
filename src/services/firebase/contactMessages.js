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
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const COLLECTION_NAME = 'contact_messages';

/**
 * Contact Messages Service
 * Handles contact form submissions and admin notifications
 */
export const contactMessagesService = {
  
  /**
   * Submit a new contact message
   * @param {Object} messageData - Contact form data
   * @returns {Promise<Object>} - Submission result
   */
  submitMessage: async (messageData) => {
    try {
      console.log('📤 Submitting contact message:', messageData);
      
      // Validate required fields
      const requiredFields = ['name', 'email', 'message'];
      for (const field of requiredFields) {
        if (!messageData[field] || messageData[field].trim() === '') {
          throw new Error(`${field} is required`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(messageData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Prepare message document
      const messageDoc = {
        name: messageData.name.trim(),
        email: messageData.email.trim().toLowerCase(),
        phone: messageData.phone?.trim() || '',
        subject: messageData.subject?.trim() || 'General Inquiry',
        message: messageData.message.trim(),
        status: 'unread',
        priority: 'normal',
        source: 'website_contact_form',
        ip_address: null, // Could be added if needed
        user_agent: navigator.userAgent,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        admin_notes: '',
        replied_at: null,
        replied_by: null
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, COLLECTION_NAME), messageDoc);
      
      console.log('✅ Contact message submitted successfully:', docRef.id);
      
      // Create notification for admin
      await createAdminNotification({
        type: 'new_contact_message',
        title: 'New Contact Message',
        message: `New message from ${messageData.name} (${messageData.email})`,
        data: {
          messageId: docRef.id,
          senderName: messageData.name,
          senderEmail: messageData.email,
          subject: messageDoc.subject
        }
      });

      return {
        success: true,
        messageId: docRef.id,
        message: 'Your message has been sent successfully! We will get back to you soon.'
      };
    } catch (error) {
      console.error('❌ Error submitting contact message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get all contact messages for admin
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - Messages data
   */
  getAllMessages: async (filters = {}) => {
    try {
      console.log('📂 Loading contact messages...');
      
      let q = collection(db, COLLECTION_NAME);
      
      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      
      // Order by creation date (newest first)
      q = query(q, orderBy('created_at', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const messages = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || new Date(),
          updated_at: data.updated_at?.toDate?.() || new Date(),
          replied_at: data.replied_at?.toDate?.() || null
        });
      });

      console.log(`✅ Loaded ${messages.length} contact messages`);
      return {
        success: true,
        data: messages,
        stats: {
          total: messages.length,
          unread: messages.filter(m => m.status === 'unread').length,
          replied: messages.filter(m => m.status === 'replied').length,
          archived: messages.filter(m => m.status === 'archived').length
        }
      };
    } catch (error) {
      console.error('❌ Error loading contact messages:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  /**
   * Update message status
   * @param {string} messageId - Message ID
   * @param {string} status - New status (unread, read, replied, archived)
   * @param {Object} additionalData - Additional data to update
   * @returns {Promise<Object>} - Update result
   */
  updateMessageStatus: async (messageId, status, additionalData = {}) => {
    try {
      console.log(`📝 Updating message ${messageId} status to: ${status}`);
      
      const messageRef = doc(db, COLLECTION_NAME, messageId);
      const updateData = {
        status,
        updated_at: serverTimestamp(),
        ...additionalData
      };

      // Add replied timestamp if status is replied
      if (status === 'replied') {
        updateData.replied_at = serverTimestamp();
      }

      await updateDoc(messageRef, updateData);
      
      console.log('✅ Message status updated successfully');
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error updating message status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Delete a contact message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} - Delete result
   */
  deleteMessage: async (messageId) => {
    try {
      console.log(`🗑️ Deleting message ${messageId}...`);
      
      await deleteDoc(doc(db, COLLECTION_NAME, messageId));
      
      console.log('✅ Message deleted successfully');
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Listen to new messages in real-time
   * @param {Function} callback - Callback function for new messages
   * @returns {Function} - Unsubscribe function
   */
  listenToNewMessages: (callback) => {
    console.log('👂 Setting up real-time listener for new messages...');
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'unread'),
      orderBy('created_at', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          newMessages.push({
            id: change.doc.id,
            ...data,
            created_at: data.created_at?.toDate?.() || new Date()
          });
        }
      });

      if (newMessages.length > 0) {
        console.log(`🔔 ${newMessages.length} new message(s) received`);
        callback(newMessages);
      }
    });
  }
};

/**
 * Create admin notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<void>}
 */
const createAdminNotification = async (notificationData) => {
  try {
    const notificationDoc = {
      ...notificationData,
      read: false,
      created_at: serverTimestamp(),
      expires_at: null // Notifications don't expire by default
    };

    await addDoc(collection(db, 'admin_notifications'), notificationDoc);
    console.log('🔔 Admin notification created');
  } catch (error) {
    console.error('❌ Error creating admin notification:', error);
  }
};

export default contactMessagesService;
