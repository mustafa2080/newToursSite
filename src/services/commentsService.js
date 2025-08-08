import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Comments Service - Direct Firebase integration
 */
class CommentsService {
  constructor() {
    this.commentsCollection = 'comments';
    this.likesCollection = 'comment_likes';
  }

  /**
   * Get comments for a specific item (trip or hotel)
   */
  async getCommentsByItem(itemType, itemId) {
    try {
      console.log(`📋 Fetching comments for ${itemType} ${itemId}`);
      
      const commentsRef = collection(db, this.commentsCollection);
      const q = query(
        commentsRef,
        where('item_type', '==', itemType),
        where('item_id', '==', itemId),
        where('status', '==', 'approved'),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      const comments = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || new Date(data.created_at),
          updated_at: data.updated_at?.toDate?.() || new Date(data.updated_at)
        });
      });

      console.log(`✅ Found ${comments.length} comments for ${itemType} ${itemId}`);
      return comments;
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Create a new comment
   */
  async createComment(commentData) {
    try {
      const {
        item_type,
        item_id,
        content,
        user_name,
        user_email,
        user_id
      } = commentData;

      // Validation
      if (!item_type || !item_id || !content) {
        throw new Error('Missing required fields: item_type, item_id, content');
      }

      if (content.trim().length < 3) {
        throw new Error('Comment must be at least 3 characters long');
      }

      console.log(`💬 Creating comment for ${item_type} ${item_id} by ${user_name || 'Anonymous'}`);

      const newComment = {
        item_type,
        item_id,
        content: content.trim(),
        user_name: user_name || 'Anonymous User',
        user_email: user_email || '',
        user_id: user_id || null,
        status: 'approved', // Auto-approve for now
        likes_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const commentsRef = collection(db, this.commentsCollection);
      const docRef = await addDoc(commentsRef, newComment);

      console.log(`✅ Comment created with ID: ${docRef.id}`);

      // Return the comment with the generated ID
      return {
        id: docRef.id,
        ...newComment,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      console.error('❌ Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId, updateData) {
    try {
      const { content } = updateData;

      if (!content || content.trim().length < 3) {
        throw new Error('Comment must be at least 3 characters long');
      }

      console.log(`✏️ Updating comment ${commentId}`);

      const commentRef = doc(db, this.commentsCollection, commentId);
      await updateDoc(commentRef, {
        content: content.trim(),
        updated_at: serverTimestamp()
      });

      console.log(`✅ Comment ${commentId} updated successfully`);
      return true;
    } catch (error) {
      console.error('❌ Error updating comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    try {
      console.log(`🗑️ Deleting comment ${commentId}`);

      const commentRef = doc(db, this.commentsCollection, commentId);
      await deleteDoc(commentRef);

      console.log(`✅ Comment ${commentId} deleted successfully`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  }

  /**
   * Toggle like on a comment
   */
  async toggleLike(commentId, userId = 'anonymous') {
    try {
      console.log(`❤️ Toggling like for comment ${commentId} by user ${userId}`);

      // Check if user already liked this comment
      const likesRef = collection(db, this.likesCollection);
      const q = query(
        likesRef,
        where('comment_id', '==', commentId),
        where('user_id', '==', userId)
      );

      const existingLikes = await getDocs(q);
      let userLiked = false;

      if (existingLikes.empty) {
        // Add like
        await addDoc(likesRef, {
          comment_id: commentId,
          user_id: userId,
          created_at: serverTimestamp()
        });
        userLiked = true;
      } else {
        // Remove like
        for (const likeDoc of existingLikes.docs) {
          await deleteDoc(likeDoc.ref);
        }
        userLiked = false;
      }

      // Count total likes for this comment
      const allLikesQuery = query(
        likesRef,
        where('comment_id', '==', commentId)
      );
      const allLikesSnapshot = await getDocs(allLikesQuery);
      const likesCount = allLikesSnapshot.size;

      // Update comment with new likes count
      const commentRef = doc(db, this.commentsCollection, commentId);
      await updateDoc(commentRef, {
        likes_count: likesCount
      });

      console.log(`✅ Comment ${commentId} now has ${likesCount} likes`);

      return {
        likes_count: likesCount,
        user_liked: userLiked
      };
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      throw error;
    }
  }

  /**
   * Get user's like status for a comment
   */
  async getUserLikeStatus(commentId, userId = 'anonymous') {
    try {
      if (!userId || userId === 'anonymous') {
        return false;
      }

      const likesRef = collection(db, this.likesCollection);
      const q = query(
        likesRef,
        where('comment_id', '==', commentId),
        where('user_id', '==', userId)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ Error checking like status:', error);
      return false;
    }
  }

  /**
   * Get all comments (admin function)
   */
  async getAllComments(filters = {}) {
    try {
      const { item_type, status = 'all', limit = 50 } = filters;

      console.log('📋 Fetching all comments with filters:', filters);

      let q = collection(db, this.commentsCollection);
      const constraints = [];

      if (item_type && item_type !== 'all') {
        constraints.push(where('item_type', '==', item_type));
      }

      if (status && status !== 'all') {
        constraints.push(where('status', '==', status));
      }

      constraints.push(orderBy('created_at', 'desc'));

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      const comments = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || new Date(data.created_at),
          updated_at: data.updated_at?.toDate?.() || new Date(data.updated_at)
        });
      });

      console.log(`✅ Found ${comments.length} comments`);
      return comments.slice(0, limit);
    } catch (error) {
      console.error('❌ Error fetching all comments:', error);
      throw error;
    }
  }

  /**
   * Get comments statistics
   */
  async getCommentsStats() {
    try {
      console.log('📊 Fetching comments statistics...');

      const commentsRef = collection(db, this.commentsCollection);
      const snapshot = await getDocs(commentsRef);

      const stats = {
        total: snapshot.size,
        by_type: {},
        by_status: {},
        recent: 0
      };

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Count by type
        stats.by_type[data.item_type] = (stats.by_type[data.item_type] || 0) + 1;
        
        // Count by status
        stats.by_status[data.status] = (stats.by_status[data.status] || 0) + 1;
        
        // Count recent comments
        const createdAt = data.created_at?.toDate?.() || new Date(data.created_at);
        if (createdAt > oneDayAgo) {
          stats.recent++;
        }
      });

      console.log('✅ Comments statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching comments statistics:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const commentsService = new CommentsService();
export default commentsService;
