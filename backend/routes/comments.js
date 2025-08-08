const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firestore
const db = admin.firestore();

// Get comments for a specific item (trip or hotel)
router.get('/:itemType/:itemId', async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    console.log(`📋 Fetching comments for ${itemType} ${itemId}`);

    const commentsRef = db.collection('comments');
    const query = commentsRef
      .where('item_type', '==', itemType)
      .where('item_id', '==', itemId)
      .where('status', '==', 'approved')
      .orderBy('created_at', 'desc');

    const snapshot = await query.get();
    const comments = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.() || data.created_at,
        updated_at: data.updated_at?.toDate?.() || data.updated_at
      });
    });

    console.log(`✅ Found ${comments.length} comments for ${itemType} ${itemId}`);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
});

// Create new comment
router.post('/', async (req, res) => {
  try {
    const {
      item_type,
      item_id,
      content,
      user_name,
      user_email,
      user_id
    } = req.body;

    // Validation
    if (!item_type || !item_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: item_type, item_id, content'
      });
    }

    if (content.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 3 characters long'
      });
    }

    console.log(`💬 Creating comment for ${item_type} ${item_id} by ${user_name || 'Anonymous'}`);

    const commentData = {
      item_type,
      item_id,
      content: content.trim(),
      user_name: user_name || 'Anonymous User',
      user_email: user_email || '',
      user_id: user_id || null,
      status: 'approved', // Auto-approve for now, can add moderation later
      likes_count: 0,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent') || ''
    };

    const docRef = await db.collection('comments').add(commentData);
    
    // Get the created comment with server timestamp
    const createdDoc = await docRef.get();
    const createdComment = {
      id: createdDoc.id,
      ...createdDoc.data(),
      created_at: createdDoc.data().created_at?.toDate?.() || new Date(),
      updated_at: createdDoc.data().updated_at?.toDate?.() || new Date()
    };

    console.log(`✅ Comment created with ID: ${docRef.id}`);

    // Log this activity
    try {
      await db.collection('system_logs').add({
        level: 'info',
        category: 'comments',
        message: 'New comment posted',
        details: {
          comment_id: docRef.id,
          item_type,
          item_id,
          user_name: user_name || 'Anonymous',
          content_length: content.length
        },
        user_id,
        user_email,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (logError) {
      console.error('Error logging comment creation:', logError);
    }

    res.status(201).json({
      success: true,
      data: createdComment,
      message: 'Comment posted successfully'
    });
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
});

// Update comment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 3 characters long'
      });
    }

    console.log(`✏️ Updating comment ${id}`);

    const commentRef = db.collection('comments').doc(id);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await commentRef.update({
      content: content.trim(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Comment ${id} updated successfully`);

    res.json({
      success: true,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
});

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting comment ${id}`);

    const commentRef = db.collection('comments').doc(id);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await commentRef.delete();

    console.log(`✅ Comment ${id} deleted successfully`);

    // Log this activity
    try {
      const commentData = commentDoc.data();
      await db.collection('system_logs').add({
        level: 'info',
        category: 'comments',
        message: 'Comment deleted',
        details: {
          comment_id: id,
          item_type: commentData.item_type,
          item_id: commentData.item_id,
          user_name: commentData.user_name
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (logError) {
      console.error('Error logging comment deletion:', logError);
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
});

// Like/Unlike comment
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.user_id || req.headers['x-user-id'] || 'anonymous';

    console.log(`❤️ Toggling like for comment ${id} by user ${userId}`);

    const commentRef = db.collection('comments').doc(id);
    const likesRef = db.collection('comment_likes');

    // Check if user already liked this comment
    const existingLike = await likesRef
      .where('comment_id', '==', id)
      .where('user_id', '==', userId)
      .get();

    let userLiked = false;
    let likesCount = 0;

    if (existingLike.empty) {
      // Add like
      await likesRef.add({
        comment_id: id,
        user_id: userId,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      userLiked = true;
    } else {
      // Remove like
      const batch = db.batch();
      existingLike.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      userLiked = false;
    }

    // Count total likes for this comment
    const allLikes = await likesRef.where('comment_id', '==', id).get();
    likesCount = allLikes.size;

    // Update comment with new likes count
    await commentRef.update({
      likes_count: likesCount
    });

    console.log(`✅ Comment ${id} now has ${likesCount} likes`);

    res.json({
      success: true,
      data: {
        likes_count: likesCount,
        user_liked: userLiked
      }
    });
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
});

// Get all comments (admin only)
router.get('/', async (req, res) => {
  try {
    const {
      item_type,
      status = 'all',
      page = 1,
      limit = 50
    } = req.query;

    console.log('📋 Fetching all comments with filters:', { item_type, status, page, limit });

    let query = db.collection('comments');

    if (item_type && item_type !== 'all') {
      query = query.where('item_type', '==', item_type);
    }

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('created_at', 'desc');

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.limit(parseInt(limit)).offset(offset);

    const snapshot = await query.get();
    const comments = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.() || data.created_at,
        updated_at: data.updated_at?.toDate?.() || data.updated_at
      });
    });

    console.log(`✅ Found ${comments.length} comments`);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('❌ Error fetching all comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
});

module.exports = router;
