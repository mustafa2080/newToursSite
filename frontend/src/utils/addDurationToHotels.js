import React from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Add duration field to all hotels
export const addDurationToHotels = async () => {
  try {
    console.log('🏨 Adding duration field to all hotels...');
    
    // Get all hotels
    const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
    const hotels = hotelsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${hotels.length} hotels to update`);

    // Update each hotel with duration based on star rating or type
    for (const hotel of hotels) {
      let duration;
      
      // Determine duration based on hotel characteristics
      if (hotel.category === 'luxury' || hotel.star_rating >= 5) {
        duration = '3-5'; // Luxury hotels - longer stays
      } else if (hotel.category === 'resort' || hotel.amenities?.includes('spa')) {
        duration = '4-7'; // Resort hotels - vacation stays
      } else if (hotel.category === 'business' || hotel.amenities?.includes('conference')) {
        duration = '1-3'; // Business hotels - shorter stays
      } else if (hotel.star_rating >= 4) {
        duration = '2-4'; // 4-star hotels
      } else if (hotel.star_rating >= 3) {
        duration = '2-3'; // 3-star hotels
      } else {
        duration = '1-2'; // Budget hotels
      }

      // Update the hotel document
      const hotelRef = doc(db, 'hotels', hotel.id);
      await updateDoc(hotelRef, {
        duration: duration,
        recommendedStay: duration,
        updatedAt: new Date()
      });

      console.log(`✅ Updated hotel ${hotel.name} with duration: ${duration} days`);
    }

    console.log('🎉 Successfully added duration to all hotels!');
    return {
      success: true,
      message: `Updated ${hotels.length} hotels with duration information`,
      updatedCount: hotels.length
    };

  } catch (error) {
    console.error('❌ Error adding duration to hotels:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Component to trigger the update
export const AddDurationButton = () => {
  const handleAddDuration = async () => {
    if (window.confirm('Are you sure you want to add duration to all hotels? This will update the database.')) {
      const result = await addDurationToHotels();
      if (result.success) {
        alert(`✅ Success! ${result.message}`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    }
  };

  return React.createElement(
    'button',
    {
      onClick: handleAddDuration,
      className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    },
    '🏨 Add Duration to Hotels'
  );
};
