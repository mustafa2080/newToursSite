// Fix black images in Popular Destinations
export const fixBlackImagesInPopularDestinations = async () => {
  console.log('🔧 Fixing black images in Popular Destinations...');
  
  try {
    // Get categories data
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    const { getCategoryFallbackImage } = await import('./firebaseStorageHelper');
    
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories = categoriesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    const activeCategories = categories.filter(cat => cat.status === 'active' || !cat.status);
    console.log('📂 Active categories found:', activeCategories.length);
    
    // Find and fix images in the DOM
    const categoryCards = document.querySelectorAll('a[href*="/categories/"]');
    console.log('🔍 Category cards found in DOM:', categoryCards.length);
    
    let fixedCount = 0;
    
    categoryCards.forEach((card, index) => {
      const img = card.querySelector('img');
      const nameElement = card.querySelector('h3');
      const categoryName = nameElement?.textContent?.trim() || '';
      
      if (img && categoryName) {
        console.log(`🧪 Checking card ${index + 1}: ${categoryName}`);
        
        // Find matching category data
        const categoryData = activeCategories.find(cat => 
          cat.name.toLowerCase().trim() === categoryName.toLowerCase().trim()
        );
        
        if (categoryData) {
          console.log(`📋 Found data for: ${categoryName}`);
          console.log(`🖼️ Image data:`, {
            hasImage: !!categoryData.image,
            imageType: categoryData.image?.startsWith('data:image/') ? 'base64' : 
                      categoryData.image?.startsWith('http') ? 'url' : 'unknown',
            imageLength: categoryData.image?.length || 0
          });
          
          // Check if image is problematic
          const isBlackImage = img.naturalWidth === 0 || img.naturalHeight === 0 || 
                              !img.complete || img.src === '' || img.src === 'about:blank';
          
          if (isBlackImage || !categoryData.image || categoryData.image.trim() === '') {
            console.log(`🔧 Fixing problematic image for: ${categoryName}`);
            
            // Use fallback image
            const fallbackImage = getCategoryFallbackImage(categoryName, index);
            
            // Create new image element to test
            const testImg = new Image();
            testImg.onload = () => {
              console.log(`✅ Fallback image loaded for: ${categoryName}`);
              img.src = fallbackImage;
              img.style.border = '2px solid #10b981';
              img.style.backgroundColor = 'transparent';
              fixedCount++;
            };
            testImg.onerror = () => {
              console.log(`❌ Fallback image failed for: ${categoryName}`);
              img.style.border = '2px solid #ef4444';
              img.style.backgroundColor = '#fee2e2';
            };
            testImg.src = fallbackImage;
            
          } else if (categoryData.image) {
            console.log(`🔄 Reloading existing image for: ${categoryName}`);
            
            // Test existing image
            const testImg = new Image();
            testImg.onload = () => {
              console.log(`✅ Existing image reloaded for: ${categoryName}`);
              img.src = categoryData.image;
              img.style.border = '2px solid #3b82f6';
              img.style.backgroundColor = 'transparent';
            };
            testImg.onerror = () => {
              console.log(`❌ Existing image failed, using fallback for: ${categoryName}`);
              const fallbackImage = getCategoryFallbackImage(categoryName, index);
              img.src = fallbackImage;
              img.style.border = '2px solid #f59e0b';
              img.style.backgroundColor = '#fef3c7';
              fixedCount++;
            };
            testImg.src = categoryData.image;
          }
        } else {
          console.log(`❌ No data found for: ${categoryName}`);
          
          // Use fallback for unknown categories
          const fallbackImage = getCategoryFallbackImage(categoryName, index);
          img.src = fallbackImage;
          img.style.border = '2px solid #8b5cf6';
          img.style.backgroundColor = '#f3e8ff';
          fixedCount++;
        }
      }
    });
    
    console.log(`🎯 Fixed ${fixedCount} images in Popular Destinations`);
    
    // Show visual feedback
    setTimeout(() => {
      alert(`✅ Fixed ${fixedCount} images! Check the Popular Destinations section.`);
    }, 2000);
    
    return fixedCount;
    
  } catch (error) {
    console.error('❌ Error fixing black images:', error);
    alert('❌ Error fixing images! Check console for details.');
    return 0;
  }
};

// Replace all category images with high-quality fallbacks
export const replaceAllWithFallbacks = async () => {
  console.log('🎨 Replacing all category images with high-quality fallbacks...');
  
  try {
    const { getCategoryFallbackImage } = await import('./firebaseStorageHelper');
    
    const categoryCards = document.querySelectorAll('a[href*="/categories/"]');
    console.log('🔍 Found category cards:', categoryCards.length);
    
    let replacedCount = 0;
    
    categoryCards.forEach((card, index) => {
      const img = card.querySelector('img');
      const nameElement = card.querySelector('h3');
      const categoryName = nameElement?.textContent?.trim() || `Category ${index + 1}`;
      
      if (img) {
        console.log(`🎨 Replacing image for: ${categoryName}`);
        
        const fallbackImage = getCategoryFallbackImage(categoryName, index);
        
        const testImg = new Image();
        testImg.onload = () => {
          console.log(`✅ High-quality image loaded for: ${categoryName}`);
          img.src = fallbackImage;
          img.style.border = '2px solid #10b981';
          img.style.backgroundColor = 'transparent';
          replacedCount++;
        };
        testImg.onerror = () => {
          console.log(`❌ Failed to load high-quality image for: ${categoryName}`);
        };
        testImg.src = fallbackImage;
      }
    });
    
    console.log(`🎯 Replaced ${replacedCount} images with high-quality fallbacks`);
    
    setTimeout(() => {
      alert(`✅ Replaced ${replacedCount} images with beautiful high-quality photos!`);
    }, 2000);
    
    return replacedCount;
    
  } catch (error) {
    console.error('❌ Error replacing images:', error);
    return 0;
  }
};

// Force refresh Popular Destinations section
export const refreshPopularDestinations = () => {
  console.log('🔄 Refreshing Popular Destinations section...');
  
  // Find the Popular Destinations section
  const sections = document.querySelectorAll('section');
  let popularSection = null;
  
  sections.forEach(section => {
    const heading = section.querySelector('h2');
    if (heading && heading.textContent.includes('Popular Destinations')) {
      popularSection = section;
    }
  });
  
  if (popularSection) {
    console.log('✅ Found Popular Destinations section');
    
    // Add visual indicator
    popularSection.style.border = '3px solid #3b82f6';
    popularSection.style.borderRadius = '8px';
    popularSection.style.padding = '16px';
    
    // Force re-render by triggering a small change
    const originalDisplay = popularSection.style.display;
    popularSection.style.display = 'none';
    
    setTimeout(() => {
      popularSection.style.display = originalDisplay;
      console.log('🔄 Popular Destinations section refreshed');
      
      // Remove visual indicator after a moment
      setTimeout(() => {
        popularSection.style.border = '';
        popularSection.style.borderRadius = '';
        popularSection.style.padding = '';
      }, 3000);
    }, 100);
    
  } else {
    console.log('❌ Popular Destinations section not found');
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.fixBlackImagesInPopularDestinations = fixBlackImagesInPopularDestinations;
  window.replaceAllWithFallbacks = replaceAllWithFallbacks;
  window.refreshPopularDestinations = refreshPopularDestinations;
  
  console.log('🔧 Black images fix functions available:');
  console.log('   - fixBlackImagesInPopularDestinations() - Fix black/broken images');
  console.log('   - replaceAllWithFallbacks() - Replace all with high-quality images');
  console.log('   - refreshPopularDestinations() - Refresh the section');
}
