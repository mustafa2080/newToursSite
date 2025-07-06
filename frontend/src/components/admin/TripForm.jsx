import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  CurrencyDollarIcon,
  StarIcon,
  DocumentTextIcon,
  CheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Card from '../common/Card';
import ImageUpload from '../common/ImageUpload';

const TripForm = ({ trip = null, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    price: '',
    duration_days: '',
    max_participants: '',
    category_name: '',
    difficulty_level: 'easy',
    location: '',
    highlights: [],
    included: [],
    excluded: [],
    itinerary: [],
    google_maps_link: '',
    coordinates: { lat: '', lng: '' },
    featured: false,
    status: 'draft',
  });

  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };
  const [errors, setErrors] = useState({});
  const [currentHighlight, setCurrentHighlight] = useState('');
  const [currentIncluded, setCurrentIncluded] = useState('');
  const [currentExcluded, setCurrentExcluded] = useState('');

  // Initialize form with trip data if editing
  useEffect(() => {
    if (trip) {
      setFormData({
        title: trip.title || '',
        short_description: trip.short_description || '',
        description: trip.description || '',
        price: trip.price?.toString() || '',
        duration_days: trip.duration_days?.toString() || '',
        max_participants: trip.max_participants?.toString() || '',
        category_name: trip.category_name || '',
        difficulty_level: trip.difficulty_level || 'easy',
        location: trip.location || '',
        highlights: trip.highlights || [],
        included: trip.included || [],
        excluded: trip.excluded || [],
        itinerary: trip.itinerary || [],
        google_maps_link: trip.google_maps_link || '',
        coordinates: trip.coordinates || { lat: '', lng: '' },
        featured: trip.featured || false,
        status: trip.status || 'draft',
      });

      // Set images if available - handle different field names
      const imageFields = [
        trip.images,
        trip.gallery,
        trip.image_gallery,
        trip.photos
      ];

      let tripImages = [];

      // Add main image first if exists
      const mainImage = trip.mainImage || trip.main_image || trip.image || trip.photo;
      if (mainImage && typeof mainImage === 'string' && mainImage.trim() !== '') {
        tripImages.push({
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
              id: tripImages.length + index,
              url: img,
              name: `Gallery image ${index + 1}`,
              size: 0,
              type: 'image/jpeg',
              isMain: false
            }));
          tripImages = [...tripImages, ...galleryImages];
          break; // Use the first valid gallery we find
        }
      }

      if (tripImages.length > 0) {
        setImages(tripImages);
        // Set main image index (first image is main by default)
        setMainImageIndex(0);
      }
    }
  }, [trip]);

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

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, {
        day: prev.itinerary.length + 1,
        title: '',
        description: '',
        activities: []
      }]
    }));
  };

  const updateItineraryDay = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      )
    }));
  };

  const removeItineraryDay = (index) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index).map((day, i) => ({
        ...day,
        day: i + 1
      }))
    }));
  };

  const addActivityToDay = (dayIndex, activity) => {
    if (activity.trim()) {
      setFormData(prev => ({
        ...prev,
        itinerary: prev.itinerary.map((day, i) =>
          i === dayIndex ? {
            ...day,
            activities: [...day.activities, activity.trim()]
          } : day
        )
      }));
    }
  };

  const removeActivityFromDay = (dayIndex, activityIndex) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === dayIndex ? {
          ...day,
          activities: day.activities.filter((_, ai) => ai !== activityIndex)
        } : day
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters';

    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';
    if (formData.short_description.length > 200) newErrors.short_description = 'Short description must be less than 200 characters';
    if (formData.short_description.length < 20) newErrors.short_description = 'Short description must be at least 20 characters';

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 2000) newErrors.description = 'Description must be less than 2000 characters';
    if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';

    if (images.length === 0) newErrors.images = 'At least one image is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.duration_days || parseInt(formData.duration_days) <= 0) newErrors.duration_days = 'Valid duration is required';
    if (!formData.max_participants || parseInt(formData.max_participants) <= 0) newErrors.max_participants = 'Valid max participants is required';
    if (!formData.category_name.trim()) newErrors.category_name = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('📝 Form submission started');
    console.log('📊 Current form data:', formData);
    console.log('🖼️ Current images:', images);

    if (validateForm()) {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        max_participants: parseInt(formData.max_participants),
        // Separate main image and gallery
        mainImage: images[mainImageIndex]?.url || images[0]?.url || '',
        gallery: images.filter((_, index) => index !== mainImageIndex).map(img => img.url),
        // Keep legacy fields for compatibility
        images: images.map(img => img.url),
        main_image: images[mainImageIndex]?.url || images[0]?.url || '',
        slug: formData.title ? generateSlug(formData.title) : '',
      };

      console.log('✅ Form validation passed');
      console.log('📤 Submitting data:', submitData);

      try {
        onSubmit(submitData);
      } catch (error) {
        console.error('❌ Error in form submission:', error);
      }
    } else {
      console.log('❌ Form validation failed');
      console.log('🚨 Validation errors:', errors);
    }
  };

  const defaultCategories = [
    'Beach', 'Mountain', 'Cultural', 'Desert', 'Island', 'Wildlife', 'City', 'Adventure'
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'challenging', label: 'Challenging' },
    { value: 'difficult', label: 'Difficult' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Title * (max 100 characters)
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter trip title (max 100 characters)"
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>
              <p className={`text-xs ${
                formData.title.length > 100 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {formData.title.length}/100
              </p>
            </div>
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
              placeholder="Enter location"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category_name"
              value={formData.category_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category_name ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {(categories.length > 0 ? categories : defaultCategories).map(category => (
                <option key={category.id || category} value={category.name || category}>
                  {category.name || category}
                </option>
              ))}
            </select>
            {errors.category_name && <p className="text-red-500 text-sm mt-1">{errors.category_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Days) *
            </label>
            <input
              type="number"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.duration_days ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1"
            />
            {errors.duration_days && <p className="text-red-500 text-sm mt-1">{errors.duration_days}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Participants *
            </label>
            <input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.max_participants ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1"
            />
            {errors.max_participants && <p className="text-red-500 text-sm mt-1">{errors.max_participants}</p>}
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
              Featured Trip
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
              Short Description * (20-200 characters)
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              rows={3}
              maxLength={200}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.short_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description for listings (20-200 characters)"
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.short_description && <p className="text-red-500 text-sm">{errors.short_description}</p>}
              </div>
              <p className={`text-xs ${
                formData.short_description.length > 200 ? 'text-red-500' :
                formData.short_description.length < 20 ? 'text-yellow-500' : 'text-gray-500'
              }`}>
                {formData.short_description.length}/200
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description * (50-2000 characters)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              maxLength={2000}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Detailed description of the trip (50-2000 characters)"
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
              <p className={`text-xs ${
                formData.description.length > 2000 ? 'text-red-500' :
                formData.description.length < 50 ? 'text-yellow-500' : 'text-gray-500'
              }`}>
                {formData.description.length}/2000
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Images */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PhotoIcon className="h-5 w-5 mr-2" />
          Trip Images
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload high-quality images. The first image will be used as the main cover image.
        </p>

        <ImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={10}
          showMainImageSelector={true}
          mainImageIndex={mainImageIndex}
          onMainImageChange={setMainImageIndex}
          compressionType="tripGallery"
        />

        {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
      </Card>

      {/* Included Services */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckIcon className="h-5 w-5 mr-2 text-green-600" />
          Included Services
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          List all services and amenities that are included in the trip price.
        </p>

        <div className="space-y-3">
          {formData.included.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-900">{item}</span>
              <button
                type="button"
                onClick={() => removeFromList('included', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex space-x-2">
            <input
              type="text"
              value={currentIncluded}
              onChange={(e) => setCurrentIncluded(e.target.value)}
              placeholder="e.g., Airport transfers, All meals, Professional guide..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToList('included', currentIncluded);
                  setCurrentIncluded('');
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                addToList('included', currentIncluded);
                setCurrentIncluded('');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </Card>

      {/* Excluded Services */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <XCircleIcon className="h-5 w-5 mr-2 text-red-600" />
          Excluded Services
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          List services and expenses that are NOT included in the trip price.
        </p>

        <div className="space-y-3">
          {formData.excluded.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <XCircleIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-900">{item}</span>
              <button
                type="button"
                onClick={() => removeFromList('excluded', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex space-x-2">
            <input
              type="text"
              value={currentExcluded}
              onChange={(e) => setCurrentExcluded(e.target.value)}
              placeholder="e.g., International flights, Personal expenses, Travel insurance..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToList('excluded', currentExcluded);
                  setCurrentExcluded('');
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                addToList('excluded', currentExcluded);
                setCurrentExcluded('');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </Card>

      {/* Trip Itinerary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalendarDaysIcon className="h-5 w-5 mr-2" />
          Trip Itinerary
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Create a detailed day-by-day schedule for your trip.
        </p>

        <div className="space-y-4">
          {formData.itinerary.map((day, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Day {day.day}</h4>
                <button
                  type="button"
                  onClick={() => removeItineraryDay(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Day
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day Title
                  </label>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Arrival in Cairo"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day Description
                </label>
                <textarea
                  value={day.description}
                  onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what happens on this day..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activities
                </label>
                <div className="space-y-2">
                  {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm">
                        {activity}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeActivityFromDay(index, actIndex)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add activity..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addActivityToDay(index, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        addActivityToDay(index, input.value);
                        input.value = '';
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItineraryDay}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            + Add Day to Itinerary
          </button>
        </div>
      </Card>

      {/* Location & Maps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2" />
          Location & Maps
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add location details and map links to help travelers find your trip.
        </p>

        <div className="space-y-4">
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
              Paste a Google Maps link to the main location or starting point
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.coordinates.lat}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coordinates: { ...prev.coordinates, lat: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 31.2357"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.coordinates.lng}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coordinates: { ...prev.coordinates, lng: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 29.9553"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Coordinates help with precise location mapping and can be used for distance calculations
          </p>
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
          {isLoading ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
