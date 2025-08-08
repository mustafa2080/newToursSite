import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [chartData, setChartData] = useState({
    revenue: {
      labels: [],
      data: [],
      total: 0,
      growth: 0
    },
    bookings: {
      labels: [],
      data: [],
      total: 0,
      growth: 0
    },
    users: {
      labels: [],
      data: [],
      total: 0,
      growth: 0
    },
    popular: {
      trips: [],
      hotels: [],
      destinations: []
    }
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading analytics data...');

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Load data
      const [bookingsData, usersData, tripsData, hotelsData] = await Promise.all([
        loadBookings(startDate, endDate),
        loadUsers(startDate, endDate),
        loadTrips(),
        loadHotels()
      ]);

      // Process data for charts
      const processedData = processDataForCharts({
        bookings: bookingsData,
        users: usersData,
        trips: tripsData,
        hotels: hotelsData,
        startDate,
        endDate
      });

      setChartData(processedData);
      console.log('✅ Analytics data loaded');
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (startDate, endDate) => {
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    return bookingsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || data.bookingDate)
      };
    }).filter(booking => {
      const bookingDate = booking.createdAt;
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  };

  const loadUsers = async (startDate, endDate) => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
      };
    }).filter(user => {
      const userDate = user.createdAt;
      return userDate >= startDate && userDate <= endDate;
    });
  };

  const loadTrips = async () => {
    const tripsSnapshot = await getDocs(collection(db, 'trips'));
    return tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const loadHotels = async () => {
    const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
    return hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const processDataForCharts = ({ bookings, users, trips, hotels, startDate, endDate }) => {
    // Generate date labels for the period
    const days = parseInt(dateRange);
    const labels = [];
    const revenueData = [];
    const bookingsData = [];
    const usersData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      // Revenue for this day
      const dayRevenue = bookings
        .filter(b => {
          const bookingDate = b.createdAt.toISOString().split('T')[0];
          return bookingDate === dateStr && (b.status === 'confirmed' || b.paymentStatus === 'paid');
        })
        .reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0);
      revenueData.push(dayRevenue);

      // Bookings for this day
      const dayBookings = bookings.filter(b => {
        const bookingDate = b.createdAt.toISOString().split('T')[0];
        return bookingDate === dateStr;
      }).length;
      bookingsData.push(dayBookings);

      // Users for this day
      const dayUsers = users.filter(u => {
        const userDate = u.createdAt.toISOString().split('T')[0];
        return userDate === dateStr;
      }).length;
      usersData.push(dayUsers);
    }

    // Calculate totals and growth
    const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0);
    const totalBookings = bookingsData.reduce((sum, val) => sum + val, 0);
    const totalUsers = usersData.reduce((sum, val) => sum + val, 0);

    // Calculate growth (simplified - comparing first half vs second half)
    const halfPoint = Math.floor(days / 2);
    const firstHalfRevenue = revenueData.slice(0, halfPoint).reduce((sum, val) => sum + val, 0);
    const secondHalfRevenue = revenueData.slice(halfPoint).reduce((sum, val) => sum + val, 0);
    const revenueGrowth = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue * 100) : 0;

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

    return {
      revenue: {
        labels,
        data: revenueData,
        total: totalRevenue,
        growth: revenueGrowth
      },
      bookings: {
        labels,
        data: bookingsData,
        total: totalBookings,
        growth: 0 // Simplified
      },
      users: {
        labels,
        data: usersData,
        total: totalUsers,
        growth: 0 // Simplified
      },
      popular: {
        trips: popularTrips,
        hotels: popularHotels,
        destinations: popularDestinations
      }
    };
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

  const renderLineChart = (data, color = 'blue') => {
    const maxValue = Math.max(...data.data);
    const minValue = Math.min(...data.data);
    const range = maxValue - minValue || 1;

    return (
      <div className="relative h-64 flex items-end justify-between px-2">
        {data.data.map((value, index) => {
          const height = maxValue > 0 ? ((value - minValue) / range) * 200 + 20 : 20;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`w-2 bg-${color}-500 rounded-t transition-all duration-500 hover:bg-${color}-600`}
                style={{ height: `${height}px` }}
                title={`${data.labels[index]}: ${value}`}
              />
              <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                {data.labels[index]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBarChart = (items, color = 'green') => {
    const maxValue = Math.max(...items.map(item => item.bookings));

    return (
      <div className="space-y-3">
        {items.map((item, index) => {
          const width = maxValue > 0 ? (item.bookings / maxValue) * 100 : 0;
          return (
            <div key={item.id || index} className="flex items-center">
              <div className="w-24 text-sm font-medium text-gray-700 truncate">
                {item.name || item.location}
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-200 rounded-full h-4 relative">
                  <div
                    className={`bg-${color}-500 h-4 rounded-full transition-all duration-500`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-sm font-bold text-gray-900 text-right">
                {item.bookings}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Visual insights and performance charts</p>
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
          </select>
          <Button
            variant="outline"
            onClick={loadAnalyticsData}
            className="flex items-center"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(chartData.revenue.total),
            growth: chartData.revenue.growth,
            icon: CurrencyDollarIcon,
            color: 'green'
          },
          {
            title: 'Total Bookings',
            value: chartData.bookings.total.toLocaleString(),
            growth: chartData.bookings.growth,
            icon: BookmarkIcon,
            color: 'blue'
          },
          {
            title: 'New Users',
            value: chartData.users.total.toLocaleString(),
            growth: chartData.users.growth,
            icon: UsersIcon,
            color: 'purple'
          }
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
                  {stat.growth !== 0 && (
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className={`h-4 w-4 ${stat.growth >= 0 ? 'text-green-500' : 'text-red-500'} mr-1`} />
                      <span className={`text-sm ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.growth >= 0 ? '+' : ''}{stat.growth.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center text-sm text-green-600">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              {chartData.revenue.growth >= 0 ? '+' : ''}{chartData.revenue.growth.toFixed(1)}%
            </div>
          </div>
          {renderLineChart(chartData.revenue, 'green')}
        </div>

        {/* Bookings Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bookings Trend</h3>
            <div className="flex items-center text-sm text-blue-600">
              <ChartBarIcon className="h-4 w-4 mr-1" />
              {chartData.bookings.total} total
            </div>
          </div>
          {renderLineChart(chartData.bookings, 'blue')}
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Registration Trend</h3>
          <div className="flex items-center text-sm text-purple-600">
            <UsersIcon className="h-4 w-4 mr-1" />
            {chartData.users.total} new users
          </div>
        </div>
        {renderLineChart(chartData.users, 'purple')}
      </div>

      {/* Popular Items Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Trips */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Trips</h3>
          {chartData.popular.trips.length > 0 ? (
            renderBarChart(chartData.popular.trips, 'blue')
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No trip data available</p>
            </div>
          )}
        </div>

        {/* Popular Hotels */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Hotels</h3>
          {chartData.popular.hotels.length > 0 ? (
            renderBarChart(chartData.popular.hotels, 'green')
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No hotel data available</p>
            </div>
          )}
        </div>

        {/* Popular Destinations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h3>
          {chartData.popular.destinations.length > 0 ? (
            renderBarChart(chartData.popular.destinations, 'orange')
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No destination data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{chartData.bookings.total}</div>
            <div className="text-sm text-gray-500">Total Bookings</div>
            <div className="mt-2 bg-blue-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{formatCurrency(chartData.revenue.total)}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="mt-2 bg-green-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{chartData.users.total}</div>
            <div className="text-sm text-gray-500">New Users</div>
            <div className="mt-2 bg-purple-100 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {chartData.revenue.total > 0 && chartData.bookings.total > 0
                ? formatCurrency(chartData.revenue.total / chartData.bookings.total)
                : '$0'
              }
            </div>
            <div className="text-sm text-gray-500">Avg Booking Value</div>
            <div className="mt-2 bg-orange-100 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => window.open('/admin/reports', '_blank')}
            className="flex items-center justify-center"
          >
            📊 View Reports
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/bookings', '_blank')}
            className="flex items-center justify-center"
          >
            📋 Manage Bookings
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/users', '_blank')}
            className="flex items-center justify-center"
          >
            👥 View Users
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log('Export analytics')}
            className="flex items-center justify-center"
          >
            📤 Export Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
