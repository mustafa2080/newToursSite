import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const SearchResultItem = ({ result, query, onClick, className = '' }) => {
  // Highlight matching text in search results
  const highlightText = (text, searchQuery) => {
    if (!text || !searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery.split(' ').join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'trip':
        return <MapPinIcon className="h-4 w-4 text-blue-600" />;
      case 'hotel':
        return <CalendarDaysIcon className="h-4 w-4 text-purple-600" />;
      case 'review':
        return <UserIcon className="h-4 w-4 text-green-600" />;
      case 'page':
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'trip':
        return 'bg-blue-100 text-blue-800';
      case 'hotel':
        return 'bg-purple-100 text-purple-800';
      case 'review':
        return 'bg-green-100 text-green-800';
      case 'page':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i}>
            {i < Math.floor(rating) ? (
              <StarIconSolid className="h-3 w-3 text-yellow-400" />
            ) : (
              <StarIcon className="h-3 w-3 text-gray-300" />
            )}
          </span>
        ))}
        <span className="text-xs text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <motion.button
      onClick={onClick}
      className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${className}`}
      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start space-x-3">
        {/* Image */}
        {result.image && (
          <div className="flex-shrink-0">
            <img
              src={result.image}
              alt={result.title}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2">
              {getTypeIcon(result.type)}
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(result.type)}`}>
                {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
              </span>
            </div>
            
            {/* Rating */}
            {result.rating && renderStars(result.rating)}
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
            {highlightText(result.title, query)}
          </h4>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {highlightText(truncateText(result.description || result.excerpt), query)}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {/* Location */}
              {result.location && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-3 w-3" />
                  <span>{result.location}</span>
                </div>
              )}

              {/* Review Count */}
              {result.reviewCount && (
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-3 w-3" />
                  <span>{result.reviewCount} reviews</span>
                </div>
              )}

              {/* Category */}
              {result.category && (
                <span className="capitalize">{result.category}</span>
              )}
            </div>

            {/* Price */}
            {result.price && (
              <div className="flex items-center space-x-1 text-sm font-semibold text-gray-900">
                <CurrencyDollarIcon className="h-3 w-3" />
                <span>{formatPrice(result.price)}</span>
                {result.type === 'hotel' && (
                  <span className="text-xs text-gray-500">/night</span>
                )}
              </div>
            )}
          </div>

          {/* Highlights (from Algolia) */}
          {result.highlights && (
            <div className="mt-2 text-xs text-gray-600">
              {result.highlights.title && (
                <div className="mb-1">
                  <span className="font-medium">Title: </span>
                  <span dangerouslySetInnerHTML={{ __html: result.highlights.title.value }} />
                </div>
              )}
              {result.highlights.description && (
                <div>
                  <span className="font-medium">Description: </span>
                  <span dangerouslySetInnerHTML={{ __html: result.highlights.description.value }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default SearchResultItem;
