import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { tripsAPI } from '../../utils/firebaseApi';
import { seedTrips } from '../../utils/seedTrips';
import { getTrips } from '../../services/firebase/trips';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';


const TripsManagement = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    featured: '',
    status: '',
    difficulty: '',
  });
  const [pagination, setPagination] = useState({});
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    console.log('🚀 Loading trips from Firebase...');
    loadTrips();
  }, [searchTerm, filters]);

  const loadTrips = async () => {
    try {
      setLoading(true);

      console.log('🚀 Loading trips for admin with filters:', { searchTerm, filters });

      // First, let's check what's actually in the database
      const tripsCollection = collection(db, 'trips');
      const rawSnapshot = await getDocs(tripsCollection);
      console.log('🔍 Raw Firebase data:');
      console.log('📊 Total documents in trips collection:', rawSnapshot.size);

      rawSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`📄 Document ${index + 1}:`, {
          id: doc.id,
          title: data.title,
          status: data.status,
          featured: data.featured,
          slug: data.slug,
          price: data.price,
          createdAt: data.createdAt,
          allFields: Object.keys(data)
        });
      });

      // Get ALL trips directly from Firebase without any filtering
      let allTrips = rawSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || new Date()
      }));

      console.log('📋 All trips from Firebase (before filtering):', allTrips.length);
      console.log('📋 Sample trip data:', allTrips[0]);

      // Apply client-side filtering only if there are search terms or filters
      let filteredTrips = allTrips;

      if (searchTerm) {
        console.log('🔍 Applying search filter:', searchTerm);
        filteredTrips = filteredTrips.filter(trip =>
          trip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('🔍 After search filter:', filteredTrips.length);
      }

      if (filters.featured && filters.featured !== '') {
        console.log('⭐ Applying featured filter:', filters.featured);
        const featuredValue = filters.featured === 'true';
        filteredTrips = filteredTrips.filter(trip => trip.featured === featuredValue);
        console.log('⭐ After featured filter:', filteredTrips.length);
      }

      if (filters.status && filters.status !== '') {
        console.log('📊 Applying status filter:', filters.status);
        filteredTrips = filteredTrips.filter(trip => trip.status === filters.status);
        console.log('📊 After status filter:', filteredTrips.length);
      }

      if (filters.difficulty && filters.difficulty !== '') {
        console.log('🏔️ Applying difficulty filter:', filters.difficulty);
        filteredTrips = filteredTrips.filter(trip =>
          trip.difficultyLevel === filters.difficulty ||
          trip.difficulty_level === filters.difficulty
        );
        console.log('🏔️ After difficulty filter:', filteredTrips.length);
      }

      console.log('✅ Final filtered trips:', filteredTrips.length);
      setTrips(filteredTrips);
      setPagination({
        page: 1,
        limit: 50,
        total: filteredTrips.length,
        hasNext: false,
        hasPrev: false,
      });

      return;


    } catch (error) {
      console.error('Error loading trips:', error);

      // Set empty array on error - no mock data
      console.log('⚠️ No trips data available - initialize Firebase first');
      setTrips([]);
      setPagination({ total: 0, page: 1, limit: 20 });

    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripsAPI.delete(tripId);
        loadTrips();
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  const handleToggleFeatured = async (tripId) => {
    try {
      await tripsAPI.toggleFeatured(tripId);
      loadTrips();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTrips.length === 0) return;

    if (window.confirm(`Are you sure you want to ${action} ${selectedTrips.length} trips?`)) {
      try {
        for (const tripId of selectedTrips) {
          if (action === 'delete') {
            await tripsAPI.delete(tripId);
          } else if (action === 'feature') {
            await tripsAPI.toggleFeatured(tripId);
          }
        }
        setSelectedTrips([]);
        loadTrips();
      } catch (error) {
        console.error(`Error performing bulk ${action}:`, error);
      }
    }
  };

  const handleSeedTrips = async () => {
    if (window.confirm('This will add sample trips to the database. Continue?')) {
      try {
        setSeeding(true);
        const result = await seedTrips();

        if (result.success) {
          alert(`Successfully added ${result.trips.length} sample trips!`);
          loadTrips(); // Reload the trips list
        } else {
          alert(`Error adding trips: ${result.error}`);
        }
      } catch (error) {
        console.error('Error seeding trips:', error);
        alert('Error adding sample trips. Check console for details.');
      } finally {
        setSeeding(false);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    challenging: 'bg-orange-100 text-orange-800',
    difficult: 'bg-red-100 text-red-800',
  };



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trips Management</h1>
          <p className="text-gray-600">Manage all trips and travel packages</p>
          {trips.length > 0 && (
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-gray-500">
                Total: <span className="font-semibold text-gray-900">{trips.length}</span>
              </span>
              <span className="text-yellow-600">
                Featured: <span className="font-semibold">{trips.filter(trip => trip.featured).length}</span>
              </span>
              <span className="text-green-600">
                Active: <span className="font-semibold">{trips.filter(trip => trip.status === 'active').length}</span>
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {trips.length === 0 && (
            <Button
              variant="outline"
              loading={seeding}
              onClick={handleSeedTrips}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              {seeding ? 'Adding Sample Trips...' : 'Add Sample Trips'}
            </Button>
          )}
          <Link to="/admin/trips/new">
            <Button icon={<PlusIcon />}>
              Add New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <select
            value={filters.featured}
            onChange={(e) => setFilters({ ...filters, featured: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Trips</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="challenging">Challenging</option>
            <option value="difficult">Difficult</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedTrips.length > 0 && (
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedTrips.length} trips selected
            </span>
            <Button
              size="small"
              variant="outline"
              onClick={() => handleBulkAction('feature')}
            >
              Toggle Featured
            </Button>
            <Button
              size="small"
              variant="danger"
              onClick={() => handleBulkAction('delete')}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </Card>

      {/* Trips List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" text="Loading trips..." />
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedTrips.includes(trip.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTrips([...selectedTrips, trip.id]);
                      } else {
                        setSelectedTrips(selectedTrips.filter(id => id !== trip.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-shrink-0">
                    <img
                      src={trip.mainImage || trip.main_image || 'https://picsum.photos/200/120?random=1701'}
                      alt={trip.title}
                      className="h-16 w-24 object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {trip.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center">
                            {renderStars(trip.averageRating || trip.average_rating || 0)}
                            <span className="ml-1 text-sm text-gray-600">
                              ({trip.reviewCount || trip.review_count || 0})
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[trip.difficultyLevel || trip.difficulty_level] || 'bg-gray-100 text-gray-800'}`}>
                            {trip.difficultyLevel || trip.difficulty_level || 'Easy'}
                          </span>
                          {trip.featured && (
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-400 text-yellow-900 flex items-center">
                              ⭐ FEATURED
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(trip.price)}
                        </p>
                        <p className="text-sm text-gray-600">per person</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {trip.durationDays || trip.duration_days || 'N/A'} days
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          Max {trip.maxParticipants || trip.max_participants || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {trip.categoryName || trip.category_name || trip.location || 'Location'}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link to={`/trips/${trip.slug}`} target="_blank">
                          <Button size="small" variant="ghost" icon={<EyeIcon />}>
                            View
                          </Button>
                        </Link>
                        <Link to={`/admin/trips/${trip.id}/edit`}>
                          <Button size="small" variant="outline" icon={<PencilIcon />}>
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="small"
                          variant={trip.featured ? "warning" : "outline"}
                          onClick={() => handleToggleFeatured(trip.id)}
                          className={trip.featured ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                        >
                          {trip.featured ? '⭐ Unfeature' : '⭐ Feature'}
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          icon={<TrashIcon />}
                          onClick={() => handleDelete(trip.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {trips.length === 0 && (
            <Card className="p-12 text-center">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No trips found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding sample trips or creating a new trip.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <Button
                  variant="outline"
                  loading={seeding}
                  onClick={handleSeedTrips}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  {seeding ? 'Adding Sample Trips...' : 'Add Sample Trips'}
                </Button>
                <Link to="/admin/trips/new">
                  <Button icon={<PlusIcon />}>
                    Add New Trip
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TripsManagement;
