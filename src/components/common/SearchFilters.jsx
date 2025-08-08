import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  StarIcon,
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { categoriesAPI } from '../../utils/postgresApi';
import Button from './Button';
import Card from './Card';

const SearchFilters = ({ 
  filters, 
  onFiltersChange, 
  searchType = 'trips', // 'trips' or 'hotels'
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      difficulty: '',
      starRating: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
  };

  const priceRanges = [
    { label: 'Under $100', min: 0, max: 100 },
    { label: '$100 - $300', min: 100, max: 300 },
    { label: '$300 - $500', min: 300, max: 500 },
    { label: '$500 - $1000', min: 500, max: 1000 },
    { label: 'Over $1000', min: 1000, max: null }
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'hard', label: 'Hard' },
    { value: 'extreme', label: 'Extreme' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Newest First', order: 'DESC' },
    { value: 'created_at', label: 'Oldest First', order: 'ASC' },
    { value: 'price', label: 'Price: Low to High', order: 'ASC' },
    { value: 'price', label: 'Price: High to Low', order: 'DESC' },
    { value: 'rating', label: 'Highest Rated', order: 'DESC' },
    { value: 'title', label: 'Name: A to Z', order: 'ASC' }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        icon={<FunnelIcon />}
      >
        Filters
        {getActiveFilterCount() > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {getActiveFilterCount()}
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
            >
              <Card className="h-full rounded-none">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center">
                    <AdjustmentsHorizontalIcon className="h-6 w-6 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      Destination
                    </label>
                    <select
                      value={localFilters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Destinations</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                      Price Range
                    </label>
                    <div className="space-y-2">
                      {priceRanges.map((range, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="priceRange"
                            checked={
                              localFilters.minPrice === range.min && 
                              localFilters.maxPrice === range.max
                            }
                            onChange={() => {
                              handleFilterChange('minPrice', range.min);
                              handleFilterChange('maxPrice', range.max);
                            }}
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Custom Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={localFilters.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={localFilters.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <StarIcon className="h-4 w-4 inline mr-1" />
                      Minimum Rating
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => handleFilterChange('rating', rating)}
                          className={`flex items-center px-3 py-2 rounded-lg border ${
                            localFilters.rating === rating
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <StarIcon className="h-4 w-4 mr-1" />
                          {rating}+
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trip-specific filters */}
                  {searchType === 'trips' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                        Difficulty Level
                      </label>
                      <select
                        value={localFilters.difficulty || ''}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Levels</option>
                        {difficultyLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Hotel-specific filters */}
                  {searchType === 'hotels' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <StarIcon className="h-4 w-4 inline mr-1" />
                        Star Rating
                      </label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map(stars => (
                          <button
                            key={stars}
                            onClick={() => handleFilterChange('starRating', stars)}
                            className={`flex items-center px-3 py-2 rounded-lg border ${
                              localFilters.starRating === stars
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {stars}★
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Sort By
                    </label>
                    <select
                      value={`${localFilters.sortBy}-${localFilters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        handleFilterChange('sortBy', sortBy);
                        handleFilterChange('sortOrder', sortOrder);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {sortOptions.map((option, index) => (
                        <option key={index} value={`${option.value}-${option.order}`}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t p-6 space-y-3">
                  <Button
                    onClick={applyFilters}
                    className="w-full"
                    size="large"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full"
                    size="large"
                  >
                    Clear All
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilters;
