import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const RealTimeStats = ({ className = '' }) => {
  const [stats, setStats] = useState({
    totalDestinations: 0,
    totalCategories: 0,
    totalRatings: 0,
    averageRating: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get trips count
      const tripsSnapshot = await getDocs(collection(db, 'trips'));
      const tripsCount = tripsSnapshot.size;

      // Get hotels count
      const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
      const hotelsCount = hotelsSnapshot.size;

      // Get categories count
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesCount = categoriesSnapshot.size;

      // Get ratings count and average
      const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
      const ratingsData = ratingsSnapshot.docs.map(doc => doc.data());
      const totalRatings = ratingsData.length;
      const averageRating = totalRatings > 0 
        ? ratingsData.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0;

      setStats({
        totalDestinations: tripsCount + hotelsCount,
        totalCategories: categoriesCount,
        totalRatings,
        averageRating,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className={`grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center">
            <div className="text-3xl font-bold text-yellow-400 animate-pulse">...</div>
            <div className="text-sm text-gray-300">Loading</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto ${className}`}>
      <div className="text-center">
        <div className="text-3xl font-bold text-yellow-400">
          {stats.totalDestinations}+
        </div>
        <div className="text-sm text-gray-300">Destinations</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-yellow-400">
          {stats.totalCategories}+
        </div>
        <div className="text-sm text-gray-300">Categories</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-yellow-400">
          {stats.totalRatings > 0 ? stats.averageRating.toFixed(1) : '★★★★★'}
        </div>
        <div className="text-sm text-gray-300">
          {stats.totalRatings > 0 ? `Avg Rating (${stats.totalRatings})` : 'Quality Service'}
        </div>
      </div>
    </div>
  );
};

export default RealTimeStats;
