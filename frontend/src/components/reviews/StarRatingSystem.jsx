import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';

const StarRatingSystem = ({ 
  itemId, 
  itemType, 
  itemTitle,
  size = 'lg',
  showStats = true,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Size configurations
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  };

  useEffect(() => {
    loadRatings();
    loadUserRating();
  }, [itemId, itemType, user]);

  const loadRatings = () => {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('itemId', '==', itemId), where('itemType', '==', itemType));
    
    return onSnapshot(q, (snapshot) => {
      const ratings = [];
      snapshot.forEach((doc) => {
        ratings.push({ id: doc.id, ...doc.data() });
      });

      // Calculate statistics
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0;

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratings.forEach(rating => {
        distribution[rating.rating]++;
      });

      setStats({
        averageRating,
        totalRatings,
        distribution
      });
    });
  };

  const loadUserRating = async () => {
    if (!user) return;

    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(
        ratingsRef, 
        where('itemId', '==', itemId),
        where('itemType', '==', itemType),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userRatingDoc = snapshot.docs[0];
        setUserRating(userRatingDoc.data().rating);
      }
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleStarClick = async (rating) => {
    if (!isAuthenticated) {
      alert('Please login to rate this item');
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      
      // Check if user already rated
      const ratingsRef = collection(db, 'ratings');
      const existingRatingQuery = query(
        ratingsRef,
        where('itemId', '==', itemId),
        where('itemType', '==', itemType),
        where('userId', '==', user.uid)
      );
      
      const existingSnapshot = await getDocs(existingRatingQuery);
      
      if (!existingSnapshot.empty) {
        // Update existing rating
        const existingDoc = existingSnapshot.docs[0];
        await updateDoc(doc(db, 'ratings', existingDoc.id), {
          rating,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new rating
        await addDoc(ratingsRef, {
          itemId,
          itemType,
          itemTitle,
          userId: user.uid,
          userName: user.displayName || user.email || 'User',
          userEmail: user.email,
          rating,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      setUserRating(rating);
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarHover = (rating) => {
    if (!submitting) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isHovered = hoverRating >= starValue;
      const isRated = userRating >= starValue;
      const shouldFill = isHovered || (userRating > 0 && isRated);

      return (
        <motion.button
          key={starValue}
          type="button"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          onMouseLeave={handleMouseLeave}
          disabled={submitting}
          className={`
            ${sizeClasses[size]}
            ${submitting ? 'cursor-wait' : 'cursor-pointer'}
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded-lg
            hover:scale-110 hover:drop-shadow-lg
            p-1 border-2 ${shouldFill ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300 hover:bg-yellow-50'}
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Rate ${starValue} out of 5 stars`}
        >
          {shouldFill ? (
            <StarSolidIcon className="text-yellow-500 drop-shadow-lg" />
          ) : (
            <StarIcon className="text-gray-500 hover:text-yellow-400 transition-colors stroke-2" />
          )}
        </motion.button>
      );
    });
  };

  const renderAverageStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= Math.floor(rating);
      const isHalf = starValue === Math.ceil(rating) && rating % 1 !== 0;

      return (
        <div key={index} className="relative">
          {isHalf ? (
            <div className={`${sizeClasses[size]} relative p-1 border border-gray-300 rounded bg-gray-50`}>
              <StarIcon className="absolute inset-1 text-gray-400" />
              <div className="overflow-hidden w-1/2">
                <StarSolidIcon className={`${sizeClasses[size]} text-yellow-500`} />
              </div>
            </div>
          ) : (
            isFilled ? (
              <StarSolidIcon className={`${sizeClasses[size]} text-yellow-500 p-1 border border-yellow-400 rounded bg-yellow-50`} />
            ) : (
              <StarIcon className={`${sizeClasses[size]} text-gray-500 p-1 border border-gray-300 rounded bg-gray-50`} />
            )
          )}
        </div>
      );
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Display */}
      {showStats && (
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Ratings
            </h3>
            
            {stats.totalRatings > 0 ? (
              <div className="space-y-4">
                {/* Average Rating */}
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {renderAverageStars(stats.averageRating)}
                  </div>
                  <p className="text-gray-600">
                    Based on {stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'}
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm font-medium w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${stats.totalRatings > 0 ? (stats.distribution[rating] / stats.totalRatings) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {stats.distribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon key={i} className={`${sizeClasses[size]} text-gray-300`} />
                  ))}
                </div>
                <p className="text-gray-600">No ratings yet. Be the first to rate!</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* User Rating Interface */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {userRating > 0 ? 'Your Rating' : 'Rate This Item'}
          </h3>
          
          <div className="flex items-center justify-center space-x-1 mb-4">
            {renderStars()}
          </div>

          {/* Rating Feedback */}
          <div className="min-h-[2rem] flex items-center justify-center">
            {hoverRating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-600"
              >
                {hoverRating === 1 && '😞 Poor'}
                {hoverRating === 2 && '👎 Fair'}
                {hoverRating === 3 && '👌 Good'}
                {hoverRating === 4 && '👍 Very Good'}
                {hoverRating === 5 && '⭐ Excellent'}
                <span className="ml-2 text-blue-600 font-medium">
                  Click to rate {hoverRating} star{hoverRating !== 1 ? 's' : ''}
                </span>
              </motion.p>
            )}
            
            {userRating > 0 && hoverRating === 0 && (
              <p className="text-sm text-green-600 font-medium">
                ✅ You rated this {userRating} star{userRating !== 1 ? 's' : ''}
              </p>
            )}
            
            {userRating === 0 && hoverRating === 0 && !submitting && (
              <p className="text-sm text-gray-500">
                ⭐ Hover over the stars and click to rate
              </p>
            )}
            
            {submitting && (
              <p className="text-sm text-blue-600">
                🔄 Submitting your rating...
              </p>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-2">
              Please login to rate this item
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StarRatingSystem;
