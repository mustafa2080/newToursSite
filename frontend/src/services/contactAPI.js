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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'contact_messages';

export const contactAPI = {
  // Create a new contact message
  create: async (messageData) => {
    try {
      console.log('📧 Creating contact message:', messageData);
      
      const docData = {
        ...messageData,
        status: 'unread',
        priority: 'normal',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminNotes: '',
        assignedTo: null,
        tags: []
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      
      console.log('✅ Contact message created with ID:', docRef.id);
      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...docData }
      };
    } catch (error) {
      console.error('❌ Error creating contact message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get all contact messages
  getAll: async () => {
    try {
      console.log('📧 Fetching all contact messages...');
      
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const messages = [];
      
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Fetched ${messages.length} contact messages`);
      return {
        success: true,
        data: messages
      };
    } catch (error) {
      console.error('❌ Error fetching contact messages:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Get messages by status
  getByStatus: async (status) => {
    try {
      console.log(`📧 Fetching contact messages with status: ${status}`);
      
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const messages = [];
      
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Fetched ${messages.length} messages with status: ${status}`);
      return {
        success: true,
        data: messages
      };
    } catch (error) {
      console.error('❌ Error fetching messages by status:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Update message status
  updateStatus: async (messageId, status, adminNotes = '') => {
    try {
      console.log(`📧 Updating message ${messageId} status to: ${status}`);
      
      const messageRef = doc(db, COLLECTION_NAME, messageId);
      await updateDoc(messageRef, {
        status,
        adminNotes,
        updatedAt: serverTimestamp()
      });

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

  // Delete a message
  delete: async (messageId) => {
    try {
      console.log(`📧 Deleting contact message: ${messageId}`);
      
      await deleteDoc(doc(db, COLLECTION_NAME, messageId));
      
      console.log('✅ Contact message deleted successfully');
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error deleting contact message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get message statistics
  getStats: async () => {
    try {
      console.log('📊 Fetching contact message statistics...');
      
      const allMessages = await getDocs(collection(db, COLLECTION_NAME));
      const stats = {
        total: 0,
        unread: 0,
        read: 0,
        replied: 0,
        archived: 0
      };

      allMessages.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        stats[data.status] = (stats[data.status] || 0) + 1;
      });

      console.log('✅ Contact message stats:', stats);
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error fetching message stats:', error);
      return {
        success: false,
        error: error.message,
        data: { total: 0, unread: 0, read: 0, replied: 0, archived: 0 }
      };
    }
  }
};

export default contactAPI;
