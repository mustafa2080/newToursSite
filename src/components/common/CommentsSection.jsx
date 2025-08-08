import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  HeartIcon,
  TrashIcon,
  PencilIcon,
  UserCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import commentsService from '../../services/commentsService';

const CommentsSection = ({ itemId, itemType, title = "Comments" }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadComments();
  }, [itemId, itemType]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const comments = await commentsService.getCommentsByItem(itemType, itemId);
      setComments(comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        item_type: itemType,
        item_id: itemId,
        content: newComment.trim(),
        user_name: user?.displayName || user?.email || 'Anonymous User',
        user_email: user?.email || '',
        user_id: user?.uid || null
      };

      const newCommentDoc = await commentsService.createComment(commentData);
      setComments(prev => [newCommentDoc, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await commentsService.updateComment(commentId, {
        content: editText.trim()
      });

      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? { ...comment, content: editText.trim(), updated_at: new Date() }
          : comment
      ));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment. Please try again.');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const userId = user?.uid || 'anonymous';
      const result = await commentsService.toggleLike(commentId, userId);

      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              likes_count: result.likes_count,
              user_liked: result.user_liked
            }
          : comment
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const canEditOrDelete = (comment) => {
    return user && (user.uid === comment.user_id || user.email === comment.user_email);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <ChatBubbleLeftIcon className="h-6 w-6 mr-2 text-blue-600" />
          {title} ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Write a comment..." : "Please sign in to write a comment"}
              disabled={!user || submitting}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                {user ? `Commenting as ${user.displayName || user.email}` : 'Sign in to comment'}
              </span>
              <Button
                type="submit"
                disabled={!user || !newComment.trim() || submitting}
                size="small"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                )}
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <ClockIcon className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {comment.user_name || 'Anonymous User'}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatDate(comment.created_at)}
                          {comment.updated_at && comment.updated_at !== comment.created_at && (
                            <span className="ml-2">(edited)</span>
                          )}
                        </div>
                      </div>
                      {canEditOrDelete(comment) && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditText(comment.content);
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

                    {editingComment === comment.id ? (
                      <div className="mt-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            onClick={() => handleEditComment(comment.id)}
                            size="small"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                            size="small"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    )}

                    {/* Like Button */}
                    <div className="flex items-center mt-3">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        disabled={!user}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          comment.user_liked 
                            ? 'text-red-600' 
                            : 'text-gray-500 hover:text-red-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {comment.user_liked ? (
                          <HeartSolidIcon className="h-4 w-4" />
                        ) : (
                          <HeartIcon className="h-4 w-4" />
                        )}
                        <span>{comment.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Guest Message */}
      {!user && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Want to join the conversation?</strong> Sign in to post comments and interact with other travelers.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
