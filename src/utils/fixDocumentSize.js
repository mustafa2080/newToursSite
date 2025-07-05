// Fix document size issues in Firestore
export const analyzeDocumentSize = async (tripId) => {
  console.log('📊 Analyzing document size for trip:', tripId);
  
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripDocRef);
    
    if (!tripDoc.exists()) {
      console.log('❌ Trip not found');
      return;
    }
    
    const tripData = tripDoc.data();
    console.log('📋 Trip data loaded:', tripData.title);
    
    // Calculate field sizes
    const fieldSizes = {};
    let totalSize = 0;
    
    for (const [key, value] of Object.entries(tripData)) {
      const fieldSize = JSON.stringify(value).length;
      fieldSizes[key] = fieldSize;
      totalSize += fieldSize;
      
      console.log(`📏 ${key}: ${fieldSize} bytes`);
      
      // Check for large base64 images
      if (typeof value === 'string' && value.startsWith('data:image/')) {
        console.log(`🖼️ Found base64 image in ${key}: ${fieldSize} bytes`);
      }
      
      // Check for arrays with base64 images
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && item.startsWith('data:image/')) {
            const itemSize = JSON.stringify(item).length;
            console.log(`🖼️ Found base64 image in ${key}[${index}]: ${itemSize} bytes`);
          }
        });
      }
    }
    
    console.log('📊 Total document size:', totalSize, 'bytes');
    console.log('📊 Size limit:', 1048576, 'bytes');
    console.log('📊 Size ratio:', Math.round((totalSize / 1048576) * 100) + '%');
    
    if (totalSize > 1048576) {
      console.log('🚨 Document exceeds Firestore size limit!');
      
      // Find largest fields
      const sortedFields = Object.entries(fieldSizes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      console.log('📈 Largest fields:');
      sortedFields.forEach(([field, size]) => {
        console.log(`  ${field}: ${size} bytes (${Math.round((size / totalSize) * 100)}%)`);
      });
    } else {
      console.log('✅ Document size is within limits');
    }
    
    return {
      totalSize,
      fieldSizes,
      exceedsLimit: totalSize > 1048576,
      largestFields: Object.entries(fieldSizes).sort(([,a], [,b]) => b - a)
    };
    
  } catch (error) {
    console.error('❌ Error analyzing document size:', error);
    return null;
  }
};

