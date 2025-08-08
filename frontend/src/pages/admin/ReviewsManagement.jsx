import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  UserIcon,
  CalendarDaysIcon,
  TrashIcon,
  FlagIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      console.log('📝 Loading all reviews...');

      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setReviews(reviewsData);
      console.log(`✅ Loaded ${reviewsData.length} reviews`);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      console.log('✅ Review deleted successfully');
      await loadReviews();
      alert('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    }
  };

  const handleToggleReported = async (reviewId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        reported: !currentStatus
      });
      console.log('✅ Review report status updated');
      await loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error updating review. Please try again.');
    }
  };

  const addSampleReviews = async () => {
    if (!window.confirm('This will add sample reviews to the database. Continue?')) {
      return;
    }

    try {
      setLoading(true);

      const sampleReviews = [
        {
          userName: 'Ahmed Hassan',
          userEmail: 'ahmed@example.com',
          userId: 'user1',
          itemType: 'trip',
          itemId: 'trip1',
          itemTitle: 'Amazing Beach Adventure in Sharm El-Sheikh',
          rating: 5,
          title: 'Absolutely Amazing Experience!',
          comment: 'This trip exceeded all my expectations. The beaches were pristine, the activities were well-organized, and the guides were incredibly knowledgeable. I would definitely book again!',
          helpful: 12,
          reported: false,
          createdAt: serverTimestamp()
        },
        {
          userName: 'Sarah Mohamed',
          userEmail: 'sarah@example.com',
          userId: 'user2',
          itemType: 'hotel',
          itemId: 'hotel1',
          itemTitle: 'Luxury Resort Cairo',
          rating: 4,
          title: 'Great Stay with Minor Issues',
          comment: 'The hotel was beautiful and the staff was very friendly. The room was clean and comfortable. Only issue was the wifi was a bit slow, but overall a great experience.',
          helpful: 8,
          reported: false,
          createdAt: serverTimestamp()
        },
        {
          userName: 'Omar Ali',
          userEmail: 'omar@example.com',
          userId: 'user3',
          itemType: 'trip',
          itemId: 'trip2',
          itemTitle: 'Desert Safari Adventure',
          rating: 5,
          title: 'Unforgettable Desert Experience',
          comment: 'The desert safari was incredible! Camel riding, sandboarding, and the traditional dinner under the stars. Our guide was fantastic and made the experience even better.',
          helpful: 15,
          reported: false,
          createdAt: serverTimestamp()
        },
        {
          userName: 'Fatima Khaled',
          userEmail: 'fatima@example.com',
          userId: 'user4',
          itemType: 'hotel',
          itemId: 'hotel2',
          itemTitle: 'Seaside Hotel Alexandria',
          rating: 3,
          title: 'Average Experience',
          comment: 'The location was good and the view was nice, but the service could be improved. The room was okay but not as clean as expected. Food was decent.',
          helpful: 3,
          reported: false,
          createdAt: serverTimestamp()
        },
        {
          userName: 'Mahmoud Ibrahim',
          userEmail: 'mahmoud@example.com',
          userId: 'user5',
          itemType: 'trip',
          itemId: 'trip3',
          itemTitle: 'Nile Cruise Experience',
          rating: 4,
          title: 'Beautiful Nile Journey',
          comment: 'The cruise was relaxing and the historical sites were amazing. The food on board was good and the entertainment was enjoyable. Would recommend to others.',
          helpful: 9,
          reported: false,
          createdAt: serverTimestamp()
        },
        {
          userName: 'Inappropriate User',
          userEmail: 'bad@example.com',
          userId: 'user6',
          itemType: 'trip',
          itemId: 'trip1',
          itemTitle: 'Amazing Beach Adventure in Sharm El-Sheikh',
          rating: 1,
          title: 'Terrible Experience',
          comment: 'This is a fake negative review with inappropriate content that should be reported and moderated.',
          helpful: 0,
          reported: true,
          createdAt: serverTimestamp()
        }
      ];

      const reviewsRef = collection(db, 'reviews');

      for (const review of sampleReviews) {
        await addDoc(reviewsRef, review);
      }

      console.log('✅ Sample reviews added successfully');
      await loadReviews();
      alert('Sample reviews added successfully!');
    } catch (error) {
      console.error('Error adding sample reviews:', error);
      alert('Error adding sample reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? (
          <StarIconSolid className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </span>
    ));
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFilteredAndSortedReviews = () => {
    let filteredReviews = [...reviews];

    if (searchQuery.trim()) {
      filteredReviews = filteredReviews.filter(review =>
        review.itemTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filteredReviews = filteredReviews.filter(review => review.itemType === filterType);
    }

    if (filterRating !== 'all') {
      filteredReviews = filteredReviews.filter(review => review.rating === parseInt(filterRating));
    }

    filteredReviews.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return (b.helpful || 0) - (a.helpful || 0);
        default:
          return 0;
      }
    });

    return filteredReviews;
  };

  const getReviewStats = () => {
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    const reportedReviews = reviews.filter(review => review.reported).length;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    return {
      totalReviews,
      averageRating,
      reportedReviews,
      ratingDistribution
    };
  };

  const filteredReviews = getFilteredAndSortedReviews();
  const stats = getReviewStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading reviews..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-600 mt-2">Manage and moderate user reviews</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalReviews}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.ratingDistribution[5]}</div>
            <div className="text-sm text-gray-600">5-Star Reviews</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.reportedReviews}</div>
            <div className="text-sm text-gray-600">Reported Reviews</div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="trip">Trips</option>
                <option value="hotel">Hotels</option>
              </select>

              {/* Rating Filter */}
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Reviews ({filteredReviews.length})
            </h2>
            {reviews.length === 0 && (
              <Button
                onClick={addSampleReviews}
                loading={loading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Add Sample Reviews
              </Button>
            )}
          </div>

          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className={`p-6 ${review.reported ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              review.itemType === 'trip' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {review.itemType}
                            </span>
                            {review.reported && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Reported
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              <span>{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Review for: <span className="font-medium">{review.itemTitle}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleToggleReported(review.id, review.reported)}
                          variant="outline"
                          size="small"
                          icon={review.reported ? <CheckCircleIcon /> : <FlagIcon />}
                          className={review.reported 
                            ? "border-green-300 text-green-700 hover:bg-green-50" 
                            : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          }
                        >
                          {review.reported ? 'Unreport' : 'Report'}
                        </Button>
                        
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

                    {review.title && (
                      <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                    )}

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Helpful votes: {review.helpful || 0}</span>
                        <span>User: {review.userEmail}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <StarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterType !== 'all' || filterRating !== 'all'
                  ? 'No reviews match your current filters.'
                  : 'No reviews have been submitted yet. Click "Add Sample Reviews" to populate with test data.'
                }
              </p>
              {reviews.length === 0 && (
                <Button
                  onClick={addSampleReviews}
                  loading={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Sample Reviews
                </Button>
              )}
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewsManagement;
