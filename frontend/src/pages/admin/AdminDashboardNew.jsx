import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  Cog6ToothIcon,
  BellIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  where, 
  getDocs,
  getDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
  getCountFromServer
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentBookings: [],
    recentUsers: [],
    recentReviews: [],
    chartData: {},
    activityLog: []
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const navigate = useNavigate();

  // Check user role and permissions
  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  // Load dashboard data
  useEffect(() => {
    if (userRole === 'admin') {
      loadDashboardData();
    }
  }, [userRole, selectedTimeRange]);

  const checkUserRole = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'admin') {
          navigate('/unauthorized');
          return;
        }
        setUserRole(userData.role);
      } else {
        navigate('/unauthorized');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/unauthorized');
    }
  };

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      // Get date range for filtering
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(selectedTimeRange.replace('d', '')));

      // Load statistics
      const [
        usersSnapshot,
        tripsSnapshot,
        hotelsSnapshot,
        bookingsSnapshot,
        reviewsSnapshot
      ] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'trips')),
        getCountFromServer(collection(db, 'hotels')),
        getCountFromServer(collection(db, 'bookings')),
        getCountFromServer(collection(db, 'reviews'))
      ]);

      // Calculate revenue from bookings
      const bookingsQuery = query(collection(db, 'bookings'));
      const bookingsData = await getDocs(bookingsQuery);
      let totalRevenue = 0;
      let confirmedBookings = 0;
      
      bookingsData.forEach(doc => {
        const booking = doc.data();
        if (booking.status === 'confirmed') {
          totalRevenue += booking.totalPrice || 0;
          confirmedBookings++;
        }
      });

      // Get recent data
      const recentBookingsQuery = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
      const recentBookings = recentBookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const recentReviewsQuery = query(
        collection(db, 'reviews'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentReviewsSnapshot = await getDocs(recentReviewsQuery);
      const recentReviews = recentReviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Generate chart data
      const chartData = generateChartData(bookingsData.docs);

      setDashboardData({
        stats: {
          totalUsers: usersSnapshot.data().count,
          totalTrips: tripsSnapshot.data().count,
          totalHotels: hotelsSnapshot.data().count,
          totalBookings: bookingsSnapshot.data().count,
          totalReviews: reviewsSnapshot.data().count,
          totalRevenue,
          confirmedBookings,
          averageBookingValue: confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0
        },
        recentBookings,
        recentUsers,
        recentReviews,
        chartData,
        activityLog: generateActivityLog(recentBookings, recentUsers, recentReviews)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const generateChartData = (bookingDocs) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const bookingsByDay = last7Days.map(date => {
      return bookingDocs.filter(doc => {
        const bookingDate = doc.data().createdAt?.toDate();
        return bookingDate && bookingDate.toISOString().split('T')[0] === date;
      }).length;
    });

    const revenueByDay = last7Days.map(date => {
      return bookingDocs
        .filter(doc => {
          const bookingDate = doc.data().createdAt?.toDate();
          return bookingDate && bookingDate.toISOString().split('T')[0] === date;
        })
        .reduce((sum, doc) => sum + (doc.data().totalPrice || 0), 0);
    });

    return {
      bookingsChart: {
        labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [
          {
            label: 'Bookings',
            data: bookingsByDay,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
        ],
      },
      revenueChart: {
        labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueByDay,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1,
          },
        ],
      },
    };
  };

  const generateActivityLog = (bookings, users, reviews) => {
    const activities = [];
    
    bookings.forEach(booking => {
      activities.push({
        id: `booking-${booking.id}`,
        type: 'booking',
        description: `New booking for ${booking.tripTitle || booking.hotelName}`,
        user: booking.guestName,
        timestamp: booking.createdAt,
        icon: BookmarkIcon,
        color: 'blue'
      });
    });

    users.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        description: `New user registered: ${user.firstName} ${user.lastName}`,
        user: user.email,
        timestamp: user.createdAt,
        icon: UsersIcon,
        color: 'green'
      });
    });

    reviews.forEach(review => {
      activities.push({
        id: `review-${review.id}`,
        type: 'review',
        description: `New review submitted (${review.rating} stars)`,
        user: review.userName,
        timestamp: review.createdAt,
        icon: StarIcon,
        color: 'yellow'
      });
    });

    return activities
      .sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0))
      .slice(0, 10);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading admin dashboard..." />
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardData.stats.totalRevenue || 0),
      change: '+12.5%',
      icon: CurrencyDollarIcon,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Total Bookings',
      value: formatNumber(dashboardData.stats.totalBookings || 0),
      change: '+8.2%',
      icon: BookmarkIcon,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: formatNumber(dashboardData.stats.totalUsers || 0),
      change: '+15.3%',
      icon: UsersIcon,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Average Booking',
      value: formatCurrency(dashboardData.stats.averageBookingValue || 0),
      change: '-2.1%',
      icon: ChartBarIcon,
      color: 'orange',
      trend: 'down'
    },
  ];

  const quickStats = [
    {
      title: 'Total Trips',
      value: dashboardData.stats.totalTrips || 0,
      link: '/admin/trips',
      icon: MapIcon,
      color: 'blue'
    },
    {
      title: 'Total Hotels',
      value: dashboardData.stats.totalHotels || 0,
      link: '/admin/hotels',
      icon: BuildingOfficeIcon,
      color: 'green'
    },
    {
      title: 'Pending Reviews',
      value: dashboardData.stats.totalReviews || 0,
      link: '/admin/reviews',
      icon: StarIcon,
      color: 'yellow'
    },
    {
      title: 'Confirmed Bookings',
      value: dashboardData.stats.confirmedBookings || 0,
      link: '/admin/bookings',
      icon: CheckCircleIcon,
      color: 'emerald'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              {/* Quick Actions Button */}
              <div className="relative">
                <Button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  icon={<PlusIcon />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Quick Actions
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>

                <AnimatePresence>
                  {showQuickActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                    >
                      <div className="py-2">
                        <Link
                          to="/admin/trips/new"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <MapIcon className="h-4 w-4 mr-3" />
                          Add New Trip
                        </Link>
                        <Link
                          to="/admin/hotels/new"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <BuildingOfficeIcon className="h-4 w-4 mr-3" />
                          Add New Hotel
                        </Link>
                        <Link
                          to="/admin/users"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <UsersIcon className="h-4 w-4 mr-3" />
                          Manage Users
                        </Link>
                        <Link
                          to="/admin/content"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-3" />
                          Edit Content
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bookings Trend</h3>
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64">
                {dashboardData.chartData.bookingsChart && (
                  <Line
                    data={dashboardData.chartData.bookingsChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </Card>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64">
                {dashboardData.chartData.revenueChart && (
                  <Bar
                    data={dashboardData.chartData.revenueChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '$' + value.toLocaleString();
                            },
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Link to={stat.link}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${stat.color}-100 mr-3`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {dashboardData.activityLog.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-${activity.color}-100 flex-shrink-0`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {activity.user} • {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {dashboardData.activityLog.length === 0 && (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                <Link
                  to="/admin/bookings"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {booking.guestName}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {booking.tripTitle || booking.hotelName}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatCurrency(booking.totalPrice || 0)}</span>
                      <span>{getTimeAgo(booking.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
                {dashboardData.recentBookings.length === 0 && (
                  <div className="text-center py-8">
                    <BookmarkIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No recent bookings</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Management Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/trips"
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <MapIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  Manage Trips
                </span>
              </Link>
              <Link
                to="/admin/hotels"
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <BuildingOfficeIcon className="h-8 w-8 text-gray-400 group-hover:text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Manage Hotels
                </span>
              </Link>
              <Link
                to="/admin/users"
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              >
                <UsersIcon className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                  Manage Users
                </span>
              </Link>
              <Link
                to="/admin/reviews"
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
              >
                <StarIcon className="h-8 w-8 text-gray-400 group-hover:text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-700">
                  Manage Reviews
                </span>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
