import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  maxRating = 5, 
  size = 'md',
  readonly = false,
  showValue = true,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoverRating(starValue);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
      setIsHovering(false);
    }
  };

  const getStarColor = (starIndex) => {
    const currentRating = isHovering ? hoverRating : rating;
    
    if (starIndex <= currentRating) {
      return 'text-yellow-400'; // Gold/Yellow for filled stars
    }
    return 'text-gray-300'; // Light gray for empty stars
  };

  const getStarIcon = (starIndex) => {
    const currentRating = isHovering ? hoverRating : rating;
    return starIndex <= currentRating ? StarSolidIcon : StarIcon;
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Stars */}
      <div 
        className="flex items-center space-x-1"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const StarComponent = getStarIcon(starValue);
          
          return (
            <motion.button
              key={starValue}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={readonly}
              className={`
                ${sizeClasses[size]} 
                ${getStarColor(starValue)}
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded
                ${!readonly ? 'hover:drop-shadow-lg' : ''}
              `}
              whileHover={!readonly ? { scale: 1.1 } : {}}
              whileTap={!readonly ? { scale: 0.95 } : {}}
              aria-label={`Rate ${starValue} out of ${maxRating} stars`}
            >
              <StarComponent className="w-full h-full" />
            </motion.button>
          );
        })}
      </div>

      {/* Rating Value Display */}
      {showValue && (
        <div className={`ml-2 ${textSizeClasses[size]}`}>
          <span className="font-medium text-gray-700">
            {isHovering ? hoverRating : rating}
          </span>
          <span className="text-gray-500">/{maxRating}</span>
        </div>
      )}

      {/* Rating Text */}
      {!readonly && isHovering && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className={`ml-2 ${textSizeClasses[size]} text-gray-600`}
        >
          {getRatingText(hoverRating)}
        </motion.div>
      )}
    </div>
  );
};

// Helper function to get rating text
const getRatingText = (rating) => {
  switch (rating) {
    case 1:
      return 'Poor';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Very Good';
    case 5:
      return 'Excellent';
    default:
      return '';
  }
};

// Display component for showing average ratings
export const AverageRating = ({ 
  rating, 
  totalReviews = 0, 
  size = 'md',
  showReviewCount = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarSolidIcon 
          key={`full-${i}`} 
          className={`${sizeClasses[size]} text-yellow-400`} 
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className={`${sizeClasses[size]} relative`}>
          <StarIcon className="absolute inset-0 text-gray-300" />
          <div className="overflow-hidden w-1/2">
            <StarSolidIcon className={`${sizeClasses[size]} text-yellow-400`} />
          </div>
        </div>
      );
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon 
          key={`empty-${i}`} 
          className={`${sizeClasses[size]} text-gray-300`} 
        />
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      
      <span className={`font-medium text-gray-700 ${textSizeClasses[size]}`}>
        {rating.toFixed(1)}
      </span>
      
      {showReviewCount && totalReviews > 0 && (
        <span className={`text-gray-500 ${textSizeClasses[size]}`}>
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
