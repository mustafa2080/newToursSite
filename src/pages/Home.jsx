import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { getFeaturedTrips } from '../services/firebase/trips';
import { getFeaturedHotels } from '../services/firebase/hotels';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QuickRating from '../components/reviews/QuickRating';
import RealTimeStats from '../components/common/RealTimeStats';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { convertFirebaseStorageUrl } from '../utils/firebaseStorageHelper';
import { getMainImage } from '../utils/imageUtils';

// Helper function to get appropriate gradient backgrounds for categories
const getCategoryGradient = (categoryName) => {
  const categoryGradients = {
    'Mountain': 'from-slate-600 via-gray-700 to-slate-800',
    'Beach': 'from-cyan-400 via-blue-500 to-indigo-600',
    'Cultural': 'from-amber-500 via-orange-600 to-red-600',
    'Therapeutic': 'from-emerald-400 via-teal-500 to-cyan-600',
    'Adventure': 'from-orange-500 via-red-600 to-pink-600',
    'City': 'from-gray-600 via-slate-700 to-zinc-800',
    'Nature': 'from-green-500 via-emerald-600 to-teal-700',
    'Desert': 'from-yellow-500 via-orange-600 to-red-700',
    'Historical': 'from-stone-600 via-amber-700 to-yellow-800',
    'Religious': 'from-purple-600 via-indigo-700 to-blue-800'
  };

  // Return specific gradient for category or default
  return categoryGradients[categoryName] || 'from-blue-500 via-purple-600 to-pink-600';
};

// Helper function to get appropriate icons for categories
const getCategoryIcon = (categoryName) => {
  const categoryIcons = {
    'Mountain': '🏔️',
    'Beach': '🏖️',
    'Cultural': '🏛️',
    'Therapeutic': '🧘‍♀️',
    'Adventure': '🎯',
    'City': '🏙️',
    'Nature': '🌿',
    'Desert': '🏜️',
    'Historical': '🏺',
    'Religious': '🕌'
  };

  return categoryIcons[categoryName] || '🏞️';
};

// Helper function to extract image URL from item data
const getImageFromItem = (item) => {
  return getMainImage(item, 'general', Math.random() * 1000);
};

// Helper function to get valid image URL
const getValidImageUrl = (imageUrl, fallbackUrl) => {
  if (!imageUrl) return fallbackUrl;

  // Handle compressed image objects
  if (typeof imageUrl === 'object' && imageUrl.base64) {
    return imageUrl.base64;
  }

  // Ensure it's a string
  if (typeof imageUrl !== 'string') {
    return fallbackUrl;
  }

  // Check if it's a blob URL from different localhost port
  if (imageUrl.startsWith('blob:http://localhost:') && !imageUrl.includes('5173')) {
    return fallbackUrl;
  }

  // Check if it's a valid HTTP/HTTPS URL or base64 data URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  // If it's a relative path or invalid, use fallback
  return fallbackUrl;
};