// Clean up base64 images and replace with URLs
export const cleanupTripImages = async (tripId) => {
  console.log('🧹 Cleaning up trip images for:', tripId);
  
  try {
    const analysis = await analyzeDocumentSize(tripId);
    if (!analysis || !analysis.exceedsLimit) {
      console.log('✅ Document size is fine, no cleanup needed');
      return;
    }
    
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripDocRef);
    const tripData = tripDoc.data();
    
    console.log('🔄 Starting cleanup process...');
    
    // High-quality replacement images for different trip types
    const replacementImages = {
      'beach': [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      'adventure': [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      'city': [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      'default': [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]
    };
    
    // Determine trip type
    const tripTitle = (tripData.title || '').toLowerCase();
    let imageSet = replacementImages.default;
    
    for (const [type, images] of Object.entries(replacementImages)) {
      if (tripTitle.includes(type)) {
        imageSet = images;
        break;
      }
    }
    
    console.log('🎨 Using image set for type:', tripTitle.includes('beach') ? 'beach' : 'default');
    
    // Clean up the data
    const cleanedData = { ...tripData };
    let cleanupCount = 0;
    
    // Replace base64 images with URLs
    const fieldsToCheck = ['mainImage', 'main_image', 'image', 'gallery', 'images'];
    
    fieldsToCheck.forEach(field => {
      if (cleanedData[field]) {
        if (typeof cleanedData[field] === 'string' && cleanedData[field].startsWith('data:image/')) {
          console.log(`🔄 Replacing base64 image in ${field}`);
          cleanedData[field] = imageSet[0];
          cleanupCount++;
        } else if (Array.isArray(cleanedData[field])) {
          cleanedData[field] = cleanedData[field].map((item, index) => {
            if (typeof item === 'string' && item.startsWith('data:image/')) {
              console.log(`🔄 Replacing base64 image in ${field}[${index}]`);
              cleanupCount++;
              return imageSet[index % imageSet.length];
            }
            return item;
          });
        }
      }
    });
    
    // Remove any other large fields that might be problematic
    const fieldsToRemove = ['largeData', 'tempData', 'debugInfo', 'testField', 'lastTestUpdate'];
    fieldsToRemove.forEach(field => {
      if (cleanedData[field]) {
        console.log(`🗑️ Removing field: ${field}`);
        delete cleanedData[field];
        cleanupCount++;
      }
    });
    
    console.log(`🧹 Cleaned up ${cleanupCount} items`);
    
    // Update the document
    console.log('💾 Updating document with cleaned data...');
    await updateDoc(tripDocRef, cleanedData);
    
    console.log('✅ Document cleanup completed successfully!');
    
    // Verify new size
    setTimeout(async () => {
      const newAnalysis = await analyzeDocumentSize(tripId);
      if (newAnalysis && !newAnalysis.exceedsLimit) {
        console.log('🎉 Document size is now within limits!');
        alert('✅ Document cleanup successful! You can now edit the trip.');
      } else {
        console.log('⚠️ Document might still be too large');
        alert('⚠️ Document cleanup completed but might still be large. Try again if needed.');
      }
    }, 2000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error cleaning up document:', error);
    alert('❌ Error during cleanup: ' + error.message);
    return false;
  }
};

// Quick fix for the current trip
export const quickFixCurrentTrip = async () => {
  console.log('⚡ Quick fix for current trip...');
  
  // Get trip ID from URL
  const urlParts = window.location.pathname.split('/');
  const editIndex = urlParts.indexOf('edit');
  
  if (editIndex === -1) {
    alert('❌ Please navigate to a trip edit page first');
    return;
  }
  
  const tripId = urlParts[editIndex - 1];
  console.log('🆔 Trip ID from URL:', tripId);
  
  // Analyze and clean
  await analyzeDocumentSize(tripId);
  await cleanupTripImages(tripId);
};

// Emergency cleanup - remove all base64 images from all trips
export const emergencyCleanupAllTrips = async () => {
  console.log('🚨 Emergency cleanup for all trips...');
  
  const confirmed = confirm('This will replace all base64 images in ALL trips with high-quality URLs. Continue?');
  if (!confirmed) return;
  
  try {
    const { collection, getDocs, updateDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripsSnapshot = await getDocs(collection(db, 'trips'));
    const trips = tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('📂 Found', trips.length, 'trips to clean');
    
    let cleanedCount = 0;
    
    for (const trip of trips) {
      console.log(`🧹 Cleaning trip: ${trip.title}`);
      
      const analysis = await analyzeDocumentSize(trip.id);
      if (analysis && analysis.exceedsLimit) {
        await cleanupTripImages(trip.id);
        cleanedCount++;
      }
    }
    
    console.log(`🎯 Cleaned ${cleanedCount} trips`);
    alert(`✅ Emergency cleanup completed! Cleaned ${cleanedCount} trips.`);
    
  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error);
    alert('❌ Emergency cleanup failed: ' + error.message);
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.analyzeDocumentSize = analyzeDocumentSize;
  window.cleanupTripImages = cleanupTripImages;
  window.quickFixCurrentTrip = quickFixCurrentTrip;
  window.emergencyCleanupAllTrips = emergencyCleanupAllTrips;
  
  console.log('🧹 Document size fix functions available:');
  console.log('   - analyzeDocumentSize(tripId) - Analyze document size');
  console.log('   - cleanupTripImages(tripId) - Clean up base64 images');
  console.log('   - quickFixCurrentTrip() - Quick fix for current trip');
  console.log('   - emergencyCleanupAllTrips() - Clean all trips');
}
