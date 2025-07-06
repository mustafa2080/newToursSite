import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftIcon,
  FunnelIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  HeartIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CommentsManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    item_type: 'all',
    status: 'all',
    search: ''
  });
  const [selectedComment, setSelectedComment] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    by_type: {},
    by_status: {},
    recent: 0
  });

  useEffect(() => {
    loadComments();
  }, [filters]);

  const loadComments = async () => {
    setLoading(true);
    try {
      console.log('💬 Loading comments from Firebase...');

      const commentsRef = collection(db, 'comments');
      const commentsQuery = query(commentsRef, orderBy('created_at', 'desc'));
      const commentsSnapshot = await getDocs(commentsQuery);

      const commentsData = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      }));

      console.log(`✅ Loaded ${commentsData.length} comments`);

      // Apply filters
      let filteredComments = commentsData;

      // Filter by type
      if (filters.item_type !== 'all') {
        filteredComments = filteredComments.filter(comment =>
          comment.item_type === filters.item_type
        );
      }

      // Filter by status
      if (filters.status !== 'all') {
        filteredComments = filteredComments.filter(comment =>
          comment.status === filters.status
        );
      }

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredComments = filteredComments.filter(comment =>
          comment.content?.toLowerCase().includes(searchLower) ||
          comment.user_name?.toLowerCase().includes(searchLower) ||
          comment.user_email?.toLowerCase().includes(searchLower)
        );
      }

      setComments(filteredComments);

      // Calculate stats
      const stats = {
        total: commentsData.length,
        by_type: {},
        by_status: {},
        recent: 0
      };

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      commentsData.forEach(comment => {
        // Count by type
        stats.by_type[comment.item_type] = (stats.by_type[comment.item_type] || 0) + 1;

        // Count by status
        stats.by_status[comment.status] = (stats.by_status[comment.status] || 0) + 1;

        // Count recent comments
        if (comment.created_at > oneDayAgo) {
          stats.recent++;
        }
      });

      setStats(stats);

    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      console.log('✅ Comment deleted successfully');
      await loadComments(); // Reload comments and stats
      alert('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment: ' + error.message);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addSampleComments = async () => {
    if (!window.confirm('This will add sample comments to the database. Continue?')) {
      return;
    }

    try {
      setLoading(true);

      const sampleComments = [
        {
          user_name: 'Ahmed Hassan',
          user_email: 'ahmed@example.com',
          user_id: 'user1',
          item_type: 'trip',
          item_id: 'trip1',
          content: 'This trip was absolutely amazing! The guides were knowledgeable and the scenery was breathtaking. I would definitely recommend this to anyone looking for an adventure.',
          status: 'approved',
          likes_count: 5,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        {
          user_name: 'Sarah Mohamed',
          user_email: 'sarah@example.com',
          user_id: 'user2',
          item_type: 'hotel',
          item_id: 'hotel1',
          content: 'Great hotel with excellent service. The room was clean and the staff was very friendly. The breakfast was delicious too!',
          status: 'approved',
          likes_count: 3,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        {
          user_name: 'Omar Ali',
          user_email: 'omar@example.com',
          user_id: 'user3',
          item_type: 'trip',
          item_id: 'trip2',
          content: 'The desert safari was incredible! Camel riding and the traditional dinner under the stars made it unforgettable.',
          status: 'approved',
          likes_count: 8,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        {
          user_name: 'Fatima Khaled',
          user_email: 'fatima@example.com',
          user_id: 'user4',
          item_type: 'hotel',
          item_id: 'hotel2',
          content: 'The location was good but the service could be improved. The room was okay but not as clean as expected.',
          status: 'pending',
          likes_count: 1,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        {
          user_name: 'Mahmoud Ibrahim',
          user_email: 'mahmoud@example.com',
          user_id: 'user5',
          item_type: 'trip',
          item_id: 'trip3',
          content: 'Beautiful Nile cruise with amazing historical sites. The food was good and entertainment was enjoyable.',
          status: 'approved',
          likes_count: 6,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        {
          user_name: 'Inappropriate User',
          user_email: 'bad@example.com',
          user_id: 'user6',
          item_type: 'trip',
          item_id: 'trip1',
          content: 'This is inappropriate content that should be rejected by moderation.',
          status: 'rejected',
          likes_count: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        }
      ];

      const commentsRef = collection(db, 'comments');

      for (const comment of sampleComments) {
        await addDoc(commentsRef, comment);
      }

      console.log('✅ Sample comments added successfully');
      await loadComments();
      alert('Sample comments added successfully!');
    } catch (error) {
      console.error('Error adding sample comments:', error);
      alert('Error adding sample comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const badges = {
      trip: 'bg-blue-100 text-blue-800',
      hotel: 'bg-purple-100 text-purple-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ChatBubbleLeftIcon className="h-8 w-8 mr-3 text-blue-600" />
                Comments Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and moderate user comments across trips and hotels
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Comments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent (24h)</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.recent}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Trip Comments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.by_type.trip || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hotel Comments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.by_type.hotel || 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Comments
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by content, user name, or email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Type
                </label>
                <select
                  value={filters.item_type}
                  onChange={(e) => handleFilterChange('item_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="trip">Trips</option>
                  <option value="hotel">Hotels</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Comments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Comments ({comments.length})
              </h2>
              {comments.length === 0 && (
                <Button
                  onClick={addSampleComments}
                  loading={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Sample Comments
                </Button>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <ClockIcon className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center">
                <ChatBubbleLeftIcon className="h-8 w-8 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No comments found</p>
                <p className="text-sm text-gray-400 mb-4">
                  {filters.search || filters.item_type !== 'all' || filters.status !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No comments have been submitted yet. Click "Add Sample Comments" to populate with test data.'
                  }
                </p>
                {stats.total === 0 && (
                  <Button
                    onClick={addSampleComments}
                    loading={loading}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Sample Comments
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(comment.item_type)}`}>
                            {comment.item_type}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(comment.status)}`}>
                            {comment.status}
                          </span>
                          {comment.likes_count > 0 && (
                            <span className="flex items-center text-xs text-gray-500">
                              <HeartIcon className="h-3 w-3 mr-1" />
                              {comment.likes_count}
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {comment.user_name || 'Anonymous User'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {comment.user_email} • {formatDate(comment.created_at)}
                          </p>
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          {comment.content}
                        </p>

                        <div className="text-xs text-gray-500">
                          Item ID: {comment.item_id}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => setSelectedComment(comment)}
                          size="small"
                          variant="outline"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDeleteComment(comment.id)}
                          size="small"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Comment Detail Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Comment Details</h3>
              <button
                onClick={() => setSelectedComment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(selectedComment.item_type)}`}>
                    {selectedComment.item_type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedComment.status)}`}>
                    {selectedComment.status}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                  <p className="text-gray-700">
                    <strong>Name:</strong> {selectedComment.user_name || 'Anonymous User'}<br />
                    <strong>Email:</strong> {selectedComment.user_email || 'N/A'}<br />
                    <strong>User ID:</strong> {selectedComment.user_id || 'N/A'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comment Content</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedComment.content}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>Item Type:</strong> {selectedComment.item_type}<br />
                    <strong>Item ID:</strong> {selectedComment.item_id}<br />
                    <strong>Likes:</strong> {selectedComment.likes_count || 0}<br />
                    <strong>Created:</strong> {formatDate(selectedComment.created_at)}<br />
                    <strong>Updated:</strong> {formatDate(selectedComment.updated_at)}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                onClick={() => setSelectedComment(null)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleDeleteComment(selectedComment.id);
                  setSelectedComment(null);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Comment
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CommentsManagement;
