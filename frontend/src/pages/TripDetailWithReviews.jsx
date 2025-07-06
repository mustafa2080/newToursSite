import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import ReviewSystemComplete, { QuickRatingDisplay } from '../components/reviews/ReviewSystemComplete';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TripDetailWithReviews = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      const response = await fetch(`/api/trips/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setTrip(data.data);
      } else {
        setError('Trip not found');
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      setError('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading trip details..." />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Trip not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            The trip you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600">
        {trip.image && (
          <img
            src={trip.image}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {trip.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-4 text-lg"
            >
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-5 w-5" />
                <span>{trip.location}</span>
              </div>
              <QuickRatingDisplay itemType="trip" itemId={trip.id} size="h-5 w-5" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trip Details */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Trip Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{trip.duration} days</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Group Size</p>
                    <p className="font-semibold">Max {trip.maxGroupSize} people</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold">${trip.price}</p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {trip.description}
                </p>
              </div>

              {trip.highlights && trip.highlights.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Highlights
                  </h3>
                  <ul className="space-y-2">
                    {trip.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Reviews Section */}
            <ReviewSystemComplete
              itemType="trip"
              itemId={trip.id}
              itemTitle={trip.title}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${trip.price}
                </div>
                <p className="text-gray-600">per person</p>
              </div>

              <div className="space-y-4 mb-6">
                <QuickRatingDisplay itemType="trip" itemId={trip.id} size="h-5 w-5" />
                
                <div className="text-sm text-gray-600">
                  <p>📍 {trip.location}</p>
                  <p>⏱️ {trip.duration} days</p>
                  <p>👥 Max {trip.maxGroupSize} people</p>
                </div>
              </div>

              <Button className="w-full mb-4">
                Book Now
              </Button>
              
              <Button variant="outline" className="w-full">
                Add to Wishlist
              </Button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What's Included
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Professional guide</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Transportation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Meals as specified</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>Personal expenses</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Contact Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Have questions about this trip? Our travel experts are here to help.
              </p>
              <Button variant="outline" className="w-full">
                Contact Us
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailWithReviews;
