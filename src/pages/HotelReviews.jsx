import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftIcon,
  StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { hotelsAPI } from '../utils/firebaseApi';

const HotelReviews = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest

  useEffect(() => {
    if (hotelId) {
      loadHotel();
      loadReviews();
    }
  }, [hotelId]);

  const loadHotel = async () => {
    try {
      const response = await hotelsAPI.getById(hotelId);
      setHotel(response.data.data);
    } catch (error) {
      console.error('Error loading hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('hotelId', '==', hotelId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviewsData = [];
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'oldest':
        return sorted.reverse();
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default: // newest
        return sorted;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel not found</h2>
          <Link to="/hotels" className="text-blue-600 hover:text-blue-800">
            Browse all hotels
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={`/book/hotel/${hotelId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Hotel Details
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reviews for {hotel.name}
              </h1>
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-700">
                  {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rating Summary */}
        {reviews.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-6 w-6 ${
                          star <= Math.round(averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-600">
                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              </div>
              
              <div>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(r => r.rating === rating).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center mb-2">
                      <span className="w-8 text-sm font-medium">{rating}</span>
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-2" />
                      <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                        <div 
                          className="bg-yellow-400 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviewsLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner />
              <p className="text-gray-600 mt-4">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <Card className="p-12 text-center">
              <ChatBubbleLeftEllipsisIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to review this hotel!</p>
            </Card>
          ) : (
            getSortedReviews().map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="font-semibold text-gray-900 mr-3">
                          {review.userName}
                        </div>
                        <div className="flex items-center mr-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {review.rating}/5
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {review.title}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-500 ml-4">
                      {new Date(review.createdAt.toDate()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelReviews;