const Home = () => {
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load featured trips from Firebase
      console.log('🏠 Loading featured trips from Firebase...');
      const tripsRes = await getFeaturedTrips(6);
      const featuredTripsData = tripsRes?.trips || [];
      setFeaturedTrips(featuredTripsData);

      // Load featured hotels from Firebase
      console.log('🏠 Loading featured hotels from Firebase...');
      const hotelsRes = await getFeaturedHotels(6);
      const featuredHotelsData = hotelsRes?.hotels || [];
      setFeaturedHotels(featuredHotelsData);

      // Load categories from Firebase
      console.log('🏠 Loading categories from Firebase...');
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const allCategories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter active categories only
      const activeCategories = allCategories.filter(cat => cat.status === 'active' || !cat.status);

      // Load trips and hotels count for each category
      for (const category of activeCategories) {
        try {
          // Count trips in this category
          const tripsSnapshot = await getDocs(collection(db, 'trips'));
          const categoryTrips = tripsSnapshot.docs.filter(doc => {
            const tripData = doc.data();
            return tripData.categoryId === category.id && (tripData.status === 'active' || !tripData.status);
          });
          category.tripsCount = categoryTrips.length;

          // Count hotels in this category
          const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
          const categoryHotels = hotelsSnapshot.docs.filter(doc => {
            const hotelData = doc.data();
            return hotelData.categoryId === category.id && (hotelData.status === 'active' || !hotelData.status);
          });
          category.hotelsCount = categoryHotels.length;
        } catch (error) {
          console.log(`⚠️ Error loading counts for category ${category.name}:`, error);
          category.tripsCount = 0;
          category.hotelsCount = 0;
        }
      }

      // Log categories with detailed info
      console.log('📂 Categories loaded with details:', activeCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        hasImage: !!cat.image,
        imageType: cat.image ? (cat.image.startsWith('data:') ? 'base64' : 'url') : 'none',
        imageLength: cat.image ? cat.image.length : 0,
        status: cat.status,
        slug: cat.slug,
        tripsCount: cat.tripsCount || 0,
        hotelsCount: cat.hotelsCount || 0,
        totalContent: (cat.tripsCount || 0) + (cat.hotelsCount || 0)
      })));

      // Log detailed info for categories with images
      activeCategories.forEach(cat => {
        if (cat.image) {
          console.log(`🖼️ Category "${cat.name}" details:`, {
            image: {
              type: cat.image.startsWith('data:') ? 'base64' : 'url',
              length: cat.image.length,
              preview: cat.image.substring(0, 50) + '...'
            },
            content: {
              trips: cat.tripsCount || 0,
              hotels: cat.hotelsCount || 0,
              total: (cat.tripsCount || 0) + (cat.hotelsCount || 0)
            }
          });
        } else {
          console.log(`❌ Category "${cat.name}" missing image - has ${(cat.tripsCount || 0) + (cat.hotelsCount || 0)} total content items`);
        }
      });

      // Fix Firebase Storage URLs and validate images for categories
      const categoriesWithFixedUrls = activeCategories.map(category => {
        let fixedImage = category.image;

        if (category.image) {
          // Fix Firebase Storage URLs
          fixedImage = convertFirebaseStorageUrl(category.image);

          // Validate base64 images
          if (fixedImage.startsWith('data:') && !fixedImage.startsWith('data:image/')) {
            console.log(`⚠️ Invalid base64 format for ${category.name}, using fallback`);
            fixedImage = getCategoryFallbackImage(category.name, 0);
          }

          // Check for corrupted base64
          if (fixedImage.startsWith('data:image/') && fixedImage.length < 100) {
            console.log(`⚠️ Corrupted base64 for ${category.name}, using fallback`);
            fixedImage = getCategoryFallbackImage(category.name, 0);
          }
        }

        return {
          ...category,
          image: fixedImage
        };
      });

      setPopularCategories(categoriesWithFixedUrls);

      console.log('🏠 Home data loaded:', {
        trips: featuredTripsData.length,
        hotels: featuredHotelsData.length,
        categories: activeCategories.length
      });

      // Check if we have any data
      const hasAnyData = featuredTripsData.length > 0 || featuredHotelsData.length > 0 || activeCategories.length > 0;
      setHasData(hasAnyData);

      if (!hasAnyData) {
        console.log('⚠️ No data found in Firebase. Please add data from Admin Dashboard.');
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      // Set empty arrays on error
      setFeaturedTrips([]);
      setFeaturedHotels([]);
      setPopularCategories([]);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading amazing destinations..." />
      </div>
    );
  }

  // Show empty state if no data
  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to Tours
            </h1>
            <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto">
              Your adventure starts here. Discover amazing destinations and create unforgettable memories.
            </p>
          </div>
        </section>

        {/* Empty State */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">🔥</div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                No Data Found
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                The Firebase database is empty. Please go to the Admin Dashboard and click "⚡ Quick Add Data" or "🔥 Initialize Firebase" to add sample data.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/admin')}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  Go to Admin Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://picsum.photos/1920/1080?random=500")',
          }}
        ></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Discover Your Next
            <span className="text-yellow-400"> Adventure</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-6 text-gray-200"
          >
            Explore breathtaking destinations and create unforgettable memories with our curated travel experiences.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg p-2 shadow-lg">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" size="large" className="sm:px-8">
                Search
              </Button>
            </div>
          </motion.form>

          {/* Real-Time Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <RealTimeStats />
          </motion.div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="w-full py-16 bg-gray-50">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Popular Destinations
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Explore our most loved destinations around the world
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.isArray(popularCategories) && popularCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/categories/${category.slug || category.id}`}>
                  <Card hover className="text-center group">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <div className={`w-full h-32 bg-gradient-to-br ${getCategoryGradient(category.name)} flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300`}>
                        {/* Main icon in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl text-white drop-shadow-lg">{getCategoryIcon(category.name)}</span>
                        </div>

                        {/* Decorative pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-2 left-2 text-2xl text-white">{getCategoryIcon(category.name)}</div>
                          <div className="absolute bottom-2 right-2 text-xl text-white">{getCategoryIcon(category.name)}</div>
                          <div className="absolute top-1/2 left-1/4 text-lg text-white transform -translate-y-1/2">{getCategoryIcon(category.name)}</div>
                        </div>

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white bg-opacity-95 rounded-full p-2 shadow-lg backdrop-blur-sm">
                        <span className="text-lg">{getCategoryIcon(category.name)}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {category.description || 'Explore amazing destinations in this category'}
                    </p>
                    {(category.tripsCount > 0 || category.hotelsCount > 0) && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {category.tripsCount > 0 && (
                          <span>{category.tripsCount} trips</span>
                        )}
                        {category.hotelsCount > 0 && (
                          <span>{category.hotelsCount} hotels</span>
                        )}
                      </div>
                    )}
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="w-full py-16 bg-white">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Featured Trips
              </h2>
              <p className="text-sm text-gray-600">
                Handpicked adventures for the ultimate travel experience
              </p>
            </div>
            <Link to="/trips">
              <Button variant="outline" icon={<ArrowRightIcon />} iconPosition="right">
                View All Trips
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(featuredTrips) && featuredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/trips/${trip.slug}`}>
                  <Card hover padding="none" className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={getValidImageUrl(getImageFromItem(trip), `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80`)}
                        alt={trip.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.log('🖼️ Home trip image failed to load:', e.target.src);
                          e.target.src = `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80`;
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-blue-600">
                        {formatPrice(trip.price)}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        <QuickRating
                          itemId={trip.id}
                          itemType="trip"
                          size="sm"
                          showCount={true}
                        />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {trip.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {trip.shortDescription || trip.short_description || trip.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {trip.durationDays || trip.duration_days || 'N/A'} days
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          Max {trip.maxParticipants || trip.max_participants || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="w-full py-16 bg-gray-50">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Featured Hotels
              </h2>
              <p className="text-sm text-gray-600">
                Luxury accommodations for your perfect stay
              </p>
            </div>
            <Link to="/hotels">
              <Button variant="outline" icon={<ArrowRightIcon />} iconPosition="right">
                View All Hotels
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(featuredHotels) && featuredHotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/hotels/${hotel.slug}`}>
                  <Card hover padding="none" className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={getValidImageUrl(getImageFromItem(hotel), `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80`)}
                        alt={hotel.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.log('🖼️ Home hotel image failed to load:', e.target.src);
                          e.target.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80`;
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-blue-600">
                        {formatPrice(hotel.pricePerNight || hotel.price_per_night || 0)}/night
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {renderStars(hotel.starRating || hotel.star_rating || 0)}
                          <span className="ml-2 text-xs text-gray-500">Hotel Rating</span>
                        </div>
                        <div className="flex items-center">
                          <QuickRating
                            itemId={hotel.id}
                            itemType="hotel"
                            size="sm"
                            showCount={true}
                          />
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {hotel.location || hotel.city || 'Location'}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {hotel.shortDescription || hotel.short_description || hotel.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-blue-600 text-white">
        <div className="w-full max-w-none text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-3">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-sm text-blue-100 mb-6">
              Join thousands of travelers who have discovered amazing destinations with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/trips">
                <Button size="large" variant="ghost" className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 font-semibold">
                  Explore Trips
                </Button>
              </Link>
              <Link to="/hotels">
                <Button size="large" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Find Hotels
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
