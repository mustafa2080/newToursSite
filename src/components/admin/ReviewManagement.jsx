import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  TrashIcon,
  FlagIcon,
  CheckCircleIcon,
  UserIcon,
  CalendarDaysIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Card from '../common/Card';
import Button from '../common/Button';
import api from '../../services/api';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    itemType: 'all',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [pagination, setPagination] = useState({});
  const [selectedReviews, setSelectedReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filters]);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...filters
      });

      const response = await api.get(`/admin/reviews?${params}`);
      
      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/reviews/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteReview = async (reviewId, reason = '') => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.delete(`/admin/reviews/${reviewId}`, {
        data: { reason }
      });
      
      // Remove from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedReviews.length} selected reviews?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedReviews.map(reviewId => 
          api.delete(`/admin/reviews/${reviewId}`, {
            data: { reason: 'Bulk deletion by admin' }
          })
        )
      );
      
      setReviews(prev => prev.filter(review => !selectedReviews.includes(review.id)));
      setSelectedReviews([]);
      fetchStats();
    } catch (error) {
      console.error('Error bulk deleting reviews:', error);
      alert('Failed to delete some reviews');
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i}>
            {i < rating ? (
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-600">Manage user reviews and ratings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-2xl font-bold text-blue-600">
            {stats.reviews?.total_reviews || 0}
          </div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </Card>
        
        <Card className="p-6">
          <div className="text-2xl font-bold text-green-600">
            {stats.ratings?.total_ratings || 0}
          </div>
          <div className="text-sm text-gray-600">Total Ratings</div>
        </Card>
        
        <Card className="p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.ratings?.average_rating ? parseFloat(stats.ratings.average_rating).toFixed(1) : '0.0'}
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </Card>
        
        <Card className="p-6">
          <div className="text-2xl font-bold text-purple-600">
            {stats.reviews?.reviews_last_week || 0}
          </div>
          <div className="text-sm text-gray-600">This Week</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Item Type Filter */}
          <select
            value={filters.itemType}
            onChange={(e) => setFilters(prev => ({ ...prev, itemType: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="trip">Trips</option>
            <option value="hotel">Hotels</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Date Created</option>
            <option value="updated_at">Date Updated</option>
            <option value="username">Username</option>
            <option value="item_type">Item Type</option>
          </select>

          {/* Sort Order */}
          <select
            value={filters.sortOrder}
            onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedReviews.length} selected
            </span>
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              size="small"
              icon={<TrashIcon />}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Delete Selected
            </Button>
          </div>
        )}
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </Card>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedReviews.includes(review.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReviews(prev => [...prev, review.id]);
                      } else {
                        setSelectedReviews(prev => prev.filter(id => id !== review.id));
                      }
                    }}
                    className="mt-1"
                  />

                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {review.avatar_url ? (
                      <img
                        src={review.avatar_url}
                        alt={review.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">
                          {review.username}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {review.email}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          review.item_type === 'trip' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {review.item_type}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleDeleteReview(review.id)}
                          variant="outline"
                          size="small"
                          icon={<TrashIcon />}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                      {review.is_edited && (
                        <span className="text-orange-600">(edited)</span>
                      )}
                      {review.rating && renderStars(review.rating)}
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        Review for: <span className="font-medium">{review.item_title}</span>
                      </p>
                    </div>

                    <p className="text-gray-700 whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              onClick={() => fetchReviews(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              variant="outline"
              size="small"
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => fetchReviews(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              variant="outline"
              size="small"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
