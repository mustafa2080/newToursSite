import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  StarIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [trips, setTrips] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all'); // all, trips, hotels

  useEffect(() => {
    loadCategoryData();
  }, [slug]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading category data for slug:', slug);

      // Load category by slug or id
      const categoriesRef = collection(db, 'categories');
      const categoryQuery = query(categoriesRef, where('slug', '==', slug));
      const categorySnapshot = await getDocs(categoryQuery);
      
      let categoryData = null;
      if (!categorySnapshot.empty) {
        const categoryDoc = categorySnapshot.docs[0];
        categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
      } else {
        // Try to find by ID if slug doesn't work
        try {
          const categoryDoc = await getDoc(doc(db, 'categories', slug));
          if (categoryDoc.exists()) {
            categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
          }
        } catch (error) {
          console.log('Category not found by ID either');
        }
      }

      if (!categoryData) {
        console.error('Category not found');
        setCategory(null);
        setTrips([]);
        setHotels([]);
        setLoading(false);
        return;
      }

      setCategory(categoryData);
      console.log('📂 Category loaded:', categoryData);

      // Load trips for this category
      const tripsRef = collection(db, 'trips');
      const tripsQuery = query(tripsRef, where('categoryId', '==', categoryData.id));
      const tripsSnapshot = await getDocs(tripsQuery);
      const tripsData = tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Also try to find trips by category name (fallback)
      if (tripsData.length === 0) {
        const tripsByCategoryQuery = query(tripsRef, where('category', '==', categoryData.name));
        const tripsByCategorySnapshot = await getDocs(tripsByCategoryQuery);
        const tripsByCategoryData = tripsByCategorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        tripsData.push(...tripsByCategoryData);
      }

      setTrips(tripsData);
      console.log('🗺️ Trips loaded:', tripsData.length);

      // Load hotels for this category
      const hotelsRef = collection(db, 'hotels');
      const hotelsQuery = query(hotelsRef, where('categoryId', '==', categoryData.id));
      const hotelsSnapshot = await getDocs(hotelsQuery);
      const hotelsData = hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Also try to find hotels by category name (fallback)
      if (hotelsData.length === 0) {
        const hotelsByCategoryQuery = query(hotelsRef, where('category', '==', categoryData.name));
        const hotelsByCategorySnapshot = await getDocs(hotelsByCategoryQuery);
        const hotelsByCategoryData = hotelsByCategorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        hotelsData.push(...hotelsByCategoryData);
      }

      setHotels(hotelsData);
      console.log('🏨 Hotels loaded:', hotelsData.length);

    } catch (error) {
      console.error('Error loading category data:', error);
      setCategory(null);
      setTrips([]);
      setHotels([]);
    } finally {
      setLoading(false);
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

  const getFilteredAndSortedItems = () => {
    let items = [];
    
    if (filterType === 'all' || filterType === 'trips') {
      items.push(...trips.map(trip => ({ ...trip, type: 'trip' })));
    }
    
    if (filterType === 'all' || filterType === 'hotels') {
      items.push(...hotels.map(hotel => ({ ...hotel, type: 'hotel' })));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      items = items.filter(item => 
        (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location || item.city || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        case 'price':
          const priceA = a.price || a.pricePerNight || a.price_per_night || 0;
          const priceB = b.price || b.pricePerNight || b.price_per_night || 0;
          return priceA - priceB;
        case 'rating':
          const ratingA = a.averageRating || a.average_rating || 0;
          const ratingB = b.averageRating || b.average_rating || 0;
          return ratingB - ratingA;
        default:
          return 0;
      }
    });

    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading category..." />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} icon={<ArrowLeftIcon />}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredAndSortedItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        {category.image && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${category.image})` }}
          ></div>
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="small"
              icon={<ArrowLeftIcon />}
              className="mb-4 border-white text-white hover:bg-white hover:text-gray-900"
            >
              Back to Home
            </Button>
            
            <div className="flex items-center mb-4">
              {category.icon && (
                <span className="text-4xl mr-4">{category.icon}</span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold">
                {category.name}
              </h1>
            </div>
            
            <p className="text-lg text-gray-200 max-w-2xl">
              {category.description || 'Explore amazing destinations in this category'}
            </p>
            
            <div className="flex items-center space-x-6 mt-6 text-sm">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{trips.length} Trips</span>
              </div>
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                <span>{hotels.length} Hotels</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search trips and hotels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All ({filteredItems.length})</option>
                  <option value="trips">Trips ({trips.length})</option>
                  <option value="hotels">Hotels ({hotels.length})</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={`/${item.type === 'trip' ? 'trips' : 'hotels'}/${item.slug}`}>
                  <Card hover padding="none" className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={
                          item.mainImage ||
                          item.main_image ||
                          item.image ||
                          item.photo ||
                          `https://picsum.photos/500/300?random=${item.id}`
                        }
                        alt={item.title || item.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.log('🖼️ Category item image failed to load:', e.target.src);
                          e.target.src = `https://picsum.photos/500/300?random=${item.id}`;
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.type === 'trip' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type === 'trip' ? 'Trip' : 'Hotel'}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                        {item.type === 'trip' 
                          ? formatPrice(item.price || 0)
                          : `${formatPrice(item.pricePerNight || item.price_per_night || 0)}/night`
                        }
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {renderStars(item.averageRating || item.average_rating || 0)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({item.reviewCount || item.review_count || 0} reviews)
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {item.title || item.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.shortDescription || item.short_description || item.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        {item.type === 'trip' ? (
                          <>
                            <div className="flex items-center">
                              <CalendarDaysIcon className="h-4 w-4 mr-1" />
                              {item.durationDays || item.duration_days || 'N/A'} days
                            </div>
                            <div className="flex items-center">
                              <UsersIcon className="h-4 w-4 mr-1" />
                              Max {item.maxParticipants || item.max_participants || 'N/A'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {item.location || item.city || 'Location'}
                            </div>
                            <div className="flex items-center">
                              {renderStars(item.starRating || item.star_rating || 0)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No ${filterType === 'all' ? 'trips or hotels' : filterType} found matching "${searchQuery}"`
                : `No ${filterType === 'all' ? 'trips or hotels' : filterType} found in this category`
              }
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
