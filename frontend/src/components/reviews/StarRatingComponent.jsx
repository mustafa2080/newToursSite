import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const StarRatingComponent = ({ 
  itemType, 
  itemId, 
  itemTitle, 
  size = 'h-6 w-6',
  showLabel = true,
  onRatingSubmitted = () => {},
  className = ''
}) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && itemType && itemId) {
      fetchUserRating();
    }
  }, [user, itemType, itemId]);

  const fetchUserRating = async () => {
    try {
      const response = await api.get(`/reviews/${itemType}/${itemId}/user-rating`);
      if (response.data.success && response.data.data) {
        setUserRating(response.data.data.rating);
        setHasRated(true);
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const handleStarClick = async (rating) => {
    if (!user) {
      setError('Please login to rate this item');
      return;
    }

    if (hasRated) {
      setError('You have already rated this item. Ratings cannot be changed.');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      const response = await api.post(`/reviews/${itemType}/${itemId}/rating`, {
        rating
      });

      if (response.data.success) {
        setUserRating(rating);
        setHasRated(true);
        onRatingSubmitted(rating);
        
        // Show success message briefly
        setTimeout(() => {
          setError('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response?.data?.code === 'RATING_ALREADY_EXISTS') {
        setError('You have already rated this item');
        setHasRated(true);
      } else {
        setError(error.response?.data?.error || 'Failed to submit rating');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoverRating || userRating || 0);
      const isClickable = !hasRated && user && !isSubmitting;

      return (
        <motion.button
          key={index}
          type="button"
          disabled={!isClickable}
          className={`
            ${size} 
            ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} 
            transition-all duration-200
            ${isSubmitting ? 'opacity-50' : ''}
          `}
          onClick={() => isClickable && handleStarClick(starValue)}
          onMouseEnter={() => isClickable && setHoverRating(starValue)}
          onMouseLeave={() => isClickable && setHoverRating(0)}
          whileHover={isClickable ? { scale: 1.1 } : {}}
          whileTap={isClickable ? { scale: 0.95 } : {}}
        >
          {isFilled ? (
            <StarIconSolid 
              className={`
                ${hasRated ? 'text-yellow-500' : 'text-yellow-400'}
                ${hoverRating >= starValue ? 'text-yellow-500' : ''}
              `} 
            />
          ) : (
            <StarIcon 
              className={`
                ${isClickable ? 'text-gray-300 hover:text-yellow-300' : 'text-gray-300'}
                ${hoverRating >= starValue ? 'text-yellow-400' : ''}
              `} 
            />
          )}
        </motion.button>
      );
    });
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating] || '';
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {/* Stars */}
      <div className="flex items-center space-x-1">
        {renderStars()}
      </div>

      {/* Rating Label */}
      {showLabel && (hoverRating || userRating) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-gray-700"
        >
          {hoverRating ? (
            <span className="text-blue-600">
              {hoverRating} star{hoverRating !== 1 ? 's' : ''} - {getRatingLabel(hoverRating)}
            </span>
          ) : userRating ? (
            <span className="text-green-600">
              Your rating: {userRating} star{userRating !== 1 ? 's' : ''} - {getRatingLabel(userRating)}
            </span>
          ) : null}
        </motion.div>
      )}

      {/* Status Messages */}
      {!user && (
        <p className="text-xs text-gray-500 text-center">
          Login to rate this {itemType}
        </p>
      )}

      {user && !hasRated && !isSubmitting && (
        <p className="text-xs text-gray-500 text-center">
          Click to rate this {itemType}
        </p>
      )}

      {isSubmitting && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-blue-600 text-center"
        >
          Submitting rating...
        </motion.p>
      )}

      {hasRated && userRating && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-green-600 text-center"
        >
          ✓ Rating submitted
        </motion.p>
      )}

      {/* Error Message */}
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-red-600 text-center max-w-xs"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default StarRatingComponent;
