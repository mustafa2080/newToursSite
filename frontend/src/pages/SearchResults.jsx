import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import GlobalSearch from '../components/search/GlobalSearch';
import SearchResultItem from '../components/search/SearchResultItem';
import SearchFilters from '../components/search/SearchFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import searchService from '../services/searchService';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ trip: [], hotel: [], review: [], page: [] });
  const [loading, setLoading] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    types: ['trip', 'hotel', 'review', 'page'],
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    priceRange: null
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'

  const resultsPerPage = 20;

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [filters, sortBy, currentPage]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchService.search(searchQuery, {
        types: filters.types,
        limit: resultsPerPage,
        offset: (currentPage - 1) * resultsPerPage,
        filters: {
          category: filters.category,
          location: filters.location,
          priceRange: filters.priceRange
        },
        sortBy
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
  };

  const handleNewSearch = (newQuery) => {
    setQuery(newQuery);
    setCurrentPage(1);
    setSearchParams({ q: newQuery });
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const getAllResults = () => {
    return Object.values(results).flat();
  };

  const getResultsCount = () => {
    return getAllResults().length;
  };

  const getTotalPages = () => {
    return Math.ceil(totalHits / resultsPerPage);
  };

  const renderGroupedResults = () => {
    return Object.entries(results).map(([type, typeResults]) => (
      typeResults.length > 0 && (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="capitalize">{type}s</span>
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({typeResults.length} result{typeResults.length !== 1 ? 's' : ''})
            </span>
          </h2>
          
          <div className="space-y-2">
            {typeResults.map((result) => (
              <Card key={`${result.type}-${result.id}`} className="overflow-hidden">
                <SearchResultItem
                  result={result}
                  query={query}
                  onClick={() => navigate(result.link)}
                />
              </Card>
            ))}
          </div>
        </motion.div>
      )
    ));
  };

  const renderListResults = () => {
    const allResults = getAllResults();
    
    return (
      <div className="space-y-2">
        {allResults.map((result, index) => (
          <motion.div
            key={`${result.type}-${result.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden">
              <SearchResultItem
                result={result}
                query={query}
                onClick={() => navigate(result.link)}
              />
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    const totalPages = getTotalPages();
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="small"
        >
          Previous
        </Button>
        
        {pages.map(page => (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            variant={page === currentPage ? 'primary' : 'outline'}
            size="small"
            className="min-w-[40px]"
          >
            {page}
          </Button>
        ))}
        
        <Button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="small"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="small"
            >
              Back to Home
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <GlobalSearch
              placeholder="Search trips, hotels, reviews..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="p-0 overflow-hidden">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {query && (
                    <>
                      Results for "<span className="text-blue-600">{query}</span>"
                    </>
                  )}
                </h2>
                
                {!loading && (
                  <div className="text-sm text-gray-600">
                    {getResultsCount()} of {totalHits} results
                    {processingTime > 0 && (
                      <span className="ml-2">in {processingTime}ms</span>
                    )}
                  </div>
                )}
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grouped')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'grouped'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" text="Searching..." />
              </div>
            )}

            {/* Results */}
            {!loading && getResultsCount() > 0 && (
              <>
                {viewMode === 'grouped' ? renderGroupedResults() : renderListResults()}
                {renderPagination()}
              </>
            )}

            {/* No Results */}
            {!loading && getResultsCount() === 0 && query && (
              <Card className="p-12 text-center">
                <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  No results found for "{query}"
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any trips, hotels, reviews, or pages matching your search.
                  Try adjusting your search terms or filters.
                </p>
                
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-2">Suggestions:</p>
                    <ul className="space-y-1">
                      <li>• Check your spelling</li>
                      <li>• Try more general terms</li>
                      <li>• Remove some filters</li>
                      <li>• Search for specific destinations or activities</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => handleFiltersChange({
                        types: ['trip', 'hotel', 'review', 'page'],
                        category: '',
                        location: '',
                        priceRange: null
                      })}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={() => navigate('/')}>
                      Browse All Content
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !query && (
              <Card className="p-12 text-center">
                <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Start your search
                </h3>
                <p className="text-gray-600 mb-6">
                  Use the search bar above to find trips, hotels, reviews, and more.
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button
                    onClick={() => handleNewSearch('safari')}
                    variant="outline"
                    size="small"
                  >
                    <FireIcon className="h-4 w-4 mr-2" />
                    Safari
                  </Button>
                  <Button
                    onClick={() => handleNewSearch('beach')}
                    variant="outline"
                    size="small"
                  >
                    <FireIcon className="h-4 w-4 mr-2" />
                    Beach
                  </Button>
                  <Button
                    onClick={() => handleNewSearch('luxury')}
                    variant="outline"
                    size="small"
                  >
                    <FireIcon className="h-4 w-4 mr-2" />
                    Luxury
                  </Button>
                  <Button
                    onClick={() => handleNewSearch('adventure')}
                    variant="outline"
                    size="small"
                  >
                    <FireIcon className="h-4 w-4 mr-2" />
                    Adventure
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
