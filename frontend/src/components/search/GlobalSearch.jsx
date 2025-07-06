import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  FireIcon,
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import searchService from '../../services/searchService';
import SearchResultItem from './SearchResultItem';
import SearchFilters from './SearchFilters';

const GlobalSearch = ({ className = '', placeholder = "Search trips, hotels, reviews..." }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({ trip: [], hotel: [], review: [], page: [] });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filters, setFilters] = useState({
    types: ['trip', 'hotel', 'review', 'page'],
    category: '',
    location: '',
    priceRange: null
  });
  const [totalHits, setTotalHits] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults({ trip: [], hotel: [], review: [], page: [] });
      setTotalHits(0);
      if (debouncedQuery.trim().length > 0) {
        loadSuggestions(debouncedQuery);
      }
    }
  }, [debouncedQuery, filters]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        searchInputRef.current?.blur();
      }
      if (event.key === '/' && event.ctrlKey) {
        event.preventDefault();
        searchInputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const performSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    try {
      const searchResults = await searchService.search(searchQuery, {
        types: filters.types,
        limit: 20,
        filters: {
          category: filters.category,
          location: filters.location,
          priceRange: filters.priceRange
        }
      });

      setResults(searchResults.results);
      setTotalHits(searchResults.totalHits);
      setProcessingTime(searchResults.processingTime);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ trip: [], hotel: [], review: [], page: [] });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadSuggestions = useCallback(async (partialQuery) => {
    try {
      const suggestions = await searchService.getSearchSuggestions(partialQuery, 5);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSearchSubmit = (searchQuery = query) => {
    if (searchQuery.trim()) {
      // Save to recent searches
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      // Navigate to search results page for full results
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.term);
    handleSearchSubmit(suggestion.term);
  };

  const handleRecentSearchClick = (recentSearch) => {
    setQuery(recentSearch);
    handleSearchSubmit(recentSearch);
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ trip: [], hotel: [], review: [], page: [] });
    setTotalHits(0);
    searchInputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getResultsCount = () => {
    return Object.values(results).reduce((total, typeResults) => total + typeResults.length, 0);
  };

  const hasResults = getResultsCount() > 0;
  const showSuggestions = query.length > 0 && query.length < 2 && suggestions.length > 0;
  const showRecentSearches = query.length === 0 && recentSearches.length > 0;

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit();
            }
          }}
          placeholder={placeholder}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {/* Keyboard Shortcut Hint - only show when no query */}
        {!query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
              Ctrl + /
            </kbd>
          </div>
        )}
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Search Filters */}
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              className="border-b border-gray-100"
            />

            <div className="max-h-80 overflow-y-auto">
              {/* Loading State */}
              {loading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Searching...</p>
                </div>
              )}

              {/* Search Results */}
              {!loading && hasResults && (
                <div className="p-2">
                  {/* Results Header */}
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-500">
                    <span>{getResultsCount()} results found</span>
                    {processingTime > 0 && (
                      <span>in {processingTime}ms</span>
                    )}
                  </div>

                  {/* Results by Type */}
                  {Object.entries(results).map(([type, typeResults]) => (
                    typeResults.length > 0 && (
                      <div key={type} className="mb-4">
                        <h3 className="px-3 py-1 text-xs font-semibold text-gray-700 uppercase tracking-wide bg-gray-50">
                          {type === 'trip' ? 'Trips' : 
                           type === 'hotel' ? 'Hotels' : 
                           type === 'review' ? 'Reviews' : 'Pages'}
                          <span className="ml-1 text-gray-500">({typeResults.length})</span>
                        </h3>
                        
                        {typeResults.slice(0, 3).map((result) => (
                          <SearchResultItem
                            key={`${result.type}-${result.id}`}
                            result={result}
                            query={query}
                            onClick={() => {
                              console.log('🔗 Navigating to:', result.link, 'for result:', result);
                              if (result.link) {
                                navigate(result.link);
                                setIsOpen(false);
                              } else {
                                console.error('❌ No link found for result:', result);
                                // Fallback navigation based on type
                                let fallbackLink = '/';
                                if (result.type === 'hotel') {
                                  fallbackLink = `/book/hotel/${result.id}`;
                                } else if (result.type === 'trip') {
                                  fallbackLink = `/trips/${result.id}`;
                                }
                                console.log('🔄 Using fallback link:', fallbackLink);
                                navigate(fallbackLink);
                                setIsOpen(false);
                              }
                            }}
                          />
                        ))}
                        
                        {typeResults.length > 3 && (
                          <button
                            onClick={() => handleSearchSubmit()}
                            className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                          >
                            View all {typeResults.length} {type} results →
                          </button>
                        )}
                      </div>
                    )
                  ))}

                  {/* View All Results */}
                  <div className="border-t border-gray-100 p-3">
                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View all {totalHits} results
                    </button>
                  </div>
                </div>
              )}

              {/* No Results */}
              {!loading && !hasResults && query.length >= 2 && (
                <div className="p-6 text-center">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Suggestions:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Check your spelling</li>
                      <li>• Try more general terms</li>
                      <li>• Remove filters to see more results</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Search Suggestions */}
              {showSuggestions && (
                <div className="p-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    <FireIcon className="inline h-3 w-3 mr-1" />
                    Popular Searches
                  </h3>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-900">{suggestion.term}</span>
                      {suggestion.trending && (
                        <FireIcon className="h-3 w-3 text-orange-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {showRecentSearches && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      <ClockIcon className="inline h-3 w-3 mr-1" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((recentSearch, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(recentSearch)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-900"
                    >
                      {recentSearch}
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !hasResults && !showSuggestions && !showRecentSearches && query.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <MagnifyingGlassIcon className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">Start typing to search...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
