import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UsersIcon,
  StarIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QuickRating from '../components/reviews/QuickRating';
import WishlistButton from '../components/wishlist/WishlistButton';
import { collection, getDocs, query, orderBy, where, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../config/firebase';

const Trips = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
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
    difficulty: searchParams.get('difficulty') || '',
    featured: searchParams.get('featured') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'DESC',
    page: parseInt(searchParams.get('page')) || 1,
  });

  // Update filters when URL params change
  useEffect(() => {
    const newFilters = {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      difficulty: searchParams.get('difficulty') || '',
      featured: searchParams.get('featured') || '',
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'DESC',
      page: parseInt(searchParams.get('page')) || 1,
    };

    // Only update if filters actually changed
    const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(filters);
    if (filtersChanged) {
      console.log('📍 URL params changed, updating filters:', newFilters);
      setFilters(newFilters);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('🔄 Filters changed, loading trips:', filters);
    loadTrips();
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading trips with filters:', filters);

      // Get all trips first (simpler approach)
      const tripsSnapshot = await getDocs(collection(db, 'trips'));
      let tripsData = tripsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || new Date()
      }));

      // Keep original data for debugging
      const originalTripsData = [...tripsData];

      console.log('📊 Raw trips from Firebase:', tripsData.length);
      console.log('📊 Sample trip data:', tripsData[0]);

      // Apply all filters client-side
      console.log('🔍 Applying filters client-side...');

      // Category filter
      if (filters.category) {
        console.log('📂 Filtering by category:', filters.category);
        console.log('📂 All trip category fields:', tripsData.map(trip => ({
          title: trip.title,
          categoryId: trip.categoryId,
          category_id: trip.category_id,
          category: trip.category,
          destination: trip.destination,
          location: trip.location
        })));

        const beforeCount = tripsData.length;
        tripsData = tripsData.filter(trip => {
          // Check all possible category field names
          const categoryMatches = [
            trip.categoryId,
            trip.category_id,
            trip.category,
            trip.destination,
            trip.location
          ].some(field => field === filters.category);

          if (categoryMatches) {
            console.log('📂 ✅ Trip matches category:', trip.title);
          }
          return categoryMatches;
        });
        console.log(`📂 Category filter: ${beforeCount} → ${tripsData.length} trips`);

        if (tripsData.length === 0) {
          console.log('❌ No trips found for category:', filters.category);
          console.log('❌ Available categories in trips:', [...new Set(originalTripsData.map(trip =>
            trip.categoryId || trip.category_id || trip.category || trip.destination || trip.location
          ).filter(Boolean))]);
        }
      }

      // Featured filter
      if (filters.featured === 'true') {
        console.log('⭐ Filtering by featured');
        tripsData = tripsData.filter(trip => trip.featured === true);
        console.log('⭐ After featured filter:', tripsData.length);
      }

      // Difficulty filter
      if (filters.difficulty) {
        console.log('🏔️ Filtering by difficulty:', filters.difficulty);
        tripsData = tripsData.filter(trip =>
          trip.difficultyLevel === filters.difficulty ||
          trip.difficulty_level === filters.difficulty ||
          trip.difficulty === filters.difficulty
        );
        console.log('🏔️ After difficulty filter:', tripsData.length);
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        console.log('🔍 Applying search filter:', searchTerm);
        tripsData = tripsData.filter(trip =>
          trip.title?.toLowerCase().includes(searchTerm) ||
          trip.shortDescription?.toLowerCase().includes(searchTerm) ||
          trip.description?.toLowerCase().includes(searchTerm) ||
          trip.destination?.toLowerCase().includes(searchTerm)
        );
        console.log('🔍 After search filter:', tripsData.length);
      }

      // Price filters
      if (filters.minPrice) {
        console.log('💰 Applying min price filter:', filters.minPrice);
        tripsData = tripsData.filter(trip => trip.price >= parseFloat(filters.minPrice));
        console.log('💰 After min price filter:', tripsData.length);
      }

      if (filters.maxPrice) {
        console.log('💰 Applying max price filter:', filters.maxPrice);
        tripsData = tripsData.filter(trip => trip.price <= parseFloat(filters.maxPrice));
        console.log('💰 After max price filter:', tripsData.length);
      }

      // Apply sorting
      const sortField = filters.sortBy === 'created_at' ? 'createdAt' :
                       filters.sortBy === 'title' ? 'title' : 'price';
      const sortDirection = filters.sortOrder === 'ASC' ? 1 : -1;
      console.log('🔄 Sorting by:', sortField, filters.sortOrder);

      tripsData.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'createdAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) return -1 * sortDirection;
        if (aValue > bValue) return 1 * sortDirection;
        return 0;
      });

      // Apply pagination
      const itemsPerPage = 12;
      const startIndex = (filters.page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTrips = tripsData.slice(startIndex, endIndex);
      const totalPages = Math.ceil(tripsData.length / itemsPerPage);

      setTrips(paginatedTrips);
      setPagination({
        page: filters.page,
        limit: itemsPerPage,
        total: tripsData.length,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
        totalPages: totalPages
      });

      console.log('✅ Final trips loaded:', paginatedTrips.length, 'of', tripsData.length);
    } catch (error) {
      console.error('❌ Error loading trips:', error);
      setTrips([]);
      setPagination({
        page: 1,
        limit: 12,
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
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesData);
      console.log('📂 Loaded categories from Firebase:', categoriesData.length);
      console.log('📂 Categories data:', categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const updateFilters = (newFilters) => {
    console.log('🔄 Updating filters:', newFilters);

    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    console.log('🔄 Updated filters:', updatedFilters);

    // Update URL params directly without setting filters state
    // The useEffect will handle setting filters from URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        params.set(key, value.toString());
      }
    });
    console.log('🔄 Setting URL params:', params.toString());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      difficulty: '',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Discover Amazing Trips</h1>
              <p className="mt-2 text-gray-600">
                Explore our curated collection of unforgettable travel experiences
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
                  placeholder="Search trips..."
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
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => {
                          console.log('📂 Category selected:', e.target.value);
                          updateFilters({ category: e.target.value });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Destinations</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name || category.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
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

                    {/* Difficulty Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={filters.difficulty}
                        onChange={(e) => updateFilters({ difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Levels</option>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="challenging">Challenging</option>
                        <option value="difficult">Difficult</option>
                      </select>
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
                        <span className="ml-2 text-sm text-gray-700">Featured trips only</span>
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
                        <option value="price-ASC">Price: Low to High</option>
                        <option value="price-DESC">Price: High to Low</option>
                        <option value="title-ASC">Name: A to Z</option>
                        <option value="title-DESC">Name: Z to A</option>
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
                      Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} trips
                    </>
                  ) : (
                    'Loading trips...'
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
                <LoadingSpinner size="large" text="Loading amazing trips..." />
              </div>
            ) : (
              <>
                {/* Trips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {trips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link to={`/trips/${trip.slug}`}>
                        <Card hover padding="none" className="overflow-hidden h-full">
                          <div className="relative">
                            <img
                              src={trip.mainImage || trip.main_image || trip.image || trip.photo || `https://picsum.photos/500/300?random=${1100 + index}`}
                              alt={trip.title}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                console.log('🖼️ Trip image failed to load:', e.target.src);
                                e.target.src = `https://picsum.photos/500/300?random=${1100 + index}`;
                              }}
                            />
                            <div className="absolute top-4 left-4">
                              {trip.featured && (
                                <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="absolute top-4 right-4 flex items-center space-x-2">
                              <WishlistButton
                                itemId={trip.id}
                                itemType="trip"
                                itemTitle={trip.title}
                                itemImage={trip.mainImage || trip.main_image}
                                itemPrice={trip.price}
                                itemLocation={trip.location}
                                size="sm"
                                variant="ghost"
                                showText={false}
                                className="bg-white/80 hover:bg-white rounded-full p-1"
                              />
                              <div className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                                {formatPrice(trip.price)}
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[trip.difficultyLevel || trip.difficulty_level] || 'bg-gray-100 text-gray-800'}`}>
                                {trip.difficultyLevel || trip.difficulty_level}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="flex items-center mb-2">
                              <QuickRating itemId={trip.id} itemType="trip" size="sm" />
                            </div>

                            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                              {trip.title}
                            </h3>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {trip.shortDescription || trip.short_description}
                            </p>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center">
                                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                {trip.durationDays || trip.duration_days} days
                              </div>
                              <div className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-1" />
                                Max {trip.maxParticipants || trip.max_participants}
                              </div>
                            </div>
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
                {trips.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <MapPinIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
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

export default Trips;
