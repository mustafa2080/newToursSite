import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const DirectRatingSystem = ({ itemId, itemType, itemTitle, size = 'h-6 w-6', showStats = true }) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userRatingDoc, setUserRatingDoc] = useState(null);

  useEffect(() => {
    loadRatings();
  }, [itemId, itemType, user]);

  const loadRatings = async () => {
    try {
      const ratingsRef = collection(db, 'ratings');
      const ratingsQuery = query(
        ratingsRef,
        where('itemId', '==', itemId),
        where('itemType', '==', itemType)
      );

      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratings = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate stats
      const total = ratings.length;
      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      const average = total > 0 ? sum / total : 0;

      setTotalRatings(total);
      setAverageRating(average);

      // Find user's rating
      if (user) {
        const userRatingData = ratings.find(rating => rating.userId === user.uid);
        if (userRatingData) {
          setUserRating(userRatingData.rating);
          setUserRatingDoc(userRatingData);
        } else {
          setUserRating(0);
          setUserRatingDoc(null);
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const handleRatingClick = async (rating) => {
    if (!user) {
      alert('Please login to rate');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      console.log(`⭐ Setting rating: ${rating} stars`);

      const ratingData = {
        itemId,
        itemType,
        itemTitle,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        userEmail: user.email,
        rating,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (userRatingDoc) {
        // Update existing rating
        await updateDoc(doc(db, 'ratings', userRatingDoc.id), {
          rating,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Rating updated');
      } else {
        // Add new rating
        await addDoc(collection(db, 'ratings'), ratingData);
        console.log('✅ Rating added');
      }

      // Update local state immediately
      setUserRating(rating);
      
      // Reload to get updated stats
      await loadRatings();
      
    } catch (error) {
      console.error('Error saving rating:', error);
      alert('Error saving rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoverRating || userRating);
      const isHovered = hoverRating > 0 && starValue <= hoverRating;

      return (
        <motion.button
          key={i}
          type="button"
          disabled={loading}
          className={`${size} cursor-pointer transition-all duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          }`}
          onClick={() => handleRatingClick(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          whileHover={{ scale: loading ? 1 : 1.1 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
        >
          {isFilled ? (
            <StarIconSolid 
              className={`${
                isHovered 
                  ? 'text-yellow-500' 
                  : userRating >= starValue 
                    ? 'text-yellow-400' 
                    : 'text-yellow-300'
              }`} 
            />
          ) : (
            <StarIcon 
              className={`${
                isHovered 
                  ? 'text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-200'
              }`} 
            />
          )}
        </motion.button>
      );
    });
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Stars */}
      <div className="flex items-center space-x-1">
        {renderStars()}
      </div>

      {/* Stats */}
      {showStats && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {totalRatings > 0 ? (
            <>
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span>({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</span>
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      )}

      {/* User feedback */}
      {user && userRating > 0 && (
        <div className="text-xs text-blue-600">
          Your rating: {userRating} star{userRating !== 1 ? 's' : ''}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="text-xs text-gray-500">
          Saving...
        </div>
      )}
    </div>
  );
};

export default DirectRatingSystem;

// Quick stats component for cards
export const QuickRatingDisplay = ({ itemId, itemType, size = 'h-4 w-4' }) => {
  const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuickStats = async () => {
      try {
        const ratingsRef = collection(db, 'ratings');
        const ratingsQuery = query(
          ratingsRef,
          where('itemId', '==', itemId),
          where('itemType', '==', itemType)
        );

        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratings = ratingsSnapshot.docs.map(doc => doc.data());
        
        const totalRatings = ratings.length;
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRatings > 0 ? totalRating / totalRatings : 0;

        setStats({ averageRating, totalRatings });
      } catch (error) {
        console.error('Error loading quick stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (itemId && itemType) {
      loadQuickStats();
    }
  }, [itemId, itemType]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>;
  }

  if (stats.totalRatings === 0) {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} className={`${size} text-gray-300`} />
          ))}
        </div>
        <span className="text-sm text-gray-500">(No ratings)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i}>
            {i < Math.floor(stats.averageRating) ? (
              <StarIconSolid className={`${size} text-yellow-400`} />
            ) : (
              <StarIcon className={`${size} text-gray-300`} />
            )}
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {stats.averageRating.toFixed(1)} ({stats.totalRatings})
      </span>
    </div>
  );
};

// Compact rating component for small spaces
export const CompactRating = ({ itemId, itemType, itemTitle }) => {
  return (
    <DirectRatingSystem 
      itemId={itemId} 
      itemType={itemType} 
      itemTitle={itemTitle}
      size="h-5 w-5"
      showStats={true}
    />
  );
};

// Large rating component for detail pages
export const LargeRating = ({ itemId, itemType, itemTitle }) => {
  return (
    <div className="text-center py-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate this {itemType}</h3>
      <DirectRatingSystem 
        itemId={itemId} 
        itemType={itemType} 
        itemTitle={itemTitle}
        size="h-8 w-8"
        showStats={true}
      />
      <p className="text-sm text-gray-600 mt-2">
        Click on the stars to rate
      </p>
    </div>
  );
};
