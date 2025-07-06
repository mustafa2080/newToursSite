import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Card from '../common/Card';
import ImageUpload from '../common/ImageUpload';

const HotelForm = ({ hotel = null, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    location: '',
    address: '',
    star_rating: 3,
    price_per_night: '',
    total_rooms: '',
    rooms_available: '',
    amenities: [],
    facilities: [],
    room_types: [],
    check_in_time: '15:00',
    check_out_time: '11:00',
    cancellation_policy: '',
    booking_policy: '',
    google_maps_link: '',
    full_address: '',
    featured: false,
    status: 'draft',
  });

  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };
  const [errors, setErrors] = useState({});
  const [currentAmenity, setCurrentAmenity] = useState('');
  const [currentFacility, setCurrentFacility] = useState('');
  const [currentRoomType, setCurrentRoomType] = useState('');

  // Initialize form with hotel data if editing
  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        short_description: hotel.short_description || '',
        location: hotel.location || '',
        address: hotel.address || '',
        star_rating: hotel.star_rating || 3,
        price_per_night: hotel.price_per_night?.toString() || '',
        total_rooms: hotel.total_rooms?.toString() || '',
        rooms_available: hotel.rooms_available?.toString() || '',
        amenities: hotel.amenities || [],
        facilities: hotel.facilities || [],
        room_types: hotel.room_types || [],
        check_in_time: hotel.check_in_time || '15:00',
        check_out_time: hotel.check_out_time || '11:00',
        cancellation_policy: hotel.cancellation_policy || '',
        booking_policy: hotel.booking_policy || '',
        google_maps_link: hotel.google_maps_link || '',
        full_address: hotel.full_address || '',
        featured: hotel.featured || false,
        status: hotel.status || 'draft',
      });

      // Set images if available - handle different field names
      const imageFields = [
        hotel.images,
        hotel.gallery,
        hotel.image_gallery,
        hotel.photos
      ];

      let hotelImages = [];

      // Add main image first if exists
      const mainImage = hotel.mainImage || hotel.main_image || hotel.image || hotel.photo;
      if (mainImage && typeof mainImage === 'string' && mainImage.trim() !== '') {
        hotelImages.push({
          id: 0,
          url: mainImage,
          name: 'Main image',
          size: 0,
          type: 'image/jpeg',
          isMain: true
        });
      }

      // Add gallery images
      for (const field of imageFields) {
        if (field && Array.isArray(field) && field.length > 0) {
          const galleryImages = field
            .filter(img => img && typeof img === 'string' && img.trim() !== '' && img !== mainImage)
            .map((img, index) => ({
              id: hotelImages.length + index,
              url: img,
              name: `Gallery image ${index + 1}`,
              size: 0,
              type: 'image/jpeg',
              isMain: false
            }));
          hotelImages = [...hotelImages, ...galleryImages];
          break; // Use the first valid gallery we find
        }
      }

      if (hotelImages.length > 0) {
        setImages(hotelImages);
        // Set main image index (first image is main by default)
        setMainImageIndex(0);
      }
    }
  }, [hotel]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addToList = (listName, value, setValue) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [listName]: [...prev[listName], value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromList = (listName, index) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Hotel name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.price_per_night || parseFloat(formData.price_per_night) <= 0) newErrors.price_per_night = 'Valid price per night is required';
    if (!formData.total_rooms || parseInt(formData.total_rooms) <= 0) newErrors.total_rooms = 'Valid total rooms is required';
    if (!formData.rooms_available || parseInt(formData.rooms_available) < 0) newErrors.rooms_available = 'Valid available rooms is required';
    if (parseInt(formData.rooms_available) > parseInt(formData.total_rooms)) newErrors.rooms_available = 'Available rooms cannot exceed total rooms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        total_rooms: parseInt(formData.total_rooms),
        rooms_available: parseInt(formData.rooms_available),
        star_rating: parseInt(formData.star_rating),
        // Separate main image and gallery
        mainImage: images[mainImageIndex]?.url || images[0]?.url || '',
        gallery: images.filter((_, index) => index !== mainImageIndex).map(img => img.url),
        // Keep legacy fields for compatibility
        images: images.map(img => img.url),
        main_image: images[mainImageIndex]?.url || images[0]?.url || '',
        slug: formData.name ? generateSlug(formData.name) : '',
      };
      
      onSubmit(submitData);
    }
  };

  const commonAmenities = [
    'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant',
    'Bar', 'Room Service', 'Concierge', 'Parking', 'Airport Shuttle',
    'Business Center', 'Conference Rooms', 'Laundry Service', 'Pet Friendly',
    'Air Conditioning', 'Balcony', 'Ocean View', 'City View'
  ];

  const commonFacilities = [
    'Swimming Pool', 'Free WiFi', 'Parking', 'Fitness Center', 'Spa & Wellness',
    'Restaurant', 'Bar/Lounge', 'Room Service', 'Business Center', 'Conference Rooms',
    'Airport Shuttle', 'Concierge Service', 'Laundry Service', 'Dry Cleaning',
    'Currency Exchange', 'Tour Desk', 'Car Rental', 'Babysitting Service',
    'Pet Friendly', 'Wheelchair Accessible', '24-Hour Front Desk', 'Elevator',
    'Safe Deposit Box', 'Luggage Storage', 'Wake-up Service', 'Ironing Service',
    'Shoe Shine', 'Newspaper', 'Fax/Photocopying', 'ATM/Cash Machine'
  ];

  const commonRoomTypes = [
    'Standard Room', 'Deluxe Room', 'Suite', 'Executive Room', 'Family Room',
    'Single Room', 'Double Room', 'Twin Room', 'King Room', 'Queen Room',
    'Presidential Suite', 'Penthouse', 'Studio', 'Apartment'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter hotel name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="City, Country"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Complete address"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Star Rating
            </label>
            <select
              name="star_rating"
              value={formData.star_rating}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>
                  {rating} Star{rating > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Night (USD) *
            </label>
            <input
              type="number"
              name="price_per_night"
              value={formData.price_per_night}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price_per_night ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price_per_night && <p className="text-red-500 text-sm mt-1">{errors.price_per_night}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Rooms *
            </label>
            <input
              type="number"
              name="total_rooms"
              value={formData.total_rooms}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.total_rooms ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1"
            />
            {errors.total_rooms && <p className="text-red-500 text-sm mt-1">{errors.total_rooms}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Rooms *
            </label>
            <input
              type="number"
              name="rooms_available"
              value={formData.rooms_available}
              onChange={handleInputChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.rooms_available ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.rooms_available && <p className="text-red-500 text-sm mt-1">{errors.rooms_available}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Time
            </label>
            <input
              type="time"
              name="check_in_time"
              value={formData.check_in_time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Time
            </label>
            <input
              type="time"
              name="check_out_time"
              value={formData.check_out_time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Featured Hotel
            </label>
          </div>
        </div>
      </Card>

      {/* Descriptions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Descriptions
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description *
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.short_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description for listings"
            />
            {errors.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Detailed description of the hotel"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Policy
            </label>
            <textarea
              name="cancellation_policy"
              value={formData.cancellation_policy}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cancellation policy details"
            />
          </div>
        </div>
      </Card>

      {/* Images */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PhotoIcon className="h-5 w-5 mr-2" />
          Hotel Images
        </h3>
        
        <ImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={15}
          showMainImageSelector={true}
          mainImageIndex={mainImageIndex}
          onMainImageChange={setMainImageIndex}
          compressionType="hotelGallery"
        />
        <p className="text-sm text-gray-600 mt-4">
          Upload high-quality images of your hotel. The first image will be used as the main cover image.
        </p>
      </Card>

      {/* Hotel Facilities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          Hotel Facilities
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the facilities and services available at your hotel.
        </p>

        <div className="space-y-4">
          {/* Current Facilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {formData.facilities.map((facility, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm text-gray-900">{facility}</span>
                <button
                  type="button"
                  onClick={() => removeFromList('facilities', index)}
                  className="text-red-600 hover:text-red-800 text-sm ml-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add New Facility */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentFacility}
                onChange={(e) => setCurrentFacility(e.target.value)}
                placeholder="Add custom facility..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToList('facilities', currentFacility, setCurrentFacility);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addToList('facilities', currentFacility, setCurrentFacility)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add
              </button>
            </div>

            {/* Quick Add Common Facilities */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Add Common Facilities:</p>
              <div className="flex flex-wrap gap-2">
                {commonFacilities.filter(facility => !formData.facilities.includes(facility)).map((facility) => (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => addToList('facilities', facility, () => {})}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    + {facility}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Booking & Cancellation Policies */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Booking & Cancellation Policies
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Define your hotel's booking terms and cancellation policies.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Policy
            </label>
            <textarea
              name="booking_policy"
              value={formData.booking_policy}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Check-in from 3:00 PM, Check-out until 11:00 AM. Valid ID required. Credit card authorization for incidentals..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Policy
            </label>
            <textarea
              name="cancellation_policy"
              value={formData.cancellation_policy}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Free cancellation until 24 hours before check-in. Late cancellations or no-shows will be charged one night's stay..."
            />
          </div>
        </div>
      </Card>

      {/* Location & Maps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2" />
          Location & Maps
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide detailed location information to help guests find your hotel.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address *
            </label>
            <textarea
              name="full_address"
              value={formData.full_address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the complete address including street, city, state/province, postal code, and country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps Link (Optional)
            </label>
            <input
              type="url"
              name="google_maps_link"
              value={formData.google_maps_link}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste a Google Maps link to your hotel's exact location
            </p>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Saving...' : hotel ? 'Update Hotel' : 'Create Hotel'}
        </Button>
      </div>
    </form>
  );
};

export default HotelForm;
