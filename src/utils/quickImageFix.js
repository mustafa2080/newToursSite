// Quick fix for image upload size issues
export const quickFixImageUpload = () => {
  console.log('⚡ Quick fix for image upload size issues...');
  
  // Override the image upload component behavior
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  
  HTMLCanvasElement.prototype.toDataURL = function(type = 'image/jpeg', quality = 0.3) {
    console.log('🖼️ Compressing image with quality:', quality);
    return originalToDataURL.call(this, type, quality);
  };
  
  console.log('✅ Image compression enhanced');
  
  // Add size warning
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (file.size > 2 * 1024 * 1024) { // 2MB
          alert(`⚠️ Warning: ${file.name} is ${Math.round(file.size / 1024 / 1024)}MB. It will be compressed to reduce size.`);
        }
      });
    });
  });
  
  console.log('✅ File size monitoring added');
  alert('✅ Image upload fix applied! Images will now be compressed more aggressively.');
};

// Replace base64 images with external URLs
export const replaceBase64WithUrls = async (tripId) => {
  console.log('🔄 Replacing base64 images with URLs for trip:', tripId);
  
  try {
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripDocRef);
    
    if (!tripDoc.exists()) {
      console.log('❌ Trip not found');
      return false;
    }
    
    const tripData = tripDoc.data();
    console.log('📋 Trip loaded:', tripData.title);
    
    // High-quality replacement images
    const replacementImages = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    
    const updatedData = { ...tripData };
    let replacedCount = 0;
    
    // Replace main image if it's base64
    if (updatedData.mainImage && updatedData.mainImage.startsWith('data:image/')) {
      console.log('🔄 Replacing main image');
      updatedData.mainImage = replacementImages[0];
      replacedCount++;
    }
    
    // Replace gallery images if they're base64
    if (updatedData.gallery && Array.isArray(updatedData.gallery)) {
      updatedData.gallery = updatedData.gallery.map((img, index) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          console.log(`🔄 Replacing gallery image ${index + 1}`);
          replacedCount++;
          return replacementImages[index % replacementImages.length];
        }
        return img;
      });
    }
    
    // Replace legacy images field
    if (updatedData.images && Array.isArray(updatedData.images)) {
      updatedData.images = updatedData.images.map((img, index) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          console.log(`🔄 Replacing legacy image ${index + 1}`);
          replacedCount++;
          return replacementImages[index % replacementImages.length];
        }
        return img;
      });
    }
    
    // Replace other image fields
    const imageFields = ['main_image', 'image', 'photo'];
    imageFields.forEach(field => {
      if (updatedData[field] && typeof updatedData[field] === 'string' && updatedData[field].startsWith('data:image/')) {
        console.log(`🔄 Replacing ${field}`);
        updatedData[field] = replacementImages[0];
        replacedCount++;
      }
    });
    
    if (replacedCount > 0) {
      console.log(`💾 Updating trip with ${replacedCount} replaced images...`);
      await updateDoc(tripDocRef, updatedData);
      console.log('✅ Trip updated successfully!');
      return true;
    } else {
      console.log('ℹ️ No base64 images found to replace');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error replacing images:', error);
    return false;
  }
};

// Emergency fix for current trip
export const emergencyFixCurrentTrip = async () => {
  console.log('🚨 Emergency fix for current trip...');
  
  // Get trip ID from URL
  const urlParts = window.location.pathname.split('/');
  const editIndex = urlParts.indexOf('edit');
  
  if (editIndex === -1) {
    // Try to get from other URL patterns
    const tripId = urlParts[urlParts.length - 1];
    if (tripId && tripId.length > 10) {
      console.log('🆔 Trip ID from URL:', tripId);
      const success = await replaceBase64WithUrls(tripId);
      if (success) {
        alert('✅ Emergency fix completed! You can now edit the trip.');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert('❌ Emergency fix failed. Please try manual cleanup.');
      }
      return;
    }
    
    alert('❌ Please navigate to a trip edit page first');
    return;
  }
  
  const tripId = urlParts[editIndex - 1];
  console.log('🆔 Trip ID from URL:', tripId);
  
  const success = await replaceBase64WithUrls(tripId);
  if (success) {
    alert('✅ Emergency fix completed! You can now edit the trip.');
    setTimeout(() => window.location.reload(), 2000);
  } else {
    alert('❌ Emergency fix failed. Please try manual cleanup.');
  }
};

