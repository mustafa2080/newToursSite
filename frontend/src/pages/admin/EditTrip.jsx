import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import TripForm from '../../components/admin/TripForm';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { tripsAPI } from '../../utils/firebaseApi';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const EditTrip = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');



  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      setIsLoadingTrip(true);
      setError('');

      console.log('🔍 Loading trip with ID:', id);

      // Get trip from Firebase
      const tripDocRef = doc(db, 'trips', id);
      const tripDoc = await getDoc(tripDocRef);

      if (tripDoc.exists()) {
        const tripData = { id: tripDoc.id, ...tripDoc.data() };
        console.log('✅ Trip loaded:', tripData.title);
        setTrip(tripData);
      } else {
        console.log('❌ Trip not found');
        setError('Trip not found');
      }
    } catch (error) {
      console.error('❌ Error loading trip:', error);
      setError('Failed to load trip data');
    } finally {
      setIsLoadingTrip(false);
    }
  };

  const handleSubmit = async (tripData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔄 Starting trip update process...');
      console.log('🆔 Trip ID:', id);
      console.log('📊 Trip data received:', tripData);

      // Validate required fields
      if (!tripData.title || !tripData.description || !tripData.price) {
        throw new Error('Missing required fields: title, description, or price');
      }

      // Prepare update data with proper field mapping
      const updateData = {
        ...tripData,
        updatedAt: new Date(),
        // Ensure numeric fields are properly converted
        price: typeof tripData.price === 'string' ? parseFloat(tripData.price) : tripData.price,
        duration_days: typeof tripData.duration_days === 'string' ? parseInt(tripData.duration_days) : tripData.duration_days,
        max_participants: typeof tripData.max_participants === 'string' ? parseInt(tripData.max_participants) : tripData.max_participants,
      };

      console.log('📝 Prepared update data:', updateData);

      // Update in Firebase using direct updateDoc
      const tripDocRef = doc(db, 'trips', id);
      console.log('🔥 Updating Firebase document...');

      await updateDoc(tripDocRef, updateData);

      console.log('✅ Firebase update completed successfully');
      setSuccess('Trip updated successfully!');

      // Show success message in console as well
      console.log('🎉 SUCCESS: Trip updated successfully!');

      // Update local state
      setTrip(prev => ({ ...prev, ...updateData }));

      // Redirect after success (increased time to see message)
      setTimeout(() => {
        console.log('🔄 Redirecting to trips management...');
        navigate('/admin/trips');
      }, 3000);

    } catch (error) {
      console.error('❌ Error updating trip:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });

      let errorMessage = 'Failed to update trip. Please try again.';

      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your admin privileges.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Trip not found. It may have been deleted.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/trips');
  };

  if (isLoadingTrip) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading trip data..." />
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate('/admin/trips')}
            icon={<ArrowLeftIcon />}
          >
            Back to Trips
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Trip</h1>
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
            onClick={() => navigate('/admin/trips')}
            icon={<ArrowLeftIcon />}
          >
            Back to Trips
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Trip</h1>
            <p className="text-gray-600">Update trip information</p>
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

      {/* Trip Form */}
      {trip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TripForm
            trip={trip}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </motion.div>
      )}
    </div>
  );
};

export default EditTrip;
