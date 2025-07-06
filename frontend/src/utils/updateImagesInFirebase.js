import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Update existing trips and hotels in Firebase with proper image galleries
 */

const tripImages = {
  'beach': [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ],
  'mountain': [
    'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ],
  'city': [
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ]
};

const hotelImages = {
  'luxury': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ],
  'boutique': [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ]
};

export const updateTripsWithImages = async () => {
  try {
    console.log('🔄 Starting to update trips with images...');
    
    const tripsSnapshot = await getDocs(collection(db, 'trips'));
    const trips = tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📋 Found ${trips.length} trips to update`);
    
    for (const trip of trips) {
      try {
        // Determine category for images
        const category = trip.category_name?.toLowerCase() || trip.category?.toLowerCase() || 'default';
        let imageSet = tripImages[category] || tripImages.default;
        
        // Ensure main_image is set
        const main_image = trip.main_image || trip.mainImage || imageSet[0];
        
        // Ensure images array is set
        const images = trip.images && trip.images.length > 0 ? trip.images : imageSet;
        
        // Update the trip
        await updateDoc(doc(db, 'trips', trip.id), {
          main_image: main_image,
          mainImage: main_image, // For compatibility
          images: images,
          updatedAt: new Date()
        });
        
        console.log(`✅ Updated trip: ${trip.title}`);
      } catch (error) {
        console.error(`❌ Error updating trip ${trip.title}:`, error);
      }
    }
    
    console.log('🎉 Finished updating trips with images!');
  } catch (error) {
    console.error('❌ Error updating trips:', error);
  }
};

export const updateHotelsWithImages = async () => {
  try {
    console.log('🔄 Starting to update hotels with images...');
    
    const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
    const hotels = hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`🏨 Found ${hotels.length} hotels to update`);
    
    for (const hotel of hotels) {
      try {
        // Determine category for images
        const category = hotel.category_name?.toLowerCase() || hotel.category?.toLowerCase() || 'default';
        let imageSet = hotelImages[category] || hotelImages.default;
        
        // Ensure main_image is set
        const main_image = hotel.main_image || hotel.mainImage || imageSet[0];
        
        // Ensure images array is set
        const images = hotel.images && hotel.images.length > 0 ? hotel.images : imageSet;
        
        // Update the hotel
        await updateDoc(doc(db, 'hotels', hotel.id), {
          main_image: main_image,
          mainImage: main_image, // For compatibility
          images: images,
          updatedAt: new Date()
        });
        
        console.log(`✅ Updated hotel: ${hotel.name}`);
      } catch (error) {
        console.error(`❌ Error updating hotel ${hotel.name}:`, error);
      }
    }
    
    console.log('🎉 Finished updating hotels with images!');
  } catch (error) {
    console.error('❌ Error updating hotels:', error);
  }
};

export const updateAllImagesInFirebase = async () => {
  console.log('🚀 Starting to update all images in Firebase...');
  
  await updateTripsWithImages();
  await updateHotelsWithImages();
  
  console.log('🎉 All images updated successfully!');
};

// Function to run from browser console
window.updateAllImagesInFirebase = updateAllImagesInFirebase;
window.updateTripsWithImages = updateTripsWithImages;
window.updateHotelsWithImages = updateHotelsWithImages;

export default {
  updateTripsWithImages,
  updateHotelsWithImages,
  updateAllImagesInFirebase
};
