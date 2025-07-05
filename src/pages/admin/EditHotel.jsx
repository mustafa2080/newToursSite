import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import HotelForm from '../../components/admin/HotelForm';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const EditHotel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHotel, setIsLoadingHotel] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadHotel();
  }, [id]);

  const loadHotel = async () => {
    try {
      setIsLoadingHotel(true);
      setError('');
      
      console.log('🔍 Loading hotel with ID:', id);
      
      // Get hotel from Firebase
      const hotelDocRef = doc(db, 'hotels', id);
      const hotelDoc = await getDoc(hotelDocRef);
      
      if (hotelDoc.exists()) {
        const hotelData = { id: hotelDoc.id, ...hotelDoc.data() };
        console.log('✅ Hotel loaded:', hotelData.name);
        setHotel(hotelData);
      } else {
        console.log('❌ Hotel not found');
        setError('Hotel not found');
      }
    } catch (error) {
      console.error('❌ Error loading hotel:', error);
      setError('Failed to load hotel data');
    } finally {
      setIsLoadingHotel(false);
    }
  };

  const handleSubmit = async (hotelData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔄 Updating hotel:', id, hotelData);
      
      // Prepare update data
      const updateData = {
        ...hotelData,
        updatedAt: new Date(),
      };

      // Update in Firebase
      const hotelDocRef = doc(db, 'hotels', id);
      await updateDoc(hotelDocRef, updateData);

      console.log('✅ Hotel updated successfully');
      setSuccess('Hotel updated successfully!');
      
      // Update local state
      setHotel(prev => ({ ...prev, ...updateData }));
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin/hotels');
      }, 2000);

    } catch (error) {
      console.error('❌ Error updating hotel:', error);
      setError(error.message || 'Failed to update hotel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/hotels');
  };

  if (isLoadingHotel) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading hotel data..." />
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate('/admin/hotels')}
            icon={<ArrowLeftIcon />}
          >
            Back to Hotels
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Hotel</h1>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate('/admin/hotels')}
            icon={<ArrowLeftIcon />}
          >
            Back to Hotels
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Hotel</h1>
            <p className="text-gray-600">Update hotel information</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-md p-4"
        >
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-md p-4"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hotel Form */}
      {hotel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HotelForm
            hotel={hotel}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </motion.div>
      )}
    </div>
  );
};

export default EditHotel;
