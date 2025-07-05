import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EyeIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate } from '../../utils/postgresApi';

const TravelStories = ({ className = '' }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'following', 'popular', 'recent'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStories();
  }, [filter]);

  const loadStories = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // For demo, we'll use sample data
      const sampleStories = [
        {
          id: 1,
          title: "My Magical Journey Through Cappadocia",
          excerpt: "Hot air balloons, fairy chimneys, and underground cities - Cappadocia exceeded all my expectations...",
          content: "Full story content here...",
          coverImage: "/images/stories/cappadocia-story.jpg",
          author: {
            id: 1,
            name: "Emma Johnson",
            avatar: "/images/users/emma.jpg",
            verified: true
          },
          location: "Cappadocia, Turkey",
          publishedAt: new Date('2024-01-15'),
          readTime: 8,
          views: 1247,
          likes: 89,
          comments: 23,
          bookmarks: 45,
          tags: ["Turkey", "Adventure", "Photography", "Culture"],
          isLiked: false,
          isBookmarked: false,
          trip: {
            id: 1,
            title: "Magical Cappadocia Adventure",
            slug: "magical-cappadocia-adventure"
          }
        },
        {
          id: 2,
          title: "Sunset Paradise: 5 Days in Santorini",
          excerpt: "From the iconic blue domes to the most incredible sunsets, here's everything you need to know about Santorini...",
          content: "Full story content here...",
          coverImage: "/images/stories/santorini-story.jpg",
          author: {
            id: 2,
            name: "Michael Chen",
            avatar: "/images/users/michael.jpg",
            verified: false
          },
          location: "Santorini, Greece",
          publishedAt: new Date('2024-01-10'),
          readTime: 6,
          views: 892,
          likes: 67,
          comments: 18,
          bookmarks: 32,
          tags: ["Greece", "Islands", "Romance", "Photography"],
          isLiked: true,
          isBookmarked: false,
          hotel: {
            id: 1,
            name: "Santorini Sunset Resort",
            slug: "santorini-sunset-resort"
          }
        },
        {
          id: 3,
          title: "Rome in 3 Days: A First-Timer's Guide",
          excerpt: "Ancient history, incredible food, and unforgettable experiences - here's how to make the most of Rome...",
          content: "Full story content here...",
          coverImage: "/images/stories/rome-story.jpg",
          author: {
            id: 3,
            name: "Sarah Williams",
            avatar: "/images/users/sarah.jpg",
            verified: true
          },
          location: "Rome, Italy",
          publishedAt: new Date('2024-01-05'),
          readTime: 10,
          views: 1456,
          likes: 112,
          comments: 34,
          bookmarks: 78,
          tags: ["Italy", "History", "Food", "Culture"],
          isLiked: false,
          isBookmarked: true
        }
      ];
      
      setStories(sampleStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (storyId) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { 
            ...story, 
            isLiked: !story.isLiked,
            likes: story.isLiked ? story.likes - 1 : story.likes + 1
          }
        : story
    ));
  };

  const handleBookmark = async (storyId) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { 
            ...story, 
            isBookmarked: !story.isBookmarked,
            bookmarks: story.isBookmarked ? story.bookmarks - 1 : story.bookmarks + 1
          }
        : story
    ));
  };

  const handleShare = async (story) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.excerpt,
          url: `${window.location.origin}/stories/${story.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/stories/${story.id}`);
      // Show toast notification
    }
  };

  const filteredStories = stories.filter(story => {
    if (searchQuery) {
      return story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             story.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
             story.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const renderStoryCard = (story) => (
    <motion.div
      key={story.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
      onClick={() => setSelectedStory(story)}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark(story.id);
              }}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            >
              {story.isBookmarked ? (
                <BookmarkSolidIcon className="h-4 w-4 text-primary-600" />
              ) : (
                <BookmarkIcon className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
          
          {/* Read Time Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {story.readTime} min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Author & Date */}
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={story.author.avatar}
              alt={story.author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-900">
                  {story.author.name}
                </span>
                {story.author.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center text-xs text-gray-500 space-x-2">
                <span>{formatDate(story.publishedAt)}</span>
                <span>•</span>
                <div className="flex items-center">
                  <MapPinIcon className="h-3 w-3 mr-1" />
                  {story.location}
                </div>
              </div>
            </div>
          </div>

          {/* Title & Excerpt */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
            {story.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {story.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {story.tags.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{story.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {story.views}
              </div>
              <div className="flex items-center">
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                {story.comments}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(story.id);
                }}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                {story.isLiked ? (
                  <HeartSolidIcon className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4" />
                )}
                <span>{story.likes}</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(story);
                }}
                className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
              >
                <ShareIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Related Trip/Hotel */}
          {(story.trip || story.hotel) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">
                {story.trip ? 'Related Trip' : 'Related Hotel'}
              </div>
              <a
                href={`/${story.trip ? 'trips' : 'hotels'}/${(story.trip || story.hotel).slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {(story.trip || story.hotel).title || (story.trip || story.hotel).name}
              </a>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Travel Stories</h2>
          <p className="text-gray-600">Real experiences from fellow travelers</p>
        </div>
        
        {user && (
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<PlusIcon />}
          >
            Share Your Story
          </Button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          {['all', 'popular', 'recent', 'following'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === filterType
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search stories, locations, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(renderStoryCard)}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredStories.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Be the first to share your travel story!'}
          </p>
          {user && (
            <Button
              onClick={() => setShowCreateModal(true)}
              icon={<PlusIcon />}
            >
              Share Your Story
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelStories;

// Value Proposition:
// 1. **User Engagement**: Authentic stories increase time on site and return visits
// 2. **Social Proof**: Real experiences build trust and influence booking decisions
// 3. **Content Marketing**: User-generated content reduces marketing costs
// 4. **Community Building**: Creates loyal user base and brand advocates
// 5. **SEO Benefits**: Fresh, unique content improves search rankings
// 6. **Conversion Boost**: Stories linked to trips/hotels drive direct bookings
