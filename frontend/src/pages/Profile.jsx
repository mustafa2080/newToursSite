import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  UserIcon,
  CalendarDaysIcon,
  HeartIcon,
  CogIcon,
  MapPinIcon,
  ClockIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getBookings, cancelBooking } from '../services/firebase/bookings';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SimpleImageUpload from '../components/common/SimpleImageUpload';
import WishlistPage from '../components/wishlist/WishlistPage';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navigation = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'My Bookings', href: '/profile/bookings', icon: CalendarDaysIcon },
    { name: 'Wishlist', href: '/profile/wishlist', icon: HeartIcon },
    { name: 'Settings', href: '/profile/settings', icon: CogIcon },
  ];

  const isActive = (path) => {
    if (path === '/profile') {
      return location.pathname === '/profile';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="relative mx-auto mb-4">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                      onError={(e) => {
                        console.log('❌ Sidebar image load error:', e);
                        console.log('❌ Failed sidebar image URL:', user.profileImage?.substring(0, 100));
                        // Hide broken image and show fallback
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('✅ Sidebar image loaded successfully');
                      }}
                    />
                  ) : null}

                  {/* Fallback Icon */}
                  <div
                    className={`${user?.profileImage ? 'hidden' : 'flex'} w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full items-center justify-center mx-auto border-4 border-white shadow-lg`}
                    style={{ display: user?.profileImage ? 'none' : 'flex' }}
                  >
                    <UserIcon className="h-10 w-10 text-blue-600" />
                  </div>

                  {/* Online indicator */}
                  <div className="absolute bottom-1 right-1/2 transform translate-x-6 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                {user?.role === 'admin' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                    Administrator
                  </span>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route index element={<ProfileOverview user={user} />} />
              <Route path="bookings" element={<MyBookings user={user} />} />
              <Route path="wishlist" element={<MyWishlist user={user} />} />
              <Route path="settings" element={<ProfileSettings user={user} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Overview Component
const ProfileOverview = ({ user }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0,
    wishlistItems: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading stats for user:', user?.uid);

      // Load user statistics from Firebase
      let bookingsResponse;
      if (user?.uid) {
        bookingsResponse = await getBookings({ userId: user.uid });
      } else {
        bookingsResponse = await getBookings({});
      }
      console.log('Bookings API response:', bookingsResponse);

      // Handle Firebase API response structure
      let bookings = [];
      if (bookingsResponse.success && bookingsResponse.bookings) {
        bookings = bookingsResponse.bookings;
      }

      console.log('Processed bookings:', bookings);

      const totalBookings = bookings.length;
      const upcomingTrips = bookings.filter(booking =>
        booking.status === 'confirmed' &&
        new Date(booking.selectedDate || booking.checkInDate) > new Date()
      ).length;

      const completedTrips = bookings.filter(booking =>
        booking.status === 'completed' ||
        (booking.status === 'confirmed' &&
         new Date(booking.selectedDate || booking.checkInDate) < new Date())
      ).length;

      const totalSpent = bookings
        .filter(booking => booking.status === 'confirmed' || booking.status === 'completed')
        .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);

      // Get recent bookings (last 3)
      const recent = bookings
        .sort((a, b) => new Date(b.bookingDate || b.createdAt) - new Date(a.bookingDate || a.createdAt))
        .slice(0, 3);

      setStats({
        totalBookings,
        upcomingTrips,
        completedTrips,
        totalSpent,
        wishlistItems: 0, // Will be implemented with wishlist
      });

      setRecentBookings(recent);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default values on error
      setStats({
        totalBookings: 0,
        upcomingTrips: 0,
        completedTrips: 0,
        totalSpent: 0,
        wishlistItems: 0,
      });
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.displayName || user?.firstName || 'Traveler'}!
        </h1>
        <p className="text-blue-100">Here's an overview of your travel journey</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <CalendarDaysIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-900">{stats.totalBookings}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <MapPinIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-900">{stats.upcomingTrips}</div>
          <div className="text-sm text-gray-600">Upcoming Trips</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <CheckCircleIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-900">{stats.completedTrips}</div>
          <div className="text-sm text-gray-600">Completed Trips</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <CreditCardIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </Card>
      </div>

      {/* User Information Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-gray-900">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{user?.email || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <p className="text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/profile/bookings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {booking.tripTitle || booking.hotelName || 'Booking'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {booking.type === 'hotel' ? 'Hotel Booking' : 'Trip Booking'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.selectedDate || booking.checkInDate || booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatPrice(booking.totalPrice || 0)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/trips">
            <Button fullWidth variant="outline">
              Browse Trips
            </Button>
          </Link>
          <Link to="/hotels">
            <Button fullWidth variant="outline">
              Browse Hotels
            </Button>
          </Link>
          <Link to="/profile/bookings">
            <Button fullWidth variant="outline">
              My Bookings
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

// My Bookings Component
const MyBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, price, status

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading bookings for user:', user?.uid);

      // Get bookings for the current user only
      let response;
      if (user?.uid) {
        console.log('🔍 Getting bookings for user:', user.uid);
        response = await getBookings({ userId: user.uid });
      } else {
        console.log('⚠️ No user logged in, getting all bookings');
        response = await getBookings({});
      }

      console.log('Firebase bookings response:', response);

      // Handle Firebase API response structure
      let bookings = [];
      if (response.success && response.bookings) {
        bookings = response.bookings;
      }

      console.log('User bookings from Firebase:', bookings);
      console.log('User bookings count:', bookings.length);

      // Enrich bookings with additional details
      const enrichedBookings = bookings.map(booking => {
        const travelDate = new Date(booking.selectedDate || booking.checkInDate);
        const now = new Date();

        return {
          ...booking,
          // Calculate status flags
          isUpcoming: booking.status === 'confirmed' && travelDate > now,
          isPast: travelDate < now,
          daysUntilTrip: travelDate > now ?
            Math.ceil((travelDate - now) / (1000 * 60 * 60 * 24)) : null
        };
      });

      setBookings(enrichedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      loadBookings(); // Reload bookings
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="h-5 w-5" />;
      case 'pending': return <ClockIcon className="h-5 w-5" />;
      case 'cancelled': return <XCircleIcon className="h-5 w-5" />;
      default: return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  const filteredBookings = bookings
    .filter(booking => {
      // Filter by status
      if (filter === 'all') return true;
      if (filter === 'upcoming') {
        return booking.status === 'confirmed' &&
          new Date(booking.selectedDate || booking.checkInDate) > new Date();
      }
      if (filter === 'past') {
        return new Date(booking.selectedDate || booking.checkInDate) < new Date();
      }
      if (filter === 'cancelled') {
        return booking.status === 'cancelled';
      }
      return true;
    })
    .filter(booking => {
      // Filter by search term
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (booking.tripTitle || '').toLowerCase().includes(searchLower) ||
        (booking.hotelName || '').toLowerCase().includes(searchLower) ||
        (booking.id || '').toLowerCase().includes(searchLower) ||
        (booking.guestName || '').toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort bookings
      switch (sortBy) {
        case 'date':
          return new Date(b.selectedDate || b.checkInDate || b.bookingDate) -
                 new Date(a.selectedDate || a.checkInDate || a.bookingDate);
        case 'price':
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" text="Loading your bookings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">


      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h1 className="text-4xl font-bold text-gray-900">My Bookings</h1>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Bookings Statistics */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.isUpcoming).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {bookings.filter(b => b.status === 'completed' || b.isPast).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatPrice(bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0))}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </Card>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'upcoming', 'past', 'cancelled'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            <span className="ml-2 text-xs">
              ({bookings.filter(b => {
                if (filterOption === 'all') return true;
                if (filterOption === 'upcoming') return b.isUpcoming;
                if (filterOption === 'past') return b.isPast;
                if (filterOption === 'cancelled') return b.status === 'cancelled';
                return false;
              }).length})
            </span>
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings found.`}
          </p>
          {bookings.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>🔥 Firebase Connected:</strong> No bookings found in the database.
                The bookings collection appears to be empty.
              </p>
            </div>
          )}
          <div className="flex justify-center space-x-4">
            <Link to="/trips">
              <Button>Browse Trips</Button>
            </Link>
            <Link to="/hotels">
              <Button variant="outline">Browse Hotels</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.tripTitle || booking.hotelName || 'Booking'}
                      </h3>
                      {booking.isUpcoming && booking.daysUntilTrip > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {booking.daysUntilTrip} days to go
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Booking ID: {booking.id?.substring(0, 8)}...
                    </p>
                    <p className="text-gray-500 text-sm">
                      {booking.type === 'hotel' ? '🏨 Hotel Booking' : '✈️ Trip Booking'}
                    </p>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1 capitalize">{booking.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {booking.type === 'hotel' ? 'Check-in' : 'Departure'}
                    </p>
                    <p className="font-medium">
                      {new Date(booking.selectedDate || booking.checkInDate).toLocaleDateString()}
                    </p>
                  </div>

                  {booking.type === 'hotel' && booking.checkOutDate && (
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-medium">
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-medium">{booking.numberOfGuests || booking.guests || 1}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-medium text-lg text-green-600">{formatPrice(booking.totalPrice || 0)}</p>
                  </div>
                </div>

                {/* Additional booking details */}
                {(booking.guestName || booking.guestEmail || booking.specialRequests) && (
                  <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Booking Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {booking.guestName && (
                        <div>
                          <span className="text-gray-600">Guest Name: </span>
                          <span className="text-gray-900">{booking.guestName}</span>
                        </div>
                      )}
                      {booking.guestEmail && (
                        <div>
                          <span className="text-gray-600">Contact: </span>
                          <span className="text-gray-900">{booking.guestEmail}</span>
                        </div>
                      )}
                      {booking.roomType && (
                        <div>
                          <span className="text-gray-600">Room Type: </span>
                          <span className="text-gray-900">{booking.roomType}</span>
                        </div>
                      )}
                      {booking.numberOfNights && (
                        <div>
                          <span className="text-gray-600">Nights: </span>
                          <span className="text-gray-900">{booking.numberOfNights}</span>
                        </div>
                      )}
                    </div>
                    {booking.specialRequests && (
                      <div className="mt-2">
                        <span className="text-gray-600">Special Requests: </span>
                        <span className="text-gray-900">{booking.specialRequests}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Booked on {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    {booking.status === 'confirmed' && booking.isUpcoming && (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Confirmed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// My Wishlist Component
const MyWishlist = () => {
  return <WishlistPage />;
};

// Profile Settings Component
const ProfileSettings = ({ user }) => {
  const { updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    bio: user?.bio || '',
    newsletter: user?.newsletter || false,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpdate = (newImageUrl) => {
    // Image update is handled by FirestoreProfileImageUpload component
    console.log('🖼️ Profile picture updated successfully!', newImageUrl);

    // Force a re-render by updating the user context
    // This ensures the new image appears immediately
    if (newImageUrl) {
      console.log('✅ New image URL received:', newImageUrl);
    } else {
      console.log('❌ Image removed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess(true);
        console.log('Profile updated successfully!');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.error(result.error || 'Failed to update profile');
      }
    } catch (updateError) {
      console.error('An error occurred while updating your profile', updateError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>

      {/* Profile Image Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>



        <div className="flex items-center space-x-6">
          <SimpleImageUpload
            currentImage={user?.profileImage}
            onImageUpdate={handleImageUpdate}
            size="large"
          />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Update your photo</h3>
            <p className="text-sm text-gray-500 mt-1">
              This will be displayed on your profile and in your bookings.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG, WebP or GIF. Max size 10MB. Images are automatically compressed for optimal performance.
            </p>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <p className="text-gray-900 font-mono text-sm">{user?.uid || 'Not available'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              user?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.emailVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
            <p className="text-gray-900">
              {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Not available'}
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Enter your email"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Subscribe to newsletter for travel tips and special offers
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
              className={success ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {success ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Statistics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {new Date().getFullYear() - new Date(user?.createdAt || Date.now()).getFullYear() || 0}
            </div>
            <div className="text-sm text-gray-600">Years with us</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {user?.loginCount || 0}
            </div>
            <div className="text-sm text-gray-600">Total logins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {user?.profileCompleteness || 75}%
            </div>
            <div className="text-sm text-gray-600">Profile complete</div>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Last changed: {user?.passwordLastChanged || 'Never'}</p>
            </div>
            <Button variant="outline" size="small">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="small">
              Enable 2FA
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Login Sessions</h3>
              <p className="text-sm text-gray-500">Manage your active sessions</p>
            </div>
            <Button variant="outline" size="small">
              View Sessions
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
