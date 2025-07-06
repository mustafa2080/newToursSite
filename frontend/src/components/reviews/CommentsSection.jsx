import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';

const CommentsSection = ({ 
  itemType, 
  itemId, 
  itemTitle,
  onCommentAdded = () => {},
  className = ''
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (itemType && itemId) {
      fetchComments();
    }
  }, [itemType, itemId]);

  const fetchComments = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const response = await api.get(`/reviews/${itemType}/${itemId}?page=${page}&limit=10`);
      
      if (response.data.success) {
        const newComments = response.data.data.reviews;
        setComments(prev => append ? [...prev, ...newComments] : newComments);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to comment');
      return;
    }

    if (!newComment.trim() || newComment.trim().length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    if (newComment.trim().length > 2000) {
      setError('Comment must be less than 2000 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await api.post(`/reviews/${itemType}/${itemId}/comment`, {
        comment: newComment.trim()
      });

      if (response.data.success) {
        // Add new comment to the beginning of the list
        const newCommentData = {
          ...response.data.data,
          user: response.data.data.user,
          user_id: user.id,
          username: user.displayName || user.email,
          avatar_url: user.photoURL
        };
        
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        onCommentAdded();
        
        // Show success message
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error.response?.data?.error || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim() || editText.trim().length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    try {
      const response = await api.put(`/reviews/${commentId}`, {
        comment: editText.trim()
      });

      if (response.data.success) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, comment: editText.trim(), is_edited: true }
            : comment
        ));
        setEditingComment(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      setError(error.response?.data?.error || 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await api.delete(`/reviews/${commentId}`);
      
      if (response.data.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error.response?.data?.error || 'Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const loadMoreComments = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchComments(pagination.currentPage + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comment Form */}
      {user && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add a Comment
          </h3>
          
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Share your thoughts about this ${itemType}...`}
                rows={4}
                maxLength={2000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {newComment.length}/2000 characters (minimum 10)
                </p>
                <Button
                  type="submit"
                  disabled={submitting || newComment.trim().length < 10}
                  icon={<ChatBubbleLeftIcon />}
                  size="small"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 mt-2"
            >
              {error}
            </motion.p>
          )}
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({pagination.totalReviews || 0})
        </h3>

        {comments.length === 0 ? (
          <Card className="p-8 text-center">
            <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-600">
              Be the first to share your thoughts about this {itemType}
            </p>
          </Card>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {comment.avatar_url ? (
                        <img
                          src={comment.avatar_url}
                          alt={comment.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">
                            {comment.username}
                          </h4>
                          {comment.rating && (
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm text-gray-600">
                                {comment.rating}/5
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Comment Actions */}
                        {user && user.id === comment.user_id && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingComment(comment.id);
                                setEditText(comment.comment);
                              }}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>{formatDate(comment.created_at)}</span>
                        {comment.is_edited && (
                          <span className="text-gray-400">(edited)</span>
                        )}
                      </div>

                      {/* Comment Text or Edit Form */}
                      {editingComment === comment.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            maxLength={2000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleEditComment(comment.id)}
                              size="small"
                              disabled={editText.trim().length < 10}
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingComment(null);
                                setEditText('');
                              }}
                              variant="outline"
                              size="small"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Load More Button */}
        {pagination.hasNextPage && (
          <div className="text-center">
            <Button
              onClick={loadMoreComments}
              variant="outline"
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load More Comments'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
