import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { 
  collection, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const QuickRating = ({ 
  itemId, 
  itemType, 
  size = 'sm',
  showCount = true,
  className = ''
}) => {
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);

  // Size configurations
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  useEffect(() => {
    if (!itemId || !itemType) return;

    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('itemId', '==', itemId), where('itemType', '==', itemType));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ratings = [];
      snapshot.forEach((doc) => {
        ratings.push(doc.data());
      });

      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0;

      setStats({
        averageRating,
        totalRatings
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [itemId, itemType]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= Math.floor(rating);
      const isHalf = starValue === Math.ceil(rating) && rating % 1 !== 0;

      return (
        <div key={index} className="relative">
          {isHalf ? (
            <div className={`${sizeClasses[size]} relative`}>
              <StarIcon className="absolute inset-0 text-gray-400 stroke-2" />
              <div className="overflow-hidden w-1/2">
                <StarSolidIcon className={`${sizeClasses[size]} text-yellow-500`} />
              </div>
            </div>
          ) : (
            isFilled ? (
              <StarSolidIcon className={`${sizeClasses[size]} text-yellow-500`} />
            ) : (
              <StarIcon className={`${sizeClasses[size]} text-gray-500 stroke-2`} />
            )
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center space-x-1">
          <div className="bg-gray-200 h-4 w-20 rounded"></div>
        </div>
      </div>
    );
  }

  if (stats.totalRatings === 0) {
    return (
      <div className={`flex items-center space-x-1 text-gray-500 ${className}`}>
        <div className="flex items-center">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} className={`${sizeClasses[size]} text-gray-500 stroke-2`} />
          ))}
        </div>
        {showCount && (
          <span className={`${textSizeClasses[size]} text-gray-400`}>
            (No ratings)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {renderStars(stats.averageRating)}
      </div>
      <span className={`${textSizeClasses[size]} font-medium text-gray-700`}>
        {stats.averageRating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`${textSizeClasses[size]} text-gray-500`}>
          ({stats.totalRatings})
        </span>
      )}
    </div>
  );
};

export default QuickRating;
