import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  PhotoIcon,
  BookmarkIcon,
  StarIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CreditCardIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CameraIcon,
  DocumentTextIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  getDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  updatePassword, 
  updateEmail, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  updateProfile
} from 'firebase/auth';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';
import { useNotifications } from '../contexts/NotificationsContext';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import NotificationsTab from '../components/profile/NotificationsTab';

const UserProfile = () => {
  const [user, loading, error] = useAuthState(auth);
  const { createProfileUpdateNotification } = useNotifications();
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const [reviewForm, setReviewForm] = useState({
    bookingId: '',
    rating: 5,
    title: '',
    comment: '',
    isEditing: false,
    editingId: null
  });

  // Load user data and set up real-time listeners
  useEffect(() => {
    console.log('🔄 UserProfile useEffect triggered');
    console.log('👤 User from AuthContext:', {
      exists: !!user,
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      fullUser: user
    });

    if (user && user.uid) {
      console.log('✅ User exists with UID, loading data...');
      loadUserData();
      const unsubscribeBookings = setupBookingsListener();
      const unsubscribeReviews = setupReviewsListener();

      // Cleanup function
      return () => {
        if (unsubscribeBookings) unsubscribeBookings();
        if (unsubscribeReviews) unsubscribeReviews();
      };
    } else {
      console.log('❌ No user found or missing UID');
      setDataLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      console.log('🔍 Loading user data for UID:', user.uid);
      console.log('👤 Firebase Auth user:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        firstName: user.firstName,
        lastName: user.lastName
      });

      // First, set basic data from AuthContext (which includes Firestore data)
      const authBasedData = {
        firstName: user.firstName || user.displayName?.split(' ')[0] || '',
        lastName: user.lastName || user.displayName?.split(' ')[1] || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        bio: user.bio || '',
        photoURL: user.photoURL || '',
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date()
      };

      console.log('📝 Auth-based data:', authBasedData);

      // Set initial data from auth
      setUserData(authBasedData);
      setProfileForm(authBasedData);

      // Try to load from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        console.log('✅ Firestore user data found:', firestoreData);

        // Merge Firestore data with auth data
        const mergedData = {
          ...authBasedData,
          ...firestoreData,
          email: firestoreData.email || user.email // Prefer Firestore email but fallback to auth
        };

        setUserData(mergedData);
        setProfileForm({
          firstName: mergedData.firstName || '',
          lastName: mergedData.lastName || '',
          email: mergedData.email || '',
          phone: mergedData.phone || '',
          dateOfBirth: mergedData.dateOfBirth || '',
          address: mergedData.address || '',
          bio: mergedData.bio || ''
        });
      } else {
        console.log('📝 No Firestore document found, creating default profile');

        try {
          await setDoc(doc(db, 'users', user.uid), {
            ...authBasedData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('✅ Default user document created');
        } catch (createError) {
          console.error('⚠️ Failed to create user document:', createError);
          // Continue anyway with auth data
        }
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);

      // Fallback to auth data even if Firestore fails
      const fallbackData = {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        address: '',
        bio: '',
        photoURL: user.photoURL || ''
      };

      setUserData(fallbackData);
      setProfileForm(fallbackData);

      toast.error('Some profile data may not be available');
    } finally {
      setDataLoading(false);
    }
  };

  const setupBookingsListener = () => {
    try {
      console.log('🔍 Setting up bookings listener for user:', user.uid);
      console.log('🔍 User object:', { uid: user.uid, email: user.email });

      // First, let's check all bookings to see what's in the database
      const allBookingsQuery = collection(db, 'bookings');

      const unsubscribeAll = onSnapshot(allBookingsQuery, (allSnapshot) => {
        console.log('🗂️ ALL bookings in database:', allSnapshot.docs.length);
        allSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('📄 All booking doc:', {
            id: doc.id,
            userId: data.userId,
            userIdType: typeof data.userId,
            currentUserId: user.uid,
            currentUserIdType: typeof user.uid,
            match: data.userId === user.uid,
            tripTitle: data.tripTitle,
            hotelName: data.hotelName
          });
        });
      });

      // Now set up the filtered query
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
        console.log('📋 User bookings snapshot received, docs count:', snapshot.docs.length);

        const bookingsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📄 User booking doc:', { id: doc.id, ...data });

          return {
            id: doc.id,
            ...data,
            // Ensure dates are properly formatted
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            selectedDate: data.selectedDate || data.departureDate || data.checkInDate,
            bookingDate: data.bookingDate || data.createdAt?.toDate?.()?.toISOString()
          };
        });

        // Sort by creation date (newest first)
        bookingsData.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        console.log('✅ Processed user bookings:', bookingsData);
        setBookings(bookingsData);
      }, (error) => {
        console.error('❌ Error in bookings listener:', error);
        toast.error('Failed to load bookings');
      });

      return () => {
        unsubscribe();
        unsubscribeAll();
      };
    } catch (error) {
      console.error('❌ Error setting up bookings listener:', error);
      toast.error('Failed to setup bookings listener');
    }
  };

  const setupReviewsListener = () => {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
    });

    return unsubscribe;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...profileForm,
        updatedAt: serverTimestamp()
      });

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: `${profileForm.firstName} ${profileForm.lastName}`
      });

      // Update email if changed
      if (profileForm.email !== user.email) {
        await updateEmail(user, profileForm.email);
      }

      setUserData(prev => ({ ...prev, ...profileForm }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');

      // Create notification for profile update
      try {
        await createProfileUpdateNotification();
      } catch (notificationError) {
        console.error('❌ Failed to create profile update notification:', notificationError);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });
      setShowPasswordForm(false);
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to update password');
      }
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      // Delete old avatar if exists
      if (userData?.photoURL) {
        try {
          const oldRef = ref(storage, userData.photoURL);
          await deleteObject(oldRef);
        } catch (error) {
          console.log('Old avatar not found or already deleted');
        }
      }

      // Upload new avatar
      const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile
      await updateProfile(user, { photoURL: downloadURL });
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL,
        updatedAt: serverTimestamp()
      });

      setUserData(prev => ({ ...prev, photoURL: downloadURL }));
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const booking = bookings.find(b => b.id === reviewForm.bookingId);
      if (!booking) {
        toast.error('Booking not found');
        return;
      }

      const reviewData = {
        userId: user.uid,
        userName: `${userData.firstName} ${userData.lastName}`,
        userPhoto: userData.photoURL || null,
        bookingId: reviewForm.bookingId,
        tripId: booking.tripId || null,
        hotelId: booking.hotelId || null,
        tripTitle: booking.tripTitle || null,
        hotelName: booking.hotelName || null,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isApproved: false
      };

      if (reviewForm.isEditing) {
        await updateDoc(doc(db, 'reviews', reviewForm.editingId), {
          ...reviewData,
          createdAt: undefined // Don't update creation date
        });
        toast.success('Review updated successfully!');
      } else {
        await addDoc(collection(db, 'reviews'), reviewData);
        toast.success('Review submitted successfully!');
      }

      setReviewForm({
        bookingId: '',
        rating: 5,
        title: '',
        comment: '',
        isEditing: false,
        editingId: null
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleEditReview = (review) => {
    setReviewForm({
      bookingId: review.bookingId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isEditing: true,
      editingId: review.id
    });
    setActiveTab('reviews');
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status !== 'confirmed') return false;
    
    const departureDate = booking.departureDate?.toDate() || booking.checkInDate?.toDate();
    if (!departureDate) return false;
    
    const now = new Date();
    const timeDiff = departureDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff > 1; // Can cancel if more than 1 day before departure
  };

  const canReviewBooking = (booking) => {
    if (booking.status !== 'completed') return false;

    // Check if user already reviewed this booking
    const existingReview = reviews.find(r => r.bookingId === booking.id);
    return !existingReview;
  };

  // Debug function to add sample booking using Firebase service
  const addSampleBooking = async () => {
    try {
      console.log('🧪 Adding sample booking for user:', user.uid);

      const sampleBooking = {
        userId: user.uid,
        tripTitle: 'Sample Trip to Paris',
        type: 'trip',
        numberOfParticipants: 2,
        selectedDate: new Date().toISOString(),
        totalPrice: 1500,
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingReference: `TRP-${Date.now()}`,
        firstName: userData?.firstName || 'John',
        lastName: userData?.lastName || 'Doe',
        email: user.email,
        phone: '+1234567890',
        specialRequests: 'Sample special request for testing',
        location: 'Paris, France'
      };

      console.log('🧪 Sample booking data:', sampleBooking);

      // Use Firebase service directly
      const { createBooking } = await import('../../services/firebase/bookings');
      const result = await createBooking(sampleBooking);

      console.log('🧪 Sample booking result:', result);

      if (result.success) {
        toast.success('Sample booking added successfully!');
      } else {
        toast.error(`Failed to add sample booking: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error adding sample booking:', error);
      toast.error('Failed to add sample booking');
    }
  };

  // Debug function to add sample booking using bookingsAPI
  const addSampleBookingAPI = async () => {
    try {
      console.log('🧪 Adding sample booking via API for user:', user.uid);

      const sampleBooking = {
        userId: user.uid,
        tripTitle: 'API Sample Trip to Tokyo',
        type: 'trip',
        numberOfParticipants: 1,
        selectedDate: new Date().toISOString(),
        totalPrice: 2000,
        status: 'pending',
        paymentStatus: 'pending',
        bookingReference: `API-${Date.now()}`,
        firstName: userData?.firstName || 'Jane',
        lastName: userData?.lastName || 'Smith',
        email: user.email,
        phone: '+1987654321',
        specialRequests: 'API test booking',
        location: 'Tokyo, Japan'
      };

      console.log('🧪 API Sample booking data:', sampleBooking);

      // Use bookingsAPI
      const { bookingsAPI } = await import('../../utils/firebaseApi');
      const result = await bookingsAPI.create(sampleBooking);

      console.log('🧪 API Sample booking result:', result);

      toast.success('API Sample booking added successfully!');
    } catch (error) {
      console.error('❌ Error adding API sample booking:', error);
      toast.error(`Failed to add API sample booking: ${error.message}`);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'bookings', name: 'My Bookings', icon: BookmarkIcon },
    { id: 'reviews', name: 'My Reviews', icon: StarIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {userData?.photoURL || user.photoURL ? (
                    <img
                      src={userData?.photoURL || user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <LoadingSpinner size="small" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {(userData?.firstName && userData?.lastName)
                    ? `${userData.firstName} ${userData.lastName}`
                    : (user?.firstName && user?.lastName)
                    ? `${user.firstName} ${user.lastName}`
                    : user?.displayName || 'User Profile'
                  }
                </h1>
                <p className="text-gray-600">{userData?.email || user?.email || 'No email'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
                {tab.id === 'bookings' && bookings.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-1">
                    {bookings.length}
                  </span>
                )}
                {tab.id === 'reviews' && reviews.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-600 text-xs rounded-full px-2 py-1">
                    {reviews.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        icon={<PencilIcon />}
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={profileForm.firstName || userData?.firstName || user?.firstName || user?.displayName?.split(' ')[0] || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your first name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={profileForm.lastName || userData?.lastName || user?.lastName || user?.displayName?.split(' ')[1] || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileForm.email || userData?.email || user?.email || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={profileForm.dateOfBirth}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Enter your address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                          disabled={!isEditing}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {isEditing && (
                        <div className="flex space-x-4">
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </form>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mx-auto mb-4">
                          {userData?.photoURL || user.photoURL ? (
                            <img
                              src={userData?.photoURL || user.photoURL}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-16 h-16 text-gray-400" />
                          )}
                        </div>
                        {uploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <LoadingSpinner size="small" />
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                          <CameraIcon className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Click the camera icon to upload a new photo
                      </p>
                    </div>
                  </Card>

                  {/* Security Settings */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        variant="outline"
                        icon={<KeyIcon />}
                        className="w-full justify-start"
                      >
                        Change Password
                      </Button>

                      <AnimatePresence>
                        {showPasswordForm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-4 border-t">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Current Password
                                </label>
                                <div className="relative">
                                  <input
                                    type={passwordForm.showCurrentPassword ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter current password"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setPasswordForm(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {passwordForm.showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  New Password
                                </label>
                                <div className="relative">
                                  <input
                                    type={passwordForm.showNewPassword ? 'text' : 'password'}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setPasswordForm(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {passwordForm.showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Confirm New Password
                                </label>
                                <div className="relative">
                                  <input
                                    type={passwordForm.showConfirmPassword ? 'text' : 'password'}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setPasswordForm(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {passwordForm.showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                  </button>
                                </div>
                              </div>

                              <div className="flex space-x-3">
                                <Button type="submit" size="small" className="bg-blue-600 hover:bg-blue-700">
                                  Update Password
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="small"
                                  onClick={() => setShowPasswordForm(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>

                  {/* Account Stats */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Bookings</span>
                        <span className="font-semibold text-gray-900">{bookings.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reviews Written</span>
                        <span className="font-semibold text-gray-900">{reviews.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Member Since</span>
                        <span className="font-semibold text-gray-900">
                          {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Debug Info */}
                  <Card className="p-6 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Debug Info</h3>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div><strong>User ID:</strong> {user?.uid || 'None'}</div>
                      <div><strong>Auth Email:</strong> {user?.email || 'None'}</div>
                      <div><strong>Display Name:</strong> {user?.displayName || 'None'}</div>
                      <div><strong>First Name:</strong> {user?.firstName || 'None'}</div>
                      <div><strong>Last Name:</strong> {user?.lastName || 'None'}</div>
                      <div><strong>Profile Data:</strong> {userData ? 'Loaded' : 'Not loaded'}</div>
                      <div><strong>Bookings Count:</strong> {bookings.length}</div>
                      <div><strong>Data Loading:</strong> {dataLoading ? 'Yes' : 'No'}</div>
                      <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
                      <div><strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}</div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => console.log('Current user object:', user)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Log User Object
                        </button>
                        <button
                          onClick={() => console.log('Current userData:', userData)}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Log UserData
                        </button>
                        <button
                          onClick={() => console.log('Current bookings:', bookings)}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                        >
                          Log Bookings
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
                  <span className="text-sm text-gray-500">
                    {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <BookmarkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-500 mb-4">Start exploring our amazing trips and hotels!</p>
                    <div className="space-y-3">
                      <Button onClick={() => navigate('/trips')}>Browse Trips</Button>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="outline"
                          onClick={addSampleBooking}
                          className="text-blue-600 border-blue-300"
                        >
                          Add Sample Booking (Firebase Direct)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={addSampleBookingAPI}
                          className="text-green-600 border-green-300"
                        >
                          Add Sample Booking (API)
                        </Button>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>Debug: User ID: {user.uid}</div>
                        <div>Bookings Found: {bookings.length}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {booking.tripTitle || booking.hotelName}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                {booking.selectedDate ? (
                                  <span>Date: {formatDate(booking.selectedDate)}</span>
                                ) : booking.departureDate ? (
                                  <span>Departure: {formatDate(booking.departureDate)}</span>
                                ) : booking.checkInDate ? (
                                  <span>
                                    {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                                  </span>
                                ) : (
                                  <span>Date: Not specified</span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-2" />
                                <span>
                                  {booking.numberOfParticipants || booking.numberOfGuests || 1}
                                  {' '}
                                  {(booking.numberOfParticipants || booking.numberOfGuests || 1) === 1 ? 'person' : 'people'}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <CreditCardIcon className="h-4 w-4 mr-2" />
                                <span>{formatCurrency(booking.totalPrice || booking.totalAmount || 0)}</span>
                              </div>
                            </div>

                            {/* Additional booking details */}
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                              {booking.type && (
                                <div>Type: {booking.type === 'trip' ? 'Trip' : 'Hotel'}</div>
                              )}
                              {booking.bookingReference && (
                                <div>Ref: {booking.bookingReference}</div>
                              )}
                              {booking.numberOfRooms && (
                                <div>Rooms: {booking.numberOfRooms}</div>
                              )}
                              {booking.roomType && (
                                <div>Room: {booking.roomType}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex flex-col space-y-1">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getBookingStatusColor(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus || 'pending')}`}>
                                Payment: {(booking.paymentStatus || 'pending').charAt(0).toUpperCase() + (booking.paymentStatus || 'pending').slice(1)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Booked {formatDate(booking.createdAt)}
                            </span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>Special Requests:</strong> {booking.specialRequests}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-500">
                            Booking Reference: <span className="font-mono">{booking.bookingReference}</span>
                          </div>
                          <div className="flex space-x-2">
                            {canCancelBooking(booking) && (
                              <Button
                                onClick={() => handleCancelBooking(booking.id)}
                                variant="outline"
                                size="small"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Cancel Booking
                              </Button>
                            )}
                            {canReviewBooking(booking) && (
                              <Button
                                onClick={() => {
                                  setReviewForm(prev => ({ ...prev, bookingId: booking.id }));
                                  setActiveTab('reviews');
                                }}
                                size="small"
                                icon={<StarIcon />}
                              >
                                Write Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {/* Write Review Form */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {reviewForm.isEditing ? 'Edit Review' : 'Write a Review'}
                  </h2>

                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    {!reviewForm.isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Booking
                        </label>
                        <select
                          value={reviewForm.bookingId}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, bookingId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Choose a completed booking...</option>
                          {bookings
                            .filter(booking => canReviewBooking(booking))
                            .map(booking => (
                              <option key={booking.id} value={booking.id}>
                                {booking.tripTitle || booking.hotelName} - {formatDate(booking.createdAt)}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="focus:outline-none"
                          >
                            <StarSolidIcon
                              className={`h-8 w-8 ${
                                star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                              } hover:text-yellow-400 transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Title
                      </label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Give your review a title..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Share your experience..."
                        required
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {reviewForm.isEditing ? 'Update Review' : 'Submit Review'}
                      </Button>
                      {reviewForm.isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setReviewForm({
                            bookingId: '',
                            rating: 5,
                            title: '',
                            comment: '',
                            isEditing: false,
                            editingId: null
                          })}
                        >
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>

                {/* My Reviews */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">My Reviews</h2>
                    <span className="text-sm text-gray-500">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-500">Complete a booking to write your first review!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review, index) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <StarSolidIcon
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                For: {review.tripTitle || review.hotelName}
                              </p>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditReview(review)}
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Edit review"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete review"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="text-right">
                                <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                  review.isApproved
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {review.isApproved ? (
                                    <>
                                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                                      Approved
                                    </>
                                  ) : (
                                    <>
                                      <ClockIcon className="h-3 w-3 mr-1" />
                                      Pending
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NotificationsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserProfile;
