import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import { hotelsAPI } from '../../utils/firebaseApi';
import { getHotels } from '../../services/firebase/hotels';
import { seedHotels } from '../../utils/seedHotels';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';


const HotelsManagement = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setIsLoading(true);

      console.log('🚀 Loading hotels for admin with filters:', { searchTerm, filterStatus });

      // First, let's check what's actually in the database
      const hotelsCollection = collection(db, 'hotels');
      const rawSnapshot = await getDocs(hotelsCollection);
      console.log('🔍 Raw Firebase data:');
      console.log('📊 Total documents in hotels collection:', rawSnapshot.size);

      rawSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`📄 Document ${index + 1}:`, {
          id: doc.id,
          name: data.name,
          status: data.status,
          location: data.location,
          price: data.pricePerNight || data.price_per_night
        });
      });

      // Try direct Firebase call first
      const directResult = await getHotels({
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus,
        pageSize: 50
      });

      console.log('📍 Direct Firebase result:', directResult);

      if (directResult.success && directResult.hotels) {
        console.log('✅ Using direct Firebase result:', directResult.hotels.length);
        setHotels(directResult.hotels);
        return;
      }

      // Fallback to API
      const params = {
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus,
        page: 1,
        limit: 20,
      };

      const response = await hotelsAPI.getAll(params);

      console.log('🏨 Full Firebase response:', response);

      // Handle the nested data structure correctly
      let hotelsData = [];

      console.log('🔍 Response structure:', response);

      if (response?.data?.data && Array.isArray(response.data.data)) {
        hotelsData = response.data.data;
        console.log('✅ Found hotels in response.data.data:', hotelsData.length);
      } else if (response?.data && Array.isArray(response.data)) {
        hotelsData = response.data;
        console.log('✅ Found hotels in response.data:', hotelsData.length);
      } else if (Array.isArray(response)) {
        hotelsData = response;
        console.log('✅ Found hotels in response:', hotelsData.length);
      } else if (response?.success && response?.data) {
        // Handle Firebase API response format
        hotelsData = Array.isArray(response.data) ? response.data : [];
        console.log('✅ Found hotels in Firebase response:', hotelsData.length);
      } else {
        console.log('❌ Could not extract hotels data from response');
        console.log('❌ Response structure:', JSON.stringify(response, null, 2));
        hotelsData = [];
      }

      console.log('🏨 Extracted hotels data:', hotelsData.length, hotelsData);
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
    } catch (error) {
      console.error('Error loading hotels:', error);

      // Set empty array on error - no mock data
      console.log('⚠️ No hotels data available - initialize Firebase first');
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload hotels when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadHotels();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus, filterFeatured]);

  const filteredHotels = Array.isArray(hotels) ? hotels.filter(hotel => {
    const matchesSearch = hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel?.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || hotel?.status === filterStatus;
    const matchesFeatured = filterFeatured === 'all' ||
                           (filterFeatured === 'featured' && hotel?.featured === true) ||
                           (filterFeatured === 'not-featured' && hotel?.featured !== true);
    return matchesSearch && matchesStatus && matchesFeatured;
  }) : [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleEdit = (hotelId) => {
    console.log('Edit hotel:', hotelId);
    // Navigate to edit page using React Router
    navigate(`/admin/hotels/${hotelId}/edit`);
  };

  const handleDelete = async (hotelId) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await hotelsAPI.delete(hotelId);
        loadHotels(); // Reload the list
      } catch (error) {
        console.error('Error deleting hotel:', error);
        alert('Error deleting hotel. Please try again.');
      }
    }
  };

  const handleView = (hotel) => {
    // Navigate to hotel detail page for customers
    const slug = hotel.slug || hotel.id;
    window.open(`/hotels/${slug}`, '_blank');
  };

  const handleToggleFeatured = async (hotelId) => {
    try {
      const hotel = hotels.find(h => h.id === hotelId);
      const newFeaturedStatus = !hotel.featured;

      console.log(`🌟 Toggling featured status for hotel ${hotelId}: ${hotel.featured} → ${newFeaturedStatus}`);

      await hotelsAPI.toggleFeatured(hotelId);

      // Update local state immediately
      setHotels(prevHotels =>
        prevHotels.map(h =>
          h.id === hotelId
            ? { ...h, featured: newFeaturedStatus }
            : h
        )
      );

      console.log(`✅ Hotel featured status updated successfully`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Error updating featured status. Please try again.');
    }
  };

  const handleSeedHotels = async () => {
    if (window.confirm('This will add sample hotels to the database. Continue?')) {
      try {
        setSeeding(true);
        const result = await seedHotels();

        if (result.success) {
          alert(`Successfully added ${result.hotels.length} sample hotels!`);
          loadHotels(); // Reload the hotels list
        } else {
          alert(`Error adding hotels: ${result.error}`);
        }
      } catch (error) {
        console.error('Error seeding hotels:', error);
        alert('Error adding sample hotels. Check console for details.');
      } finally {
        setSeeding(false);
      }
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels Management</h1>
          <p className="text-gray-600">Manage your hotel listings and availability</p>
          {hotels.length > 0 && (
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-gray-500">
                Total: <span className="font-semibold text-gray-900">{hotels.length}</span>
              </span>
              <span className="text-yellow-600">
                Featured: <span className="font-semibold">{hotels.filter(hotel => hotel.featured).length}</span>
              </span>
              <span className="text-green-600">
                Active: <span className="font-semibold">{hotels.filter(hotel => hotel.status === 'active').length}</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          {hotels.length === 0 && (
            <Button
              variant="outline"
              loading={seeding}
              onClick={handleSeedHotels}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              {seeding ? 'Adding Sample Hotels...' : 'Add Sample Hotels'}
            </Button>
          )}
          <Link to="/admin/hotels/new">
            <Button
              icon={<PlusIcon />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add New Hotel
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search hotels by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Hotels</option>
              <option value="featured">⭐ Featured Only</option>
              <option value="not-featured">Regular Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Hotel Image */}
            <div className="relative h-48">
              <img
                src={hotel.mainImage || hotel.image || hotel.main_image || 'https://picsum.photos/400/300?random=hotel'}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex flex-col space-y-1">
                {getStatusBadge(hotel.status)}
                {hotel.featured && (
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-400 text-yellow-900 shadow-lg">
                    ⭐ FEATURED
                  </span>
                )}
              </div>
            </div>

            {/* Hotel Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {hotel.name}
                </h3>
                <div className="flex items-center text-yellow-400">
                  {[...Array(hotel.starRating || hotel.star_rating || 0)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{hotel.location}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-green-600">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  <span className="font-semibold">${hotel.pricePerNight || hotel.price_per_night || 0}</span>
                  <span className="text-gray-500 text-sm ml-1">/night</span>
                </div>
                <div className="text-sm text-gray-600">
                  {hotel.roomsAvailable || hotel.rooms_available || 0}/{hotel.totalRooms || hotel.total_rooms || 0} rooms
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">{hotel.averageRating || hotel.average_rating || 0}</span>
                  <span className="text-sm text-gray-500 ml-1">({hotel.reviewCount || hotel.review_count || 0})</span>
                </div>
                <div className="text-sm text-gray-500">
                  {hotel.createdAt?.toDate ?
                    hotel.createdAt.toDate().toLocaleDateString() :
                    hotel.created_at ? new Date(hotel.created_at).toLocaleDateString() : 'N/A'
                  }
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(hotel)}
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(hotel.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hotel.id)}
                    className="flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleToggleFeatured(hotel.id)}
                  className={`w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    hotel.featured
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-500'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {hotel.featured ? '⭐ Unfeature' : '⭐ Feature'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hotels found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding sample hotels or creating your first hotel listing.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <div className="mt-6 flex justify-center space-x-4">
              <Button
                variant="outline"
                loading={seeding}
                onClick={handleSeedHotels}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {seeding ? 'Adding Sample Hotels...' : 'Add Sample Hotels'}
              </Button>
              <Link to="/admin/hotels/new">
                <Button
                  icon={<PlusIcon />}
                >
                  Add New Hotel
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelsManagement;
