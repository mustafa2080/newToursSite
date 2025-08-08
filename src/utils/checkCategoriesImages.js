import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Check categories images in Firebase
export const checkCategoriesImages = async () => {
  try {
    console.log('🔍 Checking categories images in Firebase...');
    
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories = categoriesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log('📂 Total categories found:', categories.length);
    
    categories.forEach((category, index) => {
      console.log(`\n📋 Category ${index + 1}:`);
      console.log('  🏷️ Name:', category.name);
      console.log('  🆔 ID:', category.id);
      console.log('  🔗 Slug:', category.slug);
      console.log('  📝 Description:', category.description?.substring(0, 50) + '...');
      console.log('  🎯 Status:', category.status);
      console.log('  🎨 Icon:', category.icon);
      
      if (category.image) {
        console.log('  🖼️ Image Status: ✅ HAS IMAGE');
        console.log('  📏 Image Length:', category.image.length);
        
        if (category.image.startsWith('data:')) {
          console.log('  📊 Image Type: Base64 Data URL');
          console.log('  🔍 Preview:', category.image.substring(0, 50) + '...');
        } else if (category.image.startsWith('http')) {
          console.log('  📊 Image Type: HTTP URL');
          console.log('  🔗 URL:', category.image);
        } else if (category.image.startsWith('gs://')) {
          console.log('  📊 Image Type: Firebase Storage URL');
          console.log('  🔗 Storage Path:', category.image);
        } else {
          console.log('  📊 Image Type: Unknown format');
          console.log('  🔍 Preview:', category.image.substring(0, 100));
        }
      } else {
        console.log('  🖼️ Image Status: ❌ NO IMAGE');
      }
      
      console.log('  ─────────────────────────────────────');
    });
    
    // Summary
    const categoriesWithImages = categories.filter(cat => cat.image && cat.image.trim());
    const categoriesWithoutImages = categories.filter(cat => !cat.image || !cat.image.trim());
    
    console.log('\n📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Categories with images:', categoriesWithImages.length);
    console.log('❌ Categories without images:', categoriesWithoutImages.length);
    console.log('📈 Image coverage:', `${Math.round((categoriesWithImages.length / categories.length) * 100)}%`);
    
    if (categoriesWithoutImages.length > 0) {
      console.log('\n🚨 Categories missing images:');
      categoriesWithoutImages.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`);
      });
    }
    
    return {
      total: categories.length,
      withImages: categoriesWithImages.length,
      withoutImages: categoriesWithoutImages.length,
      categories: categories
    };
    
  } catch (error) {
    console.error('❌ Error checking categories images:', error);
    return null;
  }
};

// Add sample images to categories without images
export const addSampleImagesToCategories = async () => {
  try {
    console.log('🎨 Adding sample images to categories...');
    
    const result = await checkCategoriesImages();
    if (!result) return;
    
    const categoriesWithoutImages = result.categories.filter(cat => !cat.image || !cat.image.trim());
    
    // Sample images for different destinations
    const sampleImages = {
      'egypt': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'turkey': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'morocco': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'jordan': 'https://images.unsplash.com/photo-1544948503-7ad532c2c0a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'lebanon': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
    
    for (const category of categoriesWithoutImages) {
      const categoryName = category.name.toLowerCase();
      let imageUrl = sampleImages.default;
      
      // Try to match category name with sample images
      for (const [key, url] of Object.entries(sampleImages)) {
        if (categoryName.includes(key)) {
          imageUrl = url;
          break;
        }
      }
      
      console.log(`🖼️ Adding image to "${category.name}": ${imageUrl}`);
      
      // Update category with image
      const { updateCategory } = await import('../services/firebase/categories');
      await updateCategory(category.id, { image: imageUrl });
    }
    
    console.log('✅ Sample images added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample images:', error);
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.checkCategoriesImages = checkCategoriesImages;
  window.addSampleImagesToCategories = addSampleImagesToCategories;
  
  console.log('🔍 Categories image checker functions available:');
  console.log('   - checkCategoriesImages()');
  console.log('   - addSampleImagesToCategories()');
}
