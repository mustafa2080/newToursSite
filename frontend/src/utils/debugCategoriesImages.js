// Debug categories images in Popular Destinations
export const debugCategoriesImages = async () => {
  console.log('🔍 Debugging categories images in Popular Destinations...');
  
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    // Get categories from Firebase
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories = categoriesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log('📂 Total categories found:', categories.length);
    
    // Filter active categories
    const activeCategories = categories.filter(cat => cat.status === 'active' || !cat.status);
    console.log('✅ Active categories:', activeCategories.length);
    
    // Analyze each category
    activeCategories.forEach((category, index) => {
      console.log(`\n📋 Category ${index + 1}: ${category.name}`);
      console.log('  🆔 ID:', category.id);
      console.log('  🔗 Slug:', category.slug);
      console.log('  📝 Description:', category.description?.substring(0, 50) + '...');
      console.log('  🎯 Status:', category.status || 'undefined');
      console.log('  🎨 Icon:', category.icon || 'none');
      
      if (category.image) {
        console.log('  🖼️ Image Status: ✅ HAS IMAGE');
        console.log('  📏 Image Length:', category.image.length);
        
        if (category.image.startsWith('data:image/')) {
          console.log('  📊 Image Type: ✅ Valid Base64 Data URL');
          console.log('  🔍 Image Format:', category.image.split(';')[0].split(':')[1]);
          console.log('  📄 Preview:', category.image.substring(0, 50) + '...');
          
          // Test if image can be loaded
          const testImg = new Image();
          testImg.onload = () => {
            console.log(`  ✅ Image loads successfully: ${category.name} (${testImg.width}x${testImg.height})`);
          };
          testImg.onerror = () => {
            console.log(`  ❌ Image failed to load: ${category.name}`);
          };
          testImg.src = category.image;
          
        } else if (category.image.startsWith('http')) {
          console.log('  📊 Image Type: 🌐 HTTP URL');
          console.log('  🔗 URL:', category.image);
          
          // Test if URL is accessible
          fetch(category.image, { method: 'HEAD' })
            .then(response => {
              if (response.ok) {
                console.log(`  ✅ URL accessible: ${category.name}`);
              } else {
                console.log(`  ❌ URL not accessible: ${category.name} (${response.status})`);
              }
            })
            .catch(error => {
              console.log(`  ❌ URL error: ${category.name}`, error.message);
            });
            
        } else {
          console.log('  📊 Image Type: ❓ Unknown format');
          console.log('  🔍 Preview:', category.image.substring(0, 100));
        }
      } else {
        console.log('  🖼️ Image Status: ❌ NO IMAGE');
      }
      
      console.log('  ─────────────────────────────────────');
    });
    
    // Summary
    const categoriesWithImages = activeCategories.filter(cat => cat.image && cat.image.trim());
    const categoriesWithBase64 = activeCategories.filter(cat => cat.image && cat.image.startsWith('data:image/'));
    const categoriesWithUrls = activeCategories.filter(cat => cat.image && cat.image.startsWith('http'));
    const categoriesWithoutImages = activeCategories.filter(cat => !cat.image || !cat.image.trim());
    
    console.log('\n📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📂 Total active categories:', activeCategories.length);
    console.log('✅ Categories with images:', categoriesWithImages.length);
    console.log('📄 Categories with base64 images:', categoriesWithBase64.length);
    console.log('🌐 Categories with URL images:', categoriesWithUrls.length);
    console.log('❌ Categories without images:', categoriesWithoutImages.length);
    console.log('📈 Image coverage:', `${Math.round((categoriesWithImages.length / activeCategories.length) * 100)}%`);
    
    if (categoriesWithoutImages.length > 0) {
      console.log('\n🚨 Categories missing images:');
      categoriesWithoutImages.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`);
      });
    }
    
    return {
      total: activeCategories.length,
      withImages: categoriesWithImages.length,
      withBase64: categoriesWithBase64.length,
      withUrls: categoriesWithUrls.length,
      withoutImages: categoriesWithoutImages.length,
      categories: activeCategories
    };
    
  } catch (error) {
    console.error('❌ Error debugging categories images:', error);
    return null;
  }
};

// Test image display in Popular Destinations section
export const testPopularDestinationsImages = () => {
  console.log('🧪 Testing Popular Destinations images display...');
  
  // Find Popular Destinations section
  const popularSection = document.querySelector('section');
  if (!popularSection) {
    console.log('❌ Popular Destinations section not found');
    return;
  }
  
  // Find category cards
  const categoryCards = document.querySelectorAll('a[href*="/categories/"]');
  console.log('🔍 Found category cards:', categoryCards.length);
  
  categoryCards.forEach((card, index) => {
    const img = card.querySelector('img');
    const categoryName = card.querySelector('h3')?.textContent || `Category ${index + 1}`;
    
    console.log(`\n🧪 Testing card ${index + 1}: ${categoryName}`);
    
    if (img) {
      console.log('  🖼️ Image element found');
      console.log('  🔗 Image src:', img.src.substring(0, 100) + '...');
      console.log('  📐 Image dimensions:', `${img.width}x${img.height}`);
      console.log('  🎨 Image classes:', img.className);
      
      // Check if image is loaded
      if (img.complete && img.naturalHeight !== 0) {
        console.log('  ✅ Image loaded successfully');
      } else {
        console.log('  ❌ Image not loaded or failed to load');
        
        // Add test border to identify problematic images
        img.style.border = '3px solid red';
        img.style.backgroundColor = 'yellow';
      }
    } else {
      console.log('  ❌ No image element found in card');
    }
  });
};

// Fix black images by reloading them
export const fixBlackImages = async () => {
  console.log('🔧 Fixing black images in Popular Destinations...');
  
  try {
    // Get fresh category data
    const result = await debugCategoriesImages();
    if (!result) return;
    
    // Find category cards and update their images
    const categoryCards = document.querySelectorAll('a[href*="/categories/"]');
    
    categoryCards.forEach((card, index) => {
      const img = card.querySelector('img');
      const categoryName = card.querySelector('h3')?.textContent || '';
      
      if (img && categoryName) {
        // Find matching category data
        const categoryData = result.categories.find(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (categoryData && categoryData.image) {
          console.log(`🔧 Fixing image for: ${categoryName}`);
          
          // Force reload the image
          const newImg = new Image();
          newImg.onload = () => {
            console.log(`✅ Fixed image for: ${categoryName}`);
            img.src = categoryData.image;
            img.style.border = '2px solid green';
          };
          newImg.onerror = () => {
            console.log(`❌ Still failed to load: ${categoryName}`);
            img.style.border = '2px solid red';
          };
          newImg.src = categoryData.image;
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing black images:', error);
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.debugCategoriesImages = debugCategoriesImages;
  window.testPopularDestinationsImages = testPopularDestinationsImages;
  window.fixBlackImages = fixBlackImages;
  
  console.log('🔍 Categories debug functions available:');
  console.log('   - debugCategoriesImages() - Debug all category images');
  console.log('   - testPopularDestinationsImages() - Test images in Popular Destinations');
  console.log('   - fixBlackImages() - Fix black/broken images');
}
