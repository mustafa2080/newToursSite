import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UsersIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { tripsAPI, hotelsAPI, formatCurrency } from '../../utils/postgresApi';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const InteractiveMap = ({ className = '' }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mapType, setMapType] = useState('trips'); // 'trips' or 'hotels'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    rating: '',
    category: ''
  });
  const [mapData, setMapData] = useState([]);

  // Initialize map
  useEffect(() => {
    if (!window.google) {
      loadGoogleMapsScript();
      return;
    }
    initializeMap();
  }, []);

  // Load data when map type changes
  useEffect(() => {
    if (map) {
      loadMapData();
    }
  }, [mapType, filters, map]);

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
      zoom: 4,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }, { lightness: 17 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }, { lightness: 18 }]
        },
        {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }, { lightness: 16 }]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'cooperative'
    });

    setMap(mapInstance);
    setLoading(false);
  };

  const loadMapData = async () => {
    try {
      setLoading(true);
      let response;
      
      if (mapType === 'trips') {
        response = await tripsAPI.getAll({ 
          featured: true, 
          limit: 50,
          ...filters 
        });
      } else {
        response = await hotelsAPI.getAll({ 
          featured: true, 
          limit: 50,
          ...filters 
        });
      }

      const data = response.data || [];
      setMapData(data);
      createMarkers(data);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMarkers = (data) => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    if (!map || !window.google) return;

    const newMarkers = data.map(item => {
      // Use coordinates if available, otherwise geocode the location
      const position = item.coordinates || getLocationCoordinates(item);
      
      if (!position) return null;

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: mapType === 'trips' ? item.title : item.name,
        icon: {
          url: mapType === 'trips' 
            ? '/icons/trip-marker.svg' 
            : '/icons/hotel-marker.svg',
          scaledSize: new window.google.maps.Size(40, 40),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(20, 40)
        },
        animation: window.google.maps.Animation.DROP
      });

      marker.addListener('click', () => {
        setSelectedItem(item);
        map.panTo(position);
        map.setZoom(12);
      });

      return marker;
    }).filter(Boolean);

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  };

  const getLocationCoordinates = (item) => {
    // This would typically use a geocoding service
    // For demo purposes, return some sample coordinates
    const sampleCoordinates = {
      'Turkey': { lat: 39.9334, lng: 32.8597 },
      'Greece': { lat: 39.0742, lng: 21.8243 },
      'Italy': { lat: 41.8719, lng: 12.5674 },
      'Spain': { lat: 40.4637, lng: -3.7492 },
      'France': { lat: 46.6034, lng: 1.8883 },
      'Santorini': { lat: 36.3932, lng: 25.4615 },
      'Istanbul': { lat: 41.0082, lng: 28.9784 },
      'Rome': { lat: 41.9028, lng: 12.4964 },
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 }
    };

    const location = item.city || item.location || item.category?.name;
    return sampleCoordinates[location] || null;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const filtered = mapData.filter(item => 
        (mapType === 'trips' ? item.title : item.name)
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      createMarkers(filtered);
    } else {
      createMarkers(mapData);
    }
  };

  const renderItemCard = (item) => (
    <Card className="w-80 max-h-96 overflow-y-auto">
      <div className="relative">
        <img
          src={item.main_image || '/images/placeholder.jpg'}
          alt={mapType === 'trips' ? item.title : item.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <button
          onClick={() => setSelectedItem(null)}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
        >
          <XMarkIcon className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {mapType === 'trips' ? item.title : item.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.short_description || item.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {item.city || item.location || 'Location not specified'}
          </div>
          
          {item.average_rating > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <StarIcon className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
              {item.average_rating.toFixed(1)} ({item.review_count} reviews)
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
            {formatCurrency(mapType === 'trips' ? item.price : item.price_per_night)}
            {mapType === 'hotel' && ' / night'}
          </div>

          {mapType === 'trips' && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                {item.duration_days} days
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UsersIcon className="h-4 w-4 mr-1" />
                Max {item.max_participants} participants
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            size="small"
            className="flex-1"
            onClick={() => window.open(`/${mapType}s/${item.slug}`, '_blank')}
          >
            View Details
          </Button>
          <Button
            size="small"
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`/${mapType}s/${item.slug}?book=true`, '_blank')}
          >
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card className="p-3">
          <div className="flex space-x-2 mb-3">
            <Button
              size="small"
              variant={mapType === 'trips' ? 'primary' : 'outline'}
              onClick={() => setMapType('trips')}
            >
              Trips
            </Button>
            <Button
              size="small"
              variant={mapType === 'hotels' ? 'primary' : 'outline'}
              onClick={() => setMapType('hotels')}
            >
              Hotels
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${mapType}...`}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </Card>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
          <LoadingSpinner size="large" />
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full min-h-[500px] rounded-lg"
        style={{ minHeight: '500px' }}
      />

      {/* Selected Item Popup */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
          >
            {renderItemCard(selectedItem)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="p-3">
          <h4 className="font-medium text-sm text-gray-900 mb-2">Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-3 h-3 bg-primary-600 rounded-full mr-2"></div>
              {mapType === 'trips' ? 'Trip Locations' : 'Hotel Locations'}
            </div>
            <div className="text-xs text-gray-500">
              Click markers for details
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveMap;