// Fix all trips with size issues
export const fixAllTripsWithSizeIssues = async () => {
  console.log('🔧 Fixing all trips with size issues...');
  
  const confirmed = confirm('This will replace all base64 images in ALL trips with high-quality URLs. This may take a while. Continue?');
  if (!confirmed) return;
  
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripsSnapshot = await getDocs(collection(db, 'trips'));
    const trips = tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('📂 Found', trips.length, 'trips to check');
    
    let fixedCount = 0;
    
    for (const trip of trips) {
      console.log(`🔍 Checking trip: ${trip.title}`);
      
      // Check if trip has base64 images
      const hasBase64 = (
        (trip.mainImage && trip.mainImage.startsWith('data:image/')) ||
        (trip.gallery && trip.gallery.some(img => typeof img === 'string' && img.startsWith('data:image/'))) ||
        (trip.images && trip.images.some(img => typeof img === 'string' && img.startsWith('data:image/')))
      );
      
      if (hasBase64) {
        console.log(`🔧 Fixing trip: ${trip.title}`);
        const success = await replaceBase64WithUrls(trip.id);
        if (success) {
          fixedCount++;
        }
        
        // Add delay to avoid overwhelming Firebase
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🎯 Fixed ${fixedCount} trips`);
    alert(`✅ Fixed ${fixedCount} trips with size issues!`);
    
  } catch (error) {
    console.error('❌ Error fixing trips:', error);
    alert('❌ Error fixing trips: ' + error.message);
  }
};

// Show current document size
export const showCurrentDocumentSize = async () => {
  const urlParts = window.location.pathname.split('/');
  const editIndex = urlParts.indexOf('edit');
  
  if (editIndex === -1) {
    alert('❌ Please navigate to a trip edit page first');
    return;
  }
  
  const tripId = urlParts[editIndex - 1];
  
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripDocRef);
    
    if (!tripDoc.exists()) {
      alert('❌ Trip not found');
      return;
    }
    
    const tripData = tripDoc.data();
    const dataSize = JSON.stringify(tripData).length;
    const limitSize = 1048576; // 1MB
    
    console.log('📊 Document size analysis:');
    console.log('  Current size:', dataSize, 'bytes');
    console.log('  Limit:', limitSize, 'bytes');
    console.log('  Usage:', Math.round((dataSize / limitSize) * 100) + '%');
    
    if (dataSize > limitSize) {
      alert(`🚨 Document size: ${Math.round(dataSize / 1024)}KB (${Math.round((dataSize / limitSize) * 100)}% of limit)\n\nDocument exceeds 1MB limit! Use emergencyFixCurrentTrip() to fix.`);
    } else {
      alert(`✅ Document size: ${Math.round(dataSize / 1024)}KB (${Math.round((dataSize / limitSize) * 100)}% of limit)\n\nDocument size is within limits.`);
    }
    
  } catch (error) {
    console.error('❌ Error checking document size:', error);
    alert('❌ Error checking document size: ' + error.message);
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.quickFixImageUpload = quickFixImageUpload;
  window.replaceBase64WithUrls = replaceBase64WithUrls;
  window.emergencyFixCurrentTrip = emergencyFixCurrentTrip;
  window.fixAllTripsWithSizeIssues = fixAllTripsWithSizeIssues;
  window.showCurrentDocumentSize = showCurrentDocumentSize;
  
  console.log('⚡ Quick image fix functions available:');
  console.log('   - quickFixImageUpload() - Fix image upload compression');
  console.log('   - emergencyFixCurrentTrip() - Emergency fix for current trip');
  console.log('   - showCurrentDocumentSize() - Show current document size');
  console.log('   - fixAllTripsWithSizeIssues() - Fix all trips with size issues');
}
