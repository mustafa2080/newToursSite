import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  StarIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  BuildingOfficeIcon,
  WifiIcon,
  TruckIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { getHotels } from '../services/firebase/hotels';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QuickRating from '../components/reviews/QuickRating';
import WishlistButton from '../components/wishlist/WishlistButton';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    starRating: searchParams.get('starRating') || '',
    amenities: searchParams.get('amenities') || '',
    featured: searchParams.get('featured') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'DESC',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const popularAmenities = [
    { id: 'wifi', name: 'Free WiFi', icon: WifiIcon },
    { id: 'parking', name: 'Free Parking', icon: TruckIcon },
    { id: 'pool', name: 'Swimming Pool', icon: SwatchIcon },
    { id: 'gym', name: 'Fitness Center', icon: BuildingOfficeIcon },
    { id: 'spa', name: 'Spa', icon: SwatchIcon },
    { id: 'restaurant', name: 'Restaurant', icon: BuildingOfficeIcon },
  ];

  useEffect(() => {
    loadHotels();
    loadCategories();
  }, [searchParams]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      console.log('🏨 Loading hotels from Firebase...', filters);

      // Build filters for Firebase
      const firebaseFilters = {
        search: filters.search,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        starRating: filters.starRating,
        amenities: filters.amenities,
        featured: filters.featured,
        // status: 'active', // Temporarily remove status filter to see all hotels
        pageSize: 50
      };

      const response = await getHotels(firebaseFilters);
      console.log('🏨 Hotels Firebase response:', response);
      console.log('🏨 Applied filters:', firebaseFilters);
      console.log('🏨 Number of hotels returned:', response.hotels?.length || 0);

      if (response.success && response.hotels) {
        setHotels(response.hotels);
        setPagination({
          page: 1,
          limit: 50,
          total: response.hotels.length,
          hasNext: false,
          hasPrev: false,
          totalPages: 1
        });
      } else {
        setHotels([]);
        setPagination({
          page: 1,
          limit: 50,
          total: 0,
          hasNext: false,
          hasPrev: false,
          totalPages: 1
        });
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
      setHotels([]);
      setPagination({
        page: 1,
        limit: 50,
        total: 0,
        hasNext: false,
        hasPrev: false,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('📂 Loading categories from Firebase...');
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesData);
      console.log('📂 Loaded categories:', categoriesData.length);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      starRating: '',
      amenities: '',
      featured: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
      page: 1,
    });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  const handleAmenityToggle = (amenityId) => {
    const currentAmenities = filters.amenities ? filters.amenities.split(',') : [];
    const updatedAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter(id => id !== amenityId)
      : [...currentAmenities, amenityId];
    
    updateFilters({ amenities: updatedAmenities.join(',') });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating, filled = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          filled 
            ? (i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300')
            : (i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300')
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Luxury Hotels & Accommodations</h1>
              <p className="mt-2 text-gray-600">
                Find the perfect place to stay for your next adventure
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 lg:max-w-md">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search hotels..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                icon={<FunnelIcon />}
                className="sm:w-auto"
              >
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-80 space-y-6"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={clearFilters}
                        className="text-gray-500"
                      >
                        Clear All
                      </Button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Location Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => updateFilters({ category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Locations</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Night
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => updateFilters({ minPrice: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Star Rating
                      </label>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <label key={rating} className="flex items-center">
                            <input
                              type="radio"
                              name="starRating"
                              value={rating}
                              checked={filters.starRating === rating.toString()}
                              onChange={(e) => updateFilters({ starRating: e.target.value })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <div className="ml-2 flex items-center">
                              {renderStars(rating)}
                              <span className="ml-1 text-sm text-gray-600">& up</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amenities
                      </label>
                      <div className="space-y-2">
                        {popularAmenities.map((amenity) => {
                          const isSelected = filters.amenities.split(',').includes(amenity.id);
                          return (
                            <label key={amenity.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleAmenityToggle(amenity.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <amenity.icon className="ml-2 h-4 w-4 text-gray-500" />
                              <span className="ml-2 text-sm text-gray-700">{amenity.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Featured Only */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.featured === 'true'}
                          onChange={(e) => updateFilters({ featured: e.target.checked ? 'true' : '' })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured hotels only</span>
                      </label>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                          const [sortBy, sortOrder] = e.target.value.split('-');
                          updateFilters({ sortBy, sortOrder });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="created_at-DESC">Newest First</option>
                        <option value="created_at-ASC">Oldest First</option>
                        <option value="price_per_night-ASC">Price: Low to High</option>
                        <option value="price_per_night-DESC">Price: High to Low</option>
                        <option value="name-ASC">Name: A to Z</option>
                        <option value="name-DESC">Name: Z to A</option>
                        <option value="star_rating-DESC">Star Rating: High to Low</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  {pagination.total ? (
                    <>
                      Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} hotels
                    </>
                  ) : (
                    'Loading hotels...'
                  )}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                icon={<AdjustmentsHorizontalIcon />}
                className="lg:hidden"
              >
                Filters
              </Button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" text="Loading luxury hotels..." />
              </div>
            ) : (
              <>
                {/* Hotels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {hotels.map((hotel, index) => (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link to={`/hotels/${hotel.slug}`}>
                        <Card hover padding="none" className="overflow-hidden h-full">
                          <div className="relative">
                            <img
                              src={`https://picsum.photos/500/300?random=${1200 + index}`}
                              alt={hotel.name}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                console.log('🖼️ Hotel image failed to load:', e.target.src);
                                e.target.src = `https://picsum.photos/500/300?random=${Math.floor(Math.random() * 1000)}`;
                              }}
                            />
                            <div className="absolute top-4 left-4">
                              {hotel.featured && (
                                <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="absolute top-4 right-4 flex items-center space-x-2">
                              <WishlistButton
                                itemId={hotel.id}
                                itemType="hotel"
                                itemTitle={hotel.name}
                                itemImage={hotel.mainImage || hotel.main_image}
                                itemPrice={hotel.pricePerNight || hotel.price_per_night}
                                itemLocation={hotel.location}
                                size="sm"
                                variant="ghost"
                                showText={false}
                                className="bg-white/80 hover:bg-white rounded-full p-1"
                              />
                              <div className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                                {formatPrice(hotel.pricePerNight || hotel.price_per_night || 0)}/night
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4">
                              <div className="flex items-center bg-white px-2 py-1 rounded-full">
                                {renderStars(hotel.starRating || hotel.star_rating || 0)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <QuickRating itemId={hotel.id} itemType="hotel" size="sm" />
                            </div>
                            
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                              {hotel.name}
                            </h3>
                            
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {hotel.location || hotel.city || 'Location'}
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {hotel.shortDescription || hotel.short_description || hotel.description}
                            </p>
                            
                            {/* Amenities Preview */}
                            {hotel.amenities && hotel.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                                {hotel.amenities.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{hotel.amenities.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="small"
                        disabled={!pagination.hasPrev}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={page === pagination.page ? 'primary' : 'outline'}
                            size="small"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="small"
                        disabled={!pagination.hasNext}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                )}

                {/* No Results */}
                {hotels.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <BuildingOfficeIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hotels found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search criteria or filters.
                    </p>
                    <div className="mt-6">
                      <Button onClick={clearFilters}>
                        Clear all filters
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
