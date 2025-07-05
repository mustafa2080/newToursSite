// Add sample images to trips and hotels
export const addSampleImagesToTrips = async () => {
  console.log('🎨 Adding sample images to trips...');
  
  try {
    const { getTrips, updateTrip } = await import('../services/firebase/trips');
    const result = await getTrips();
    
    if (!result.success) {
      console.error('❌ Failed to fetch trips');
      return;
    }
    
    const trips = result.trips || [];
    const tripsWithoutImages = trips.filter(trip => 
      !trip.mainImage && !trip.main_image && !trip.image && 
      (!trip.gallery || trip.gallery.length === 0) &&
      (!trip.images || trip.images.length === 0)
    );
    
    console.log('📂 Trips without images:', tripsWithoutImages.length);
    
    if (tripsWithoutImages.length === 0) {
      console.log('✅ All trips already have images!');
      alert('✅ All trips already have images!');
      return;
    }
    
    // High-quality travel images for different types of trips
    const sampleTripImages = {
      'egypt': {
        main: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      'turkey': {
        main: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      'dubai': {
        main: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      'beach': {
        main: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      'mountain': {
        main: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      'default': {
        main: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      }
    };
    
    let updatedCount = 0;
    
    for (const trip of tripsWithoutImages) {
      const tripName = (trip.title || trip.name || '').toLowerCase();
      let imageSet = sampleTripImages.default;
      
      // Try to find a matching image set
      for (const [key, images] of Object.entries(sampleTripImages)) {
        if (tripName.includes(key)) {
          imageSet = images;
          break;
        }
      }
      
      console.log(`🖼️ Adding images to trip "${trip.title || trip.name}"`);
      
      const updateData = {
        mainImage: imageSet.main,
        gallery: imageSet.gallery,
        // Keep legacy fields for compatibility
        main_image: imageSet.main,
        images: imageSet.gallery
      };
      
      const updateResult = await updateTrip(trip.id, updateData);
      if (updateResult.success) {
        updatedCount++;
        console.log(`✅ Updated: ${trip.title || trip.name}`);
      } else {
        console.error(`❌ Failed to update: ${trip.title || trip.name}`);
      }
    }
    
    console.log(`🎯 Added images to ${updatedCount} trips`);
    alert(`✅ Added images to ${updatedCount} trips! Refresh the page to see the results.`);
    
  } catch (error) {
    console.error('❌ Error adding sample images to trips:', error);
    alert('❌ Failed to add sample images to trips! Check console for details.');
  }
};

// Add sample images to hotels
export const addSampleImagesToHotels = async () => {
  console.log('🏨 Adding sample images to hotels...');
  
  try {
    const { getHotels, updateHotel } = await import('../services/firebase/hotels');
    const result = await getHotels();
    
    if (!result.success) {
      console.error('❌ Failed to fetch hotels');
      return;
    }
    
    const hotels = result.hotels || [];
    const hotelsWithoutImages = hotels.filter(hotel => 
      !hotel.mainImage && !hotel.main_image && !hotel.image && 
      (!hotel.gallery || hotel.gallery.length === 0) &&
      (!hotel.images || hotel.images.length === 0)
    );
    
    console.log('🏨 Hotels without images:', hotelsWithoutImages.length);
    
    if (hotelsWithoutImages.length === 0) {
      console.log('✅ All hotels already have images!');
      alert('✅ All hotels already have images!');
      return;
    }
    
    // High-quality hotel images for different types
    const sampleHotelImages = {
      'luxury': {
        main: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      'resort': {
        main: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      'beach': {
        main: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      'default': {
        main: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      }
    };
    
    let updatedCount = 0;
    
    for (const hotel of hotelsWithoutImages) {
      const hotelName = (hotel.name || '').toLowerCase();
      let imageSet = sampleHotelImages.default;
      
      // Try to find a matching image set
      for (const [key, images] of Object.entries(sampleHotelImages)) {
        if (hotelName.includes(key)) {
          imageSet = images;
          break;
        }
      }
      
      console.log(`🖼️ Adding images to hotel "${hotel.name}"`);
      
      const updateData = {
        mainImage: imageSet.main,
        gallery: imageSet.gallery,
        // Keep legacy fields for compatibility
        main_image: imageSet.main,
        images: imageSet.gallery
      };
      
      const updateResult = await updateHotel(hotel.id, updateData);
      if (updateResult.success) {
        updatedCount++;
        console.log(`✅ Updated: ${hotel.name}`);
      } else {
        console.error(`❌ Failed to update: ${hotel.name}`);
      }
    }
    
    console.log(`🎯 Added images to ${updatedCount} hotels`);
    alert(`✅ Added images to ${updatedCount} hotels! Refresh the page to see the results.`);
    
  } catch (error) {
    console.error('❌ Error adding sample images to hotels:', error);
    alert('❌ Failed to add sample images to hotels! Check console for details.');
  }
};

// Add images to both trips and hotels
export const addSampleImagesToAll = async () => {
  console.log('🎨 Adding sample images to all trips and hotels...');
  
  await addSampleImagesToTrips();
  await addSampleImagesToHotels();
  
  console.log('🎯 Completed adding sample images to all content!');
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.addSampleImagesToTrips = addSampleImagesToTrips;
  window.addSampleImagesToHotels = addSampleImagesToHotels;
  window.addSampleImagesToAll = addSampleImagesToAll;
  
  console.log('🎨 Sample images functions available:');
  console.log('   - addSampleImagesToTrips() - Add images to trips');
  console.log('   - addSampleImagesToHotels() - Add images to hotels');
  console.log('   - addSampleImagesToAll() - Add images to both trips and hotels');
}
