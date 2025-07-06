import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapIcon,
  BuildingOfficeIcon,
  UsersIcon,
  BookmarkIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  StarIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [chartData, setChartData] = useState({
    revenue: { labels: [], data: [] },
    bookings: { labels: [], data: [] },
    users: { labels: [], data: [] }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Debug effect to log stats changes
  useEffect(() => {
    if (stats.reviews) {
      console.log('📊 Stats updated - Ratings total:', stats.reviews.total);
    }
  }, [stats]);



  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading dashboard data from Firebase...');

      // Load trips data
      console.log('📍 Loading trips...');
      const tripsSnapshot = await getDocs(collection(db, 'trips'));
      const trips = tripsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt || new Date()
      }));
      console.log('📍 Trips loaded:', trips.length, trips);

      // Load hotels data
      console.log('🏨 Loading hotels...');
      const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
      const hotels = hotelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt || new Date()
      }));
      console.log('🏨 Hotels loaded:', hotels.length, hotels);

      // Load bookings data (without orderBy to avoid index issues)
      console.log('📋 Loading bookings...');
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('📋 Bookings loaded:', bookings.length, bookings);

      // Load ratings data (reviews)
      console.log('⭐ Loading ratings...');
      const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
      const ratings = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || new Date()
      }));
      console.log('⭐ Ratings loaded:', ratings.length);

      // Load users data
      console.log('👥 Loading users...');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('👥 Users loaded:', users.length, users);

      // Calculate real stats from Firebase data
      const totalRevenue = bookings.reduce((sum, booking) => {
        const amount = booking.totalAmount || booking.totalPrice || booking.amount || 0;
        return sum + amount;
      }, 0);

      const totalReviews = ratings.length;
      const pendingReviews = ratings.filter(rating =>
        rating.status === 'pending' || rating.status === 'waiting' || !rating.status
      ).length;

      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => {
            const ratingValue = rating.rating || rating.stars || 0;
            return sum + ratingValue;
          }, 0) / ratings.length
        : 0;

      console.log('📊 Stats calculated - Total Ratings:', totalReviews, 'Pending:', pendingReviews, 'Avg Rating:', averageRating);

      // Today's bookings
      const today = new Date();
      const todayBookings = bookings.filter(booking => {
        const bookingDate = booking.createdAt?.toDate?.() ||
                           (booking.createdAt ? new Date(booking.createdAt) : new Date());
        return bookingDate.toDateString() === today.toDateString();
      }).length;

      // This month's bookings
      const thisMonth = new Date();
      const thisMonthBookings = bookings.filter(booking => {
        const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
        return bookingDate.getMonth() === thisMonth.getMonth() &&
               bookingDate.getFullYear() === thisMonth.getFullYear();
      }).length;

      // Last month's bookings for comparison
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthBookings = bookings.filter(booking => {
        const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
        return bookingDate.getMonth() === lastMonth.getMonth() &&
               bookingDate.getFullYear() === lastMonth.getFullYear();
      }).length;

      // This month's revenue
      const thisMonthRevenue = bookings
        .filter(booking => {
          const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
          return bookingDate.getMonth() === thisMonth.getMonth() &&
                 bookingDate.getFullYear() === thisMonth.getFullYear();
        })
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      // Last month's revenue for comparison
      const lastMonthRevenue = bookings
        .filter(booking => {
          const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
          return bookingDate.getMonth() === lastMonth.getMonth() &&
                 bookingDate.getFullYear() === lastMonth.getFullYear();
        })
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      // Calculate total views from trips and hotels
      const totalViews = trips.reduce((sum, trip) => sum + (trip.viewCount || trip.views || 0), 0) +
                        hotels.reduce((sum, hotel) => sum + (hotel.viewCount || hotel.views || 0), 0);

      // Active users (users who have bookings or ratings)
      const activeUserIds = new Set([
        ...bookings.map(b => b.userId || b.user_id || b.userEmail).filter(Boolean),
        ...ratings.map(r => r.userId || r.user_id || r.userEmail).filter(Boolean)
      ]);
      const activeUsers = Math.max(activeUserIds.size, users.length);

      // Generate recent activity from real data
      const recentActivity = [];

      // Add recent bookings to activity
      const recentBookingsActivity = bookings
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 3)
        .map(booking => ({
          description: `New booking: ${booking.tripTitle || booking.hotelName || 'Trip/Hotel'} by ${booking.userName || 'User'}`,
          time: getTimeAgo(booking.createdAt?.toDate?.() || new Date(booking.createdAt)),
          type: 'booking'
        }));

      // Add recent ratings to activity
      const recentRatingsActivity = ratings
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 2)
        .map(rating => ({
          description: `New rating: ${rating.rating} stars for ${rating.itemTitle || 'Item'}`,
          time: getTimeAgo(rating.createdAt?.toDate?.() || new Date(rating.createdAt)),
          type: 'review'
        }));

      // Get recent ratings for display
      const recentReviews = ratings
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 5);

      // Add recent trips/hotels to activity
      const recentTripsActivity = trips
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 1)
        .map(trip => ({
          description: `New trip added: ${trip.title}`,
          time: getTimeAgo(trip.createdAt?.toDate?.() || new Date(trip.createdAt)),
          type: 'trip'
        }));

      // Combine and sort all activities
      recentActivity.push(...recentBookingsActivity, ...recentRatingsActivity, ...recentTripsActivity);
      recentActivity.sort((a, b) => {
        // Sort by time (most recent first)
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
        return timeB - timeA;
      });

      const statsData = {
        revenue: {
          total: totalRevenue,
          current: thisMonthRevenue,
          previous: lastMonthRevenue
        },
        bookings: {
          total: bookings.length,
          current: thisMonthBookings,
          previous: lastMonthBookings,
          today: todayBookings
        },
        users: {
          active: activeUsers,
          current: activeUsers,
          previous: Math.max(0, activeUsers - 1) // Simple approximation
        },
        pageViews: {
          total: totalViews,
          current: totalViews,
          previous: Math.max(0, totalViews - Math.floor(totalViews * 0.1)) // Simple approximation
        },
        trips: { total: trips.length },
        hotels: { total: hotels.length },
        reviews: {
          pending: pendingReviews,
          total: totalReviews,
          averageRating: averageRating
        },
        recentActivity: recentActivity.slice(0, 5) // Show only 5 most recent
      };

      console.log('📊 Final stats - Total Ratings:', totalReviews, 'Total Bookings:', bookings.length);

      setStats({
        ...statsData,
        recentReviews: recentReviews
      });
      setRecentBookings(bookings.slice(0, 5));

      // Set trips and hotels for display - show first 3 items
      const displayTrips = trips.slice(0, 3);
      const displayHotels = hotels.slice(0, 3);

      setFeaturedTrips(displayTrips);
      setFeaturedHotels(displayHotels);

      // Generate chart data for the last 7 days
      const chartLabels = [];
      const revenueData = [];
      const bookingsData = [];
      const usersData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        chartLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Revenue for this day
        const dayRevenue = bookings
          .filter(b => {
            const bookingDate = (b.createdAt?.toDate?.() || new Date(b.createdAt)).toISOString().split('T')[0];
            return bookingDate === dateStr && (b.status === 'confirmed' || b.paymentStatus === 'paid');
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        revenueData.push(dayRevenue);

        // Bookings for this day
        const dayBookings = bookings.filter(b => {
          const bookingDate = (b.createdAt?.toDate?.() || new Date(b.createdAt)).toISOString().split('T')[0];
          return bookingDate === dateStr;
        }).length;
        bookingsData.push(dayBookings);

        // Users registered this day
        const dayUsers = users.filter(u => {
          const userDate = (u.createdAt?.toDate?.() || new Date(u.createdAt)).toISOString().split('T')[0];
          return userDate === dateStr;
        }).length;
        usersData.push(dayUsers);
      }

      setChartData({
        revenue: { labels: chartLabels, data: revenueData },
        bookings: { labels: chartLabels, data: bookingsData },
        users: { labels: chartLabels, data: usersData }
      });

      console.log('✅ Dashboard data loaded successfully!');
      console.log(`🎯 Display trips: ${displayTrips.length}, hotels: ${displayHotels.length}`);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      console.error('Error details:', error.message, error.stack);

      // Set default stats if Firebase fails
      const defaultStats = {
        revenue: { total: 0, current: 0, previous: 0 },
        bookings: { total: 0, current: 0, previous: 0, today: 0 },
        users: { active: 0, current: 0, previous: 0 },
        pageViews: { total: 0, current: 0, previous: 0 },
        trips: { total: 0 },
        hotels: { total: 0 },
        reviews: { pending: 0, total: 0, averageRating: 0 }
      };

      console.log('🔄 Setting default stats:', defaultStats);
      setStats(defaultStats);
      setRecentBookings([]);
      setFeaturedTrips([]);
      setFeaturedHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getPercentageChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  const renderStars = (rating, showNumber = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }

    return (
      <div className="flex items-center">
        {stars}
        {showNumber && <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderLineChart = (data, color = 'blue', title = '') => {
    const maxValue = Math.max(...data.data, 1);
    const minValue = Math.min(...data.data, 0);
    const range = maxValue - minValue || 1;

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="relative h-32 flex items-end justify-between px-1">
          {data.data.map((value, index) => {
            const height = maxValue > 0 ? ((value - minValue) / range) * 100 + 10 : 10;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-1.5 bg-${color}-500 rounded-t transition-all duration-500 hover:bg-${color}-600`}
                  style={{ height: `${height}px` }}
                  title={`${data.labels[index]}: ${value}`}
                />
                <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                  {data.labels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };





  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.revenue?.total || 0),
      change: getPercentageChange(stats.revenue?.current, stats.revenue?.previous),
      icon: CurrencyDollarIcon,
      color: 'green',
    },
    {
      title: 'Total Bookings',
      value: formatNumber(stats.bookings?.total || 0),
      change: getPercentageChange(stats.bookings?.current, stats.bookings?.previous),
      icon: BookmarkIcon,
      color: 'blue',
    },
    {
      title: 'Active Users',
      value: formatNumber(stats.users?.active || 0),
      change: getPercentageChange(stats.users?.current, stats.users?.previous),
      icon: UsersIcon,
      color: 'purple',
    },
    {
      title: 'Page Views',
      value: formatNumber(stats.pageViews?.total || 0),
      change: getPercentageChange(stats.pageViews?.current, stats.pageViews?.previous),
      icon: EyeIcon,
      color: 'orange',
    },
  ];

  const quickStats = [
    {
      title: 'Total Trips',
      value: stats.trips?.total || 0,
      link: '/admin/trips',
      icon: MapIcon,
    },
    {
      title: 'Total Hotels',
      value: stats.hotels?.total || 0,
      link: '/admin/hotels',
      icon: BuildingOfficeIcon,
    },
    {
      title: 'Total Reviews',
      value: stats.reviews?.total || 0,
      link: '/admin/reviews',
      icon: StarIcon,
      subtitle: stats.reviews?.averageRating ? `${stats.reviews.averageRating.toFixed(1)} avg rating` :
                (stats.reviews?.total === 0 ? 'No reviews yet' : null)
    },
    {
      title: 'Today\'s Bookings',
      value: stats.bookings?.today || 0,
      link: '/admin/bookings',
      icon: CalendarDaysIcon,
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="small"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs"
          >
            🔄 Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {parseFloat(stat.change) >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${
                      parseFloat(stat.change) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card hover className="p-3 text-center">
                <stat.icon className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.title}</p>
                {stat.subtitle && (
                  <p className="text-xs text-blue-600 mt-1">{stat.subtitle}</p>
                )}
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Overview</h3>
          <p className="text-sm text-gray-600">Last 7 days performance charts</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderLineChart(chartData.revenue, 'green', '💰 Revenue Trend')}
          {renderLineChart(chartData.bookings, 'blue', '📋 Bookings Trend')}
          {renderLineChart(chartData.users, 'purple', '👥 User Registrations')}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Bookings</h3>
              <Link to="/admin/bookings" className="text-blue-600 hover:text-blue-700 text-xs">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.tripTitle || booking.hotelName || booking.itemName || 'Booking'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {booking.userName || booking.userEmail || 'User'} • {
                          booking.createdAt?.toDate ?
                          booking.createdAt.toDate().toLocaleDateString() :
                          new Date(booking.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(booking.totalAmount || 0)}
                      </p>
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-3 text-sm">No recent bookings</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              <Link to="/admin/analytics" className="text-blue-600 hover:text-blue-700 text-xs">
                View analytics
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity, index) => {
                  const getActivityColor = (type) => {
                    switch (type) {
                      case 'booking': return 'bg-green-500';
                      case 'review': return 'bg-yellow-500';
                      case 'trip': return 'bg-blue-500';
                      case 'hotel': return 'bg-purple-500';
                      default: return 'bg-gray-500';
                    }
                  };

                  return (
                    <div key={index} className="flex items-start space-x-2">
                      <div className={`flex-shrink-0 w-1.5 h-1.5 ${getActivityColor(activity.type)} rounded-full mt-1.5`}></div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-3 text-sm">No recent activity</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Featured Trips & Hotels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Featured Trips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Trips ({featuredTrips.length})
              </h3>
              <Link to="/admin/trips" className="text-blue-600 hover:text-blue-700 text-xs">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {featuredTrips.length > 0 ? (
                featuredTrips.map((trip) => (
                  <Link key={trip.id} to={`/trips/${trip.slug}`} className="block">
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                      <img
                        src={trip.mainImage || trip.main_image || 'https://picsum.photos/60/60?random=100'}
                        alt={trip.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {trip.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {renderStars(trip.averageRating || trip.average_rating || 0)}
                          <span className="text-xs text-gray-600">
                            ({trip.reviewCount || trip.review_count || 0})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{trip.durationDays || trip.duration_days || 'N/A'} days</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(trip.price || 0)}
                        </p>
                        <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Featured
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4">
                  <MapIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">No trips found</p>
                  <Link to="/admin/trips/new" className="text-blue-600 hover:text-blue-700 text-xs">
                    Add your first trip
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Featured Hotels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Hotels ({featuredHotels.length})
              </h3>
              <Link to="/admin/hotels" className="text-blue-600 hover:text-blue-700 text-xs">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {featuredHotels.length > 0 ? (
                featuredHotels.map((hotel) => (
                  <Link key={hotel.id} to={`/hotels/${hotel.slug}`} className="block">
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                      <img
                        src={hotel.mainImage || hotel.main_image || 'https://picsum.photos/60/60?random=200'}
                        alt={hotel.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {hotel.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {renderStars(hotel.averageRating || hotel.average_rating || 0)}
                          <span className="text-xs text-gray-600">
                            ({hotel.reviewCount || hotel.review_count || 0})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <BuildingOfficeIcon className="h-3 w-3" />
                          <span>{hotel.location || hotel.city || 'Location'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(hotel.pricePerNight || hotel.price_per_night || 0)}/night
                        </p>
                        <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          Featured
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4">
                  <BuildingOfficeIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">No hotels found</p>
                  <Link to="/admin/hotels/new" className="text-blue-600 hover:text-blue-700 text-xs">
                    Add your first hotel
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Popular Destinations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Popular Destinations ({featuredTrips.length + featuredHotels.length})
            </h3>
            <Link to="/admin/categories" className="text-blue-600 hover:text-blue-700 text-xs">
              Manage Categories
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Featured Trips as Destinations */}
            {featuredTrips.slice(0, 2).map((trip) => (
              <Link key={`trip-${trip.id}`} to={`/trips/${trip.slug}`} className="block">
                <div className="relative group overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-all">
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <img
                      src={trip.mainImage || trip.main_image || `https://picsum.photos/300/200?random=${trip.id}`}
                      alt={trip.title}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-xs font-medium truncate">{trip.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center">
                          {renderStars(trip.averageRating || trip.average_rating || 0)}
                        </div>
                        <span className="text-white text-xs">{formatPrice(trip.price || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Featured Hotels as Destinations */}
            {featuredHotels.slice(0, 2).map((hotel) => (
              <Link key={`hotel-${hotel.id}`} to={`/hotels/${hotel.slug}`} className="block">
                <div className="relative group overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-all">
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <img
                      src={hotel.mainImage || hotel.main_image || `https://picsum.photos/300/200?random=${hotel.id + 100}`}
                      alt={hotel.name}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-xs font-medium truncate">{hotel.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center">
                          {renderStars(hotel.averageRating || hotel.average_rating || 0)}
                        </div>
                        <span className="text-white text-xs">{formatPrice(hotel.pricePerNight || hotel.price_per_night || 0)}/night</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {featuredTrips.length === 0 && featuredHotels.length === 0 && (
            <div className="text-center py-4">
              <MapIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No destinations found</p>
              <div className="flex justify-center space-x-2 mt-2">
                <Link to="/admin/trips/new" className="text-blue-600 hover:text-blue-700 text-xs">
                  Add Trip
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/admin/hotels/new" className="text-blue-600 hover:text-blue-700 text-xs">
                  Add Hotel
                </Link>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Recent Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Recent Reviews</h3>
            <Link to="/admin/reviews" className="text-blue-600 hover:text-blue-700 text-xs">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentReviews && stats.recentReviews.length > 0 ? (
              stats.recentReviews.map((review) => (
                <div key={review.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-md">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <StarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex items-center">
                        {renderStars(review.rating || 0)}
                      </div>
                      <span className="text-xs text-gray-500">
                        by {review.userName || 'Anonymous'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {review.itemTitle || 'Item'}
                    </p>
                    {review.title && (
                      <p className="text-xs text-gray-600 truncate">
                        "{review.title}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {getTimeAgo(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      review.rating >= 4
                        ? 'bg-green-100 text-green-800'
                        : review.rating >= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {review.rating}/5
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <StarIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No reviews yet</p>
                <p className="text-gray-400 text-xs">Reviews will appear here when customers rate your services</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/admin/trips/new" className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-center transition-colors">
              <MapIcon className="h-6 w-6 mx-auto text-blue-600 mb-1" />
              <p className="text-xs font-medium text-gray-900">Add Trip</p>
            </Link>
            <Link to="/admin/hotels/new" className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-center transition-colors">
              <BuildingOfficeIcon className="h-6 w-6 mx-auto text-green-600 mb-1" />
              <p className="text-xs font-medium text-gray-900">Add Hotel</p>
            </Link>
            <Link to="/admin/categories/new" className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-center transition-colors">
              <UsersIcon className="h-6 w-6 mx-auto text-purple-600 mb-1" />
              <p className="text-xs font-medium text-gray-900">Add Category</p>
            </Link>
            <Link to="/admin/reviews" className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-center transition-colors">
              <StarIcon className="h-6 w-6 mx-auto text-yellow-600 mb-1" />
              <p className="text-xs font-medium text-gray-900">Review Reviews</p>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
