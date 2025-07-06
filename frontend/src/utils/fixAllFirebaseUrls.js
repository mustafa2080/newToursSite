import { convertFirebaseStorageUrl } from './firebaseStorageHelper';

// Fix all Firebase Storage URLs in the entire database
export const fixAllFirebaseStorageUrls = async () => {
  try {
    console.log('🔧 Starting comprehensive Firebase Storage URL fix...');
    
    let totalFixed = 0;
    const results = {
      categories: 0,
      trips: 0,
      hotels: 0,
      errors: []
    };

    // Fix Categories
    try {
      console.log('1️⃣ Fixing categories...');
      const { getCategories, updateCategory } = await import('../services/firebase/categories');
      const categoriesResult = await getCategories();
      
      if (categoriesResult.success) {
        const categories = categoriesResult.categories || [];
        
        for (const category of categories) {
          if (category.image && category.image.includes('firebasestorage.googleapis.com')) {
            const originalUrl = category.image;
            const fixedUrl = convertFirebaseStorageUrl(originalUrl);
            
            if (fixedUrl !== originalUrl) {
              console.log(`🔧 Fixing category "${category.name}"`);
              const updateResult = await updateCategory(category.id, { image: fixedUrl });
              
              if (updateResult.success) {
                results.categories++;
                totalFixed++;
                console.log(`✅ Fixed category: ${category.name}`);
              } else {
                results.errors.push(`Failed to update category ${category.name}: ${updateResult.error}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fixing categories:', error);
      results.errors.push(`Categories error: ${error.message}`);
    }

    // Fix Trips
    try {
      console.log('2️⃣ Fixing trips...');
      const { getTrips, updateTrip } = await import('../services/firebase/trips');
      const tripsResult = await getTrips();
      
      if (tripsResult.success) {
        const trips = tripsResult.trips || [];
        
        for (const trip of trips) {
          let needsUpdate = false;
          const updateData = {};
          
          // Fix main image
          if (trip.mainImage && trip.mainImage.includes('firebasestorage.googleapis.com')) {
            const fixedUrl = convertFirebaseStorageUrl(trip.mainImage);
            if (fixedUrl !== trip.mainImage) {
              updateData.mainImage = fixedUrl;
              needsUpdate = true;
            }
          }
          
          // Fix gallery images
          if (trip.gallery && Array.isArray(trip.gallery)) {
            const fixedGallery = trip.gallery.map(img => {
              if (img && img.includes('firebasestorage.googleapis.com')) {
                return convertFirebaseStorageUrl(img);
              }
              return img;
            });
            
            if (JSON.stringify(fixedGallery) !== JSON.stringify(trip.gallery)) {
              updateData.gallery = fixedGallery;
              needsUpdate = true;
            }
          }
          
          if (needsUpdate) {
            console.log(`🔧 Fixing trip "${trip.title}"`);
            const updateResult = await updateTrip(trip.id, updateData);
            
            if (updateResult.success) {
              results.trips++;
              totalFixed++;
              console.log(`✅ Fixed trip: ${trip.title}`);
            } else {
              results.errors.push(`Failed to update trip ${trip.title}: ${updateResult.error}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fixing trips:', error);
      results.errors.push(`Trips error: ${error.message}`);
    }

    // Fix Hotels
    try {
      console.log('3️⃣ Fixing hotels...');
      const { getHotels, updateHotel } = await import('../services/firebase/hotels');
      const hotelsResult = await getHotels();
      
      if (hotelsResult.success) {
        const hotels = hotelsResult.hotels || [];
        
        for (const hotel of hotels) {
          let needsUpdate = false;
          const updateData = {};
          
          // Fix main image
          if (hotel.mainImage && hotel.mainImage.includes('firebasestorage.googleapis.com')) {
            const fixedUrl = convertFirebaseStorageUrl(hotel.mainImage);
            if (fixedUrl !== hotel.mainImage) {
              updateData.mainImage = fixedUrl;
              needsUpdate = true;
            }
          }
          
          // Fix gallery images
          if (hotel.gallery && Array.isArray(hotel.gallery)) {
            const fixedGallery = hotel.gallery.map(img => {
              if (img && img.includes('firebasestorage.googleapis.com')) {
                return convertFirebaseStorageUrl(img);
              }
              return img;
            });
            
            if (JSON.stringify(fixedGallery) !== JSON.stringify(hotel.gallery)) {
              updateData.gallery = fixedGallery;
              needsUpdate = true;
            }
          }
          
          if (needsUpdate) {
            console.log(`🔧 Fixing hotel "${hotel.name}"`);
            const updateResult = await updateHotel(hotel.id, updateData);
            
            if (updateResult.success) {
              results.hotels++;
              totalFixed++;
              console.log(`✅ Fixed hotel: ${hotel.name}`);
            } else {
              results.errors.push(`Failed to update hotel ${hotel.name}: ${updateResult.error}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fixing hotels:', error);
      results.errors.push(`Hotels error: ${error.message}`);
    }

    // Summary
    console.log('\n🎯 Firebase Storage URL Fix Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Categories fixed: ${results.categories}`);
    console.log(`✅ Trips fixed: ${results.trips}`);
    console.log(`✅ Hotels fixed: ${results.hotels}`);
    console.log(`🎯 Total items fixed: ${totalFixed}`);
    
    if (results.errors.length > 0) {
      console.log(`❌ Errors encountered: ${results.errors.length}`);
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    return {
      success: true,
      totalFixed,
      results,
      message: `Fixed ${totalFixed} Firebase Storage URLs`
    };
    
  } catch (error) {
    console.error('❌ Critical error in fixAllFirebaseStorageUrls:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fix Firebase Storage URLs'
    };
  }
};

// Quick fix for categories only
export const quickFixCategoriesUrls = async () => {
  try {
    console.log('⚡ Quick fix for categories URLs...');
    
    const { getCategories, updateCategory } = await import('../services/firebase/categories');
    const result = await getCategories();
    
    if (!result.success) {
      console.error('❌ Failed to fetch categories');
      return { success: false, message: 'Failed to fetch categories' };
    }
    
    const categories = result.categories || [];
    let fixedCount = 0;
    
    for (const category of categories) {
      if (category.image && category.image.includes('/o?name=')) {
        const originalUrl = category.image;
        const fixedUrl = convertFirebaseStorageUrl(originalUrl);
        
        if (fixedUrl !== originalUrl) {
          console.log(`⚡ Quick fixing: ${category.name}`);
          const updateResult = await updateCategory(category.id, { image: fixedUrl });
          
          if (updateResult.success) {
            fixedCount++;
            console.log(`✅ Fixed: ${category.name}`);
          }
        }
      }
    }
    
    console.log(`⚡ Quick fix complete! Fixed ${fixedCount} categories`);
    return { success: true, fixedCount, message: `Fixed ${fixedCount} categories` };
    
  } catch (error) {
    console.error('❌ Error in quick fix:', error);
    return { success: false, error: error.message };
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.fixAllFirebaseStorageUrls = fixAllFirebaseStorageUrls;
  window.quickFixCategoriesUrls = quickFixCategoriesUrls;
  
  console.log('🔧 Firebase URL fix functions available:');
  console.log('   - fixAllFirebaseStorageUrls() - Fix all URLs in database');
  console.log('   - quickFixCategoriesUrls() - Quick fix for categories only');
}
