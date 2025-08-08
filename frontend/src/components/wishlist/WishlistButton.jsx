import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import Button from '../common/Button';

const WishlistButton = ({ 
  itemId, 
  itemType, 
  itemTitle,
  itemImage,
  itemPrice,
  itemLocation,
  size = 'md',
  variant = 'ghost',
  showText = true,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuth();
  const { createFavoriteNotification } = useNotifications();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlistDocId, setWishlistDocId] = useState(null);

  // Size configurations
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  useEffect(() => {
    if (isAuthenticated && user && itemId) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, user, itemId]);

  const checkWishlistStatus = async () => {
    try {
      const wishlistRef = collection(db, 'wishlist');
      const q = query(
        wishlistRef,
        where('userId', '==', user.uid),
        where('itemId', '==', itemId),
        where('itemType', '==', itemType)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setIsInWishlist(true);
        setWishlistDocId(snapshot.docs[0].id);
      } else {
        setIsInWishlist(false);
        setWishlistDocId(null);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      // Set default state on error
      setIsInWishlist(false);
      setWishlistDocId(null);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to your wishlist');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      if (isInWishlist) {
        // Remove from wishlist
        if (wishlistDocId) {
          await deleteDoc(doc(db, 'wishlist', wishlistDocId));
          setIsInWishlist(false);
          setWishlistDocId(null);
        }
      } else {
        // Add to wishlist
        const wishlistData = {
          userId: user.uid,
          userName: user.displayName || user.email || 'User',
          userEmail: user.email,
          itemId,
          itemType,
          itemTitle,
          itemImage: itemImage || null,
          itemPrice: itemPrice || null,
          itemLocation: itemLocation || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'wishlist'), wishlistData);
        setIsInWishlist(true);
        setWishlistDocId(docRef.id);

        // Create notification for adding to favorites
        try {
          await createFavoriteNotification({
            id: itemId,
            title: itemTitle || 'Item',
            name: itemTitle || 'Item',
            type: itemType
          });
        } catch (notificationError) {
          console.error('❌ Failed to create favorite notification:', notificationError);
          // Don't fail the wishlist operation if notification fails
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const HeartComponent = isInWishlist ? HeartSolidIcon : HeartIcon;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      <Button
        onClick={handleWishlistToggle}
        variant={variant}
        size={size}
        loading={loading}
        disabled={loading}
        className={`
          ${isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}
          transition-colors duration-200
        `}
        icon={
          <HeartComponent 
            className={`${sizeClasses[size]} ${isInWishlist ? 'text-red-500' : 'text-gray-500'}`} 
          />
        }
      >
        {showText && (
          <span className="ml-1">
            {loading ? 'Loading...' : isInWishlist ? 'Saved' : 'Save'}
          </span>
        )}
      </Button>
    </motion.div>
  );
};

export default WishlistButton;
