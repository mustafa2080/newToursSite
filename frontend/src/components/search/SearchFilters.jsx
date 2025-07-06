import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const SearchFilters = ({ filters, onFiltersChange, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contentTypes = [
    { id: 'trip', label: 'Trips', icon: '🗺️' },
    { id: 'hotel', label: 'Hotels', icon: '🏨' },
    { id: 'review', label: 'Reviews', icon: '⭐' },
    { id: 'page', label: 'Pages', icon: '📄' }
  ];

  const categories = [
    { id: '', label: 'All Categories' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'safari', label: 'Safari' },
    { id: 'beach', label: 'Beach' },
    { id: 'city', label: 'City Tours' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'budget', label: 'Budget' },
    { id: 'family', label: 'Family' },
    { id: 'romantic', label: 'Romantic' }
  ];

  const locations = [
    { id: '', label: 'All Locations' },
    { id: 'africa', label: 'Africa' },
    { id: 'asia', label: 'Asia' },
    { id: 'europe', label: 'Europe' },
    { id: 'americas', label: 'Americas' },
    { id: 'oceania', label: 'Oceania' }
  ];

  const priceRanges = [
    { id: null, label: 'Any Price' },
    { id: [0, 500], label: 'Under $500' },
    { id: [500, 1000], label: '$500 - $1,000' },
    { id: [1000, 2000], label: '$1,000 - $2,000' },
    { id: [2000, 5000], label: '$2,000 - $5,000' },
    { id: [5000, 999999], label: 'Over $5,000' }
  ];

  const handleTypeToggle = (typeId) => {
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter(t => t !== typeId)
      : [...filters.types, typeId];
    
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleCategoryChange = (categoryId) => {
    onFiltersChange({ ...filters, category: categoryId });
  };

  const handleLocationChange = (locationId) => {
    onFiltersChange({ ...filters, location: locationId });
  };

  const handlePriceRangeChange = (priceRange) => {
    onFiltersChange({ ...filters, priceRange });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      types: ['trip', 'hotel', 'review', 'page'],
      category: '',
      location: '',
      priceRange: null
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.types.length < 4 ||
      filters.category ||
      filters.location ||
      filters.priceRange
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.types.length < 4) count++;
    if (filters.category) count++;
    if (filters.location) count++;
    if (filters.priceRange) count++;
    return count;
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <XMarkIcon className="h-3 w-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Content Types */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Content Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeToggle(type.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filters.types.includes(type.id)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-1">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <TagIcon className="inline h-3 w-3 mr-1" />
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <MapPinIcon className="inline h-3 w-3 mr-1" />
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="inline h-3 w-3 mr-1" />
                  Price Range
                </label>
                <div className="space-y-1">
                  {priceRanges.map((range, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={JSON.stringify(filters.priceRange) === JSON.stringify(range.id)}
                        onChange={() => handlePriceRangeChange(range.id)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-xs text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Filters (Always Visible) */}
      {!isExpanded && hasActiveFilters() && (
        <div className="p-3 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {filters.types.length < 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.types.length} type{filters.types.length !== 1 ? 's' : ''}
                <button
                  onClick={() => onFiltersChange({ ...filters, types: ['trip', 'hotel', 'review', 'page'] })}
                  className="ml-1 hover:text-blue-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {categories.find(c => c.id === filters.category)?.label}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 hover:text-green-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.location && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {locations.find(l => l.id === filters.location)?.label}
                <button
                  onClick={() => handleLocationChange('')}
                  className="ml-1 hover:text-purple-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.priceRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {priceRanges.find(p => JSON.stringify(p.id) === JSON.stringify(filters.priceRange))?.label}
                <button
                  onClick={() => handlePriceRangeChange(null)}
                  className="ml-1 hover:text-yellow-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
