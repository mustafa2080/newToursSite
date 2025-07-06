import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  UserIcon,
  CalendarDaysIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RatingsManagement = () => {
  const [ratings, setRatings] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadRatings();
    loadCommentsCount();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      console.log('⭐ Loading all ratings...');

      const ratingsRef = collection(db, 'ratings');
      const ratingsQuery = query(ratingsRef, orderBy('createdAt', 'desc'));
      const ratingsSnapshot = await getDocs(ratingsQuery);

      const ratingsData = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setRatings(ratingsData);
      console.log(`✅ Loaded ${ratingsData.length} ratings`);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentsCount = async () => {
    try {
      console.log('💬 Loading comments count...');

      // Try to get comments from multiple possible collections
      const collections = ['comments', 'reviews'];
      let totalComments = 0;

      for (const collectionName of collections) {
        try {
          const commentsRef = collection(db, collectionName);
          const commentsSnapshot = await getDocs(commentsRef);

          // Count comments that have actual content
          const commentsWithContent = commentsSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.content || data.comment || data.text;
          });

          totalComments += commentsWithContent.length;
          console.log(`📊 Found ${commentsWithContent.length} comments in ${collectionName} collection`);
        } catch (error) {
          console.log(`Collection ${collectionName} not found or empty`);
        }
      }

      setCommentsCount(totalComments);
      console.log(`✅ Total comments count: ${totalComments}`);
    } catch (error) {
      console.error('Error loading comments count:', error);
      setCommentsCount(0);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'ratings', ratingId));
      console.log('✅ Rating deleted successfully');
      await loadRatings();
      alert('Rating deleted successfully!');
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Error deleting rating. Please try again.');
    }
  };

  const addSampleRatings = async () => {
    if (!window.confirm('This will add sample ratings to the database. Continue?')) {
      return;
    }

    try {
      setLoading(true);

      const sampleRatings = [
        {
          userName: 'Ahmed Hassan',
          userEmail: 'ahmed@example.com',
          userId: 'user1',
          itemType: 'trip',
          itemId: 'trip1',
          itemTitle: 'Amazing Beach Adventure in Sharm El-Sheikh',
          rating: 5,
          comment: 'Absolutely amazing experience! The beaches were pristine and the activities were well-organized.',
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
          comment: 'Great hotel with excellent service. The room was clean and comfortable.',
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
          comment: 'Unforgettable desert experience! The camel riding and traditional dinner were highlights.',
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
          comment: 'Average experience. The location was good but service could be improved.',
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
          comment: 'Beautiful cruise with amazing historical sites. Food was good and entertainment enjoyable.',
          createdAt: serverTimestamp()
        },
        {
          userName: 'Layla Ahmed',
          userEmail: 'layla@example.com',
          userId: 'user6',
          itemType: 'trip',
          itemId: 'trip1',
          itemTitle: 'Amazing Beach Adventure in Sharm El-Sheikh',
          rating: 5,
          comment: '',
          createdAt: serverTimestamp()
        },
        {
          userName: 'Youssef Mohamed',
          userEmail: 'youssef@example.com',
          userId: 'user7',
          itemType: 'hotel',
          itemId: 'hotel1',
          itemTitle: 'Luxury Resort Cairo',
          rating: 2,
          comment: '',
          createdAt: serverTimestamp()
        }
      ];

      const ratingsRef = collection(db, 'ratings');

      for (const rating of sampleRatings) {
        await addDoc(ratingsRef, rating);
      }

      console.log('✅ Sample ratings added successfully');
      await loadRatings();
      await loadCommentsCount(); // Update comments count
      alert('Sample ratings added successfully!');
    } catch (error) {
      console.error('Error adding sample ratings:', error);
      alert('Error adding sample ratings. Please try again.');
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

  const getFilteredAndSortedRatings = () => {
    let filteredRatings = [...ratings];

    if (searchQuery.trim()) {
      filteredRatings = filteredRatings.filter(rating =>
        rating.itemTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rating.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rating.comment?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filteredRatings = filteredRatings.filter(rating => rating.itemType === filterType);
    }

    if (filterRating !== 'all') {
      filteredRatings = filteredRatings.filter(rating => rating.rating === parseInt(filterRating));
    }

    filteredRatings.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filteredRatings;
  };

  const getRatingStats = () => {
    const totalRatings = ratings.length;
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      ratingDistribution[rating.rating]++;
    });

    return {
      totalRatings,
      averageRating,
      ratingDistribution
    };
  };

  const filteredRatings = getFilteredAndSortedRatings();
  const stats = getRatingStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading ratings..." />
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
          <h1 className="text-3xl font-bold text-gray-900">Ratings Management</h1>
          <p className="text-gray-600 mt-2">Manage user ratings and feedback</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalRatings}</div>
            <div className="text-sm text-gray-600">Total Ratings</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.ratingDistribution[5]}</div>
            <div className="text-sm text-gray-600">5-Star Ratings</div>
          </Card>
          
          <Link to="/admin/comments">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {commentsCount}
              </div>
              <div className="text-sm text-gray-600">Total Comments</div>
              <div className="text-xs text-blue-600 mt-1">Click to manage →</div>
            </Card>
          </Link>
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
                  placeholder="Search ratings..."
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
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Ratings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Ratings ({filteredRatings.length})
            </h2>
            {ratings.length === 0 && (
              <Button
                onClick={addSampleRatings}
                loading={loading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Add Sample Ratings
              </Button>
            )}
          </div>

          {filteredRatings.length > 0 ? (
            <div className="space-y-4">
              {filteredRatings.map((rating, index) => (
                <motion.div
                  key={rating.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{rating.userName}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              rating.itemType === 'trip' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {rating.itemType}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              <span>{formatDate(rating.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                              {renderStars(rating.rating)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Rating for: <span className="font-medium">{rating.itemTitle}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleDeleteRating(rating.id)}
                          variant="outline"
                          size="small"
                          icon={<TrashIcon />}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {rating.comment && rating.comment.trim() && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 text-sm">{rating.comment}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>User: {rating.userEmail}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <StarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Ratings Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterType !== 'all' || filterRating !== 'all'
                  ? 'No ratings match your current filters.'
                  : 'No ratings have been submitted yet. Click "Add Sample Ratings" to populate with test data.'
                }
              </p>
              {ratings.length === 0 && (
                <Button
                  onClick={addSampleRatings}
                  loading={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Sample Ratings
                </Button>
              )}
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RatingsManagement;
