import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  StarIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import QuickRating from '../reviews/QuickRating';

const WishlistPage = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'trips', 'hotels'
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = () => {
    const wishlistRef = collection(db, 'wishlist');
    const q = query(
      wishlistRef,
      where('userId', '==', user.uid)
    );

    return onSnapshot(q, (snapshot) => {
      try {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });

        // Sort manually by createdAt in descending order
        items.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return bTime - aTime;
        });

        setWishlistItems(items);
        setError(null);
      } catch (err) {
        console.error('Error processing wishlist data:', err);
        setError('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Error loading wishlist:', err);
      setError('Failed to load wishlist. Please try again.');
      setLoading(false);
    });
  };

  const handleRemoveFromWishlist = async (wishlistId, itemTitle) => {
    if (!window.confirm(`Remove "${itemTitle}" from your wishlist?`)) {
      return;
    }

    try {
      setRemoving(wishlistId);
      await deleteDoc(doc(db, 'wishlist', wishlistId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
    } finally {
      setRemoving(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const filteredItems = wishlistItems.filter(item => {
    if (filter === 'all') return true;
    return item.itemType === filter.slice(0, -1); // 'trips' -> 'trip', 'hotels' -> 'hotel'
  });

  const getItemCounts = () => {
    const trips = wishlistItems.filter(item => item.itemType === 'trip').length;
    const hotels = wishlistItems.filter(item => item.itemType === 'hotel').length;
    return { trips, hotels, total: wishlistItems.length };
  };

  const counts = getItemCounts();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" text="Loading your wishlist..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Wishlist</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadWishlist();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <HeartSolidIcon className="h-8 w-8 text-red-500 mr-3" />
          My Wishlist
        </h1>
        <p className="text-gray-600">
          {counts.total > 0 
            ? `You have ${counts.total} saved ${counts.total === 1 ? 'item' : 'items'}`
            : 'Start saving your favorite trips and hotels'
          }
        </p>
      </div>

      {/* Filter Tabs */}
      {counts.total > 0 && (
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setFilter('trips')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'trips'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trips ({counts.trips})
            </button>
            <button
              onClick={() => setFilter('hotels')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'hotels'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hotels ({counts.hotels})
            </button>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card hover padding="none" className="overflow-hidden h-full">
                  <div className="relative">
                    <img
                      src={item.itemImage || `https://picsum.photos/400/250?random=${item.itemId}`}
                      alt={item.itemTitle}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.itemType === 'trip' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.itemType === 'trip' ? '✈️ Trip' : '🏨 Hotel'}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <div className="absolute top-3 right-3">
                      <Button
                        onClick={() => handleRemoveFromWishlist(item.id, item.itemTitle)}
                        variant="ghost"
                        size="sm"
                        loading={removing === item.id}
                        className="bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                        icon={<TrashIcon className="h-4 w-4" />}
                      />
                    </div>

                    {/* Price */}
                    {item.itemPrice && (
                      <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                        {formatPrice(item.itemPrice)}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      <QuickRating 
                        itemId={item.itemId} 
                        itemType={item.itemType} 
                        size="sm" 
                      />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {item.itemTitle}
                    </h3>

                    {/* Location */}
                    {item.itemLocation && (
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {item.itemLocation}
                      </div>
                    )}

                    {/* Added Date */}
                    <div className="flex items-center text-gray-500 text-xs mb-4">
                      <HeartIcon className="h-3 w-3 mr-1" />
                      Added {formatDate(item.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link 
                        to={`/${item.itemType}s/${item.itemId}`}
                        className="flex-1"
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          icon={<EyeIcon className="h-4 w-4" />}
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' 
              ? 'Your wishlist is empty'
              : `No ${filter} in your wishlist`
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? 'Start exploring and save your favorite trips and hotels'
              : `Browse ${filter} and add your favorites here`
            }
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/trips">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Browse Trips
              </Button>
            </Link>
            <Link to="/hotels">
              <Button variant="outline">
                Browse Hotels
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
