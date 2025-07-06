import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  StarIcon,
  EyeIcon,
  PhotoIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { tripsCollection, formatCurrency, formatDate } from '../../utils/firebaseOperations';
import { AdminRoute } from '../../components/auth/ProtectedRoute';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    totalBookings: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const tripsData = await tripsCollection.getAll({
        orderBy: ['createdAt', 'desc']
      });

      console.log('🚀 Loaded trips data:', tripsData);
      setTrips(tripsData);

      // Calculate stats
      const stats = {
        total: tripsData.length,
        active: tripsData.filter(trip => trip.status === 'active').length,
        featured: tripsData.filter(trip => trip.featured).length,
        totalBookings: tripsData.reduce((sum, trip) => sum + (trip.bookingCount || 0), 0)
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = () => {
    navigate('/admin/trips/new');
  };

  const handleEditTrip = (trip) => {
    navigate(`/admin/trips/${trip.id}/edit`);
  };

  const handleViewTrip = (trip) => {
    navigate(`/trips/${trip.slug || trip.id}`);
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripsCollection.delete(tripId);
        await loadTrips(); // Reload data
        toast.success('Trip deleted successfully');
      } catch (error) {
        console.error('Error deleting trip:', error);
        toast.error('Failed to delete trip');
      }
    }
  };

  // Get trip image with fallback
  const getTripImage = (trip, index) => {
    // If trip has an image, use it
    if (trip.mainImage || trip.main_image || trip.image) {
      return trip.mainImage || trip.main_image || trip.image;
    }

    // Fallback images based on trip type or destination
    const fallbackImages = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Mountain landscape
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Desert/Petra
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Beach
      'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Mountain hiking
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // City skyline
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Cultural site
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Tropical beach
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Forest/nature
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Adventure
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', // Safari
    ];

    // Use index to cycle through images
    return fallbackImages[index % fallbackImages.length];
  };

  // Filter and search trips
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = !searchTerm ||
      trip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active', icon: '✅' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft', icon: '📝' },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive', icon: '❌' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} shadow-sm`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };



  if (loading) {
    return (
      <AdminRoute>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trips Management</h1>
            <p className="text-gray-600">Manage your travel packages and destinations</p>
          </div>
          <div className="flex space-x-3">
            {trips.length === 0 && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/setup-data'}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                Initialize Sample Data
              </Button>
            )}
            <Link to="/admin/trips/new">
              <Button
                icon={<PlusIcon />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add New Trip
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {(searchTerm || filterStatus !== 'all') && (
          <div className="text-sm text-gray-600">
            Showing {filteredTrips.length} of {trips.length} trips
            {searchTerm && ` matching "${searchTerm}"`}
            {filterStatus !== 'all' && ` with status "${filterStatus}"`}
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, index) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              style={{ aspectRatio: '1/1' }}
            >
              {/* Trip Image */}
              <div className="relative" style={{ height: '60%' }}>
                <img
                  src={getTripImage(trip, index)}
                  alt={trip.title || 'Trip image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(trip.status || 'draft')}
                </div>
                {trip.featured && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-lg">
                      ⭐ FEATURED
                    </span>
                  </div>
                )}
              </div>

              {/* Trip Details */}
              <div className="p-3" style={{ height: '40%' }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-1">
                  {trip.title || 'Untitled Trip'}
                </h3>

                <div className="space-y-1 mb-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                    <span className="truncate">{trip.destination || trip.location || 'Location not specified'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-3 w-3 mr-1 text-gray-400" />
                      <span>{trip.duration || trip.durationDays || trip.duration_days || 'N/A'}d</span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-3 w-3 mr-1 text-green-600" />
                      <span className="font-bold text-gray-900">{formatCurrency(trip.price || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewTrip(trip)}
                    className="flex-1 flex items-center justify-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <EyeIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleEditTrip(trip)}
                    className="flex-1 flex items-center justify-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="flex items-center justify-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No trips found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first trip listing.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <div className="mt-6 flex justify-center space-x-4">
                <Link to="/admin/trips/new">
                  <Button
                    icon={<PlusIcon />}
                  >
                    Add New Trip
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminRoute>
  );
};

export default AdminTrips;
