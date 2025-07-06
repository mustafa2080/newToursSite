import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BookmarkIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReportsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [stats, setStats] = useState({
    overview: {
      totalRevenue: 0,
      totalBookings: 0,
      totalUsers: 0,
      totalTrips: 0,
      totalHotels: 0,
      averageBookingValue: 0,
    },
    bookings: {
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      revenueByStatus: {},
    },
    popular: {
      trips: [],
      hotels: [],
      destinations: [],
    },
    trends: {
      dailyBookings: [],
      monthlyRevenue: [],
      userGrowth: [],
    },
    performance: {
      conversionRate: 0,
      averageRating: 0,
      repeatCustomers: 0,
    }
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading reports data...');

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Load all data in parallel
      const [
        usersData,
        tripsData,
        hotelsData,
        bookingsData,
        ratingsData
      ] = await Promise.all([
        loadUsers(),
        loadTrips(),
        loadHotels(),
        loadBookings(startDate, endDate),
        loadRatings()
      ]);

      // Calculate comprehensive stats
      const calculatedStats = calculateStats({
        users: usersData,
        trips: tripsData,
        hotels: hotelsData,
        bookings: bookingsData,
        ratings: ratingsData,
        startDate,
        endDate
      });

      setStats(calculatedStats);
      console.log('✅ Reports loaded successfully');
    } catch (error) {
      console.error('❌ Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const loadTrips = async () => {
    const tripsSnapshot = await getDocs(collection(db, 'trips'));
    return tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const loadHotels = async () => {
    const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
    return hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const loadBookings = async (startDate, endDate) => {
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    const allBookings = bookingsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || data.bookingDate)
      };
    });

    console.log('📋 All bookings loaded:', allBookings.length);

    // Filter by date range
    const filteredBookings = allBookings.filter(booking => {
      const bookingDate = booking.createdAt;
      return bookingDate >= startDate && bookingDate <= endDate;
    });

    console.log('📋 Filtered bookings for date range:', filteredBookings.length);
    return filteredBookings;
  };

  const loadRatings = async () => {
    const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
    return ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const calculateStats = ({ users, trips, hotels, bookings, ratings, startDate, endDate }) => {
    console.log('📊 Calculating stats with:', {
      users: users.length,
      trips: trips.length,
      hotels: hotels.length,
      bookings: bookings.length,
      ratings: ratings.length
    });

    // Overview calculations - include all bookings for total revenue
    const totalRevenue = bookings.reduce((sum, b) => {
      const amount = b.totalPrice || b.totalAmount || b.amount || 0;
      return sum + amount;
    }, 0);

    // Also calculate confirmed revenue separately
    const confirmedRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || b.amount || 0), 0);

    const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

    console.log('💰 Revenue calculated:', {
      totalRevenue,
      confirmedRevenue,
      averageBookingValue
    });

    // Bookings by status
    const bookingsByStatus = bookings.reduce((acc, booking) => {
      const status = booking.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Revenue by status
    const revenueByStatus = bookings.reduce((acc, booking) => {
      const status = booking.status || 'pending';
      const amount = booking.totalPrice || booking.totalAmount || booking.amount || 0;
      acc[status] = (acc[status] || 0) + amount;
      return acc;
    }, {});

    console.log('📊 Revenue by status:', revenueByStatus);

    // Popular items
    const tripBookings = bookings.filter(b => b.type === 'trip');
    const hotelBookings = bookings.filter(b => b.type === 'hotel');

    const popularTrips = getPopularItems(tripBookings, trips, 'tripId', 'tripTitle');
    const popularHotels = getPopularItems(hotelBookings, hotels, 'hotelId', 'hotelName');

    // Popular destinations
    const destinations = [...tripBookings, ...hotelBookings].reduce((acc, booking) => {
      const location = booking.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    const popularDestinations = Object.entries(destinations)
      .map(([location, count]) => ({ location, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // Performance metrics
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings 
      : 0;

    // User growth (simplified)
    const userGrowth = users.filter(user => {
      const userDate = user.createdAt?.toDate?.() || new Date(user.createdAt);
      return userDate >= startDate && userDate <= endDate;
    }).length;

    const finalStats = {
      overview: {
        totalRevenue,
        totalBookings: bookings.length,
        totalUsers: users.length,
        totalTrips: trips.length,
        totalHotels: hotels.length,
        averageBookingValue,
      },
      bookings: {
        confirmed: bookingsByStatus.confirmed || 0,
        pending: bookingsByStatus.pending || 0,
        cancelled: bookingsByStatus.cancelled || 0,
        revenueByStatus,
      },
      popular: {
        trips: popularTrips,
        hotels: popularHotels,
        destinations: popularDestinations,
      },
      trends: {
        userGrowth,
        dailyBookings: bookings.length, // Simplified
        monthlyRevenue: totalRevenue, // Simplified
      },
      performance: {
        conversionRate: users.length > 0 ? (bookings.length / users.length * 100) : 0,
        averageRating,
        repeatCustomers: 0, // TODO: Calculate repeat customers
      }
    };

    console.log('📊 Final calculated stats:', finalStats.overview);
    return finalStats;
  };

  const getPopularItems = (bookings, items, idField, nameField) => {
    const itemCounts = bookings.reduce((acc, booking) => {
      const itemId = booking[idField];
      const itemName = booking[nameField] || 'Unknown';
      if (itemId || itemName !== 'Unknown') {
        const key = itemId || itemName;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(itemCounts)
      .map(([key, count]) => {
        const item = items.find(i => i.id === key) || {};
        return {
          id: key,
          name: item.title || item.name || key,
          bookings: count,
          revenue: bookings
            .filter(b => (b[idField] === key) || (b[nameField] === key))
            .reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0)
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <Button
            variant="outline"
            onClick={loadReports}
            className="flex items-center"
          >
            🔄 Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log('Export report')}
          >
            📊 Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(stats.overview.totalRevenue),
            icon: CurrencyDollarIcon,
            color: 'green',
            trend: '+12.5%'
          },
          {
            title: 'Total Bookings',
            value: stats.overview.totalBookings.toLocaleString(),
            icon: BookmarkIcon,
            color: 'blue',
            trend: '+8.2%'
          },
          {
            title: 'Total Users',
            value: stats.overview.totalUsers.toLocaleString(),
            icon: UsersIcon,
            color: 'purple',
            trend: '+15.3%'
          },
          {
            title: 'Active Trips',
            value: stats.overview.totalTrips.toLocaleString(),
            icon: MapPinIcon,
            color: 'orange',
            trend: '+5.1%'
          },
          {
            title: 'Active Hotels',
            value: stats.overview.totalHotels.toLocaleString(),
            icon: BuildingOfficeIcon,
            color: 'indigo',
            trend: '+3.7%'
          },
          {
            title: 'Avg Booking Value',
            value: formatCurrency(stats.overview.averageBookingValue),
            icon: ChartBarIcon,
            color: 'pink',
            trend: '+6.9%'
          },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.trend}</span>
                  </div>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bookings Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Status</h3>
          <div className="space-y-4">
            {[
              { status: 'confirmed', label: 'Confirmed', color: 'green', count: stats.bookings.confirmed },
              { status: 'pending', label: 'Pending', color: 'yellow', count: stats.bookings.pending },
              { status: 'cancelled', label: 'Cancelled', color: 'red', count: stats.bookings.cancelled },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 bg-${item.color}-500 rounded-full mr-3`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-500">
                    ({stats.overview.totalBookings > 0 ? ((item.count / stats.overview.totalBookings) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
              <span className="text-sm font-bold text-blue-600">{formatPercentage(stats.performance.conversionRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Average Rating</span>
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="text-sm font-bold text-gray-900">{stats.performance.averageRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">New Users (Period)</span>
              <span className="text-sm font-bold text-green-600">{stats.trends.userGrowth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Trips</h3>
          <div className="space-y-3">
            {stats.popular.trips.length > 0 ? stats.popular.trips.map((trip, index) => (
              <div key={trip.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">{trip.name}</p>
                  <p className="text-xs text-gray-500">{trip.bookings} bookings</p>
                </div>
                <span className="text-sm font-bold text-green-600">{formatCurrency(trip.revenue)}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No trip bookings in this period</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Hotels</h3>
          <div className="space-y-3">
            {stats.popular.hotels.length > 0 ? stats.popular.hotels.map((hotel, index) => (
              <div key={hotel.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">{hotel.name}</p>
                  <p className="text-xs text-gray-500">{hotel.bookings} bookings</p>
                </div>
                <span className="text-sm font-bold text-green-600">{formatCurrency(hotel.revenue)}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No hotel bookings in this period</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h3>
          <div className="space-y-3">
            {stats.popular.destinations.length > 0 ? stats.popular.destinations.map((destination, index) => (
              <div key={destination.location} className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{destination.location}</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{destination.bookings}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No destination data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown by Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.bookings.revenueByStatus).map(([status, revenue]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 capitalize">{status}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
              <p className="text-xs text-gray-500">
                {stats.overview.totalRevenue > 0 ? ((revenue / stats.overview.totalRevenue) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => window.open('/admin/bookings', '_blank')}
            className="flex items-center justify-center"
          >
            <BookmarkIcon className="h-4 w-4 mr-2" />
            View Bookings
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/users', '_blank')}
            className="flex items-center justify-center"
          >
            <UsersIcon className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/trips', '_blank')}
            className="flex items-center justify-center"
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Manage Trips
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/hotels', '_blank')}
            className="flex items-center justify-center"
          >
            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
            Manage Hotels
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;
