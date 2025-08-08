// Test image upload functionality
export const testImageUpload = () => {
  console.log('🧪 Testing image upload functionality...');
  
  // Create a test file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    
    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    try {
      // Test base64 conversion
      console.log('🔄 Converting to base64...');
      const base64 = await convertToBase64(file);
      
      console.log('✅ Base64 conversion successful!');
      console.log('📊 Base64 length:', base64.length);
      console.log('🔍 Base64 preview:', base64.substring(0, 100) + '...');
      
      // Test image display
      const img = document.createElement('img');
      img.src = base64;
      img.style.maxWidth = '200px';
      img.style.maxHeight = '200px';
      img.style.border = '2px solid #10b981';
      img.style.borderRadius = '8px';
      img.style.margin = '10px';
      
      img.onload = () => {
        console.log('✅ Image display test successful!');
        console.log('📐 Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
      };
      
      img.onerror = () => {
        console.error('❌ Image display test failed!');
      };
      
      // Add to page for visual verification
      document.body.appendChild(img);
      
      // Test category creation simulation
      console.log('🧪 Simulating category creation...');
      const testCategory = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'This is a test category with uploaded image',
        image: base64,
        status: 'active'
      };
      
      console.log('📋 Test category data prepared:', {
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description,
        imageLength: testCategory.image.length,
        status: testCategory.status
      });
      
      console.log('🎯 Image upload test completed successfully!');
      alert('✅ Image upload test successful! Check console for details.');
      
    } catch (error) {
      console.error('❌ Image upload test failed:', error);
      alert('❌ Image upload test failed! Check console for details.');
    }
  };
  
  // Trigger file selection
  input.click();
};

// Helper function to convert file to base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Test category image display
export const testCategoryImageDisplay = async () => {
  console.log('🖼️ Testing category image display...');
  
  try {
    const { getCategories } = await import('../services/firebase/categories');
    const result = await getCategories();
    
    if (!result.success) {
      console.error('❌ Failed to fetch categories');
      return;
    }
    
    const categories = result.categories || [];
    console.log('📂 Categories found:', categories.length);
    
    const categoriesWithImages = categories.filter(cat => cat.image);
    console.log('🖼️ Categories with images:', categoriesWithImages.length);
    
    // Test each category image
    for (const category of categoriesWithImages) {
      console.log(`\n🧪 Testing image for category: ${category.name}`);
      console.log('🔗 Image URL/Data:', category.image.substring(0, 100) + '...');
      
      // Create test image element
      const img = document.createElement('img');
      img.src = category.image;
      img.alt = category.name;
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.border = '2px solid #3b82f6';
      img.style.borderRadius = '8px';
      img.style.margin = '5px';
      img.title = category.name;
      
      img.onload = () => {
        console.log(`✅ Image loaded successfully for: ${category.name}`);
      };
      
      img.onerror = () => {
        console.error(`❌ Image failed to load for: ${category.name}`);
      };
      
      // Add to page
      document.body.appendChild(img);
    }
    
    if (categoriesWithImages.length === 0) {
      console.log('⚠️ No categories with images found');
      alert('No categories with images found. Please add some categories with images first.');
    } else {
      console.log('🎯 Category image display test completed!');
      alert(`✅ Testing ${categoriesWithImages.length} category images. Check the page and console for results.`);
    }
    
  } catch (error) {
    console.error('❌ Category image display test failed:', error);
    alert('❌ Test failed! Check console for details.');
  }
};

// Quick fix for existing categories without images
export const addTestImagesToCategories = async () => {
  console.log('🎨 Adding test images to categories without images...');
  
  try {
    const { getCategories, updateCategory } = await import('../services/firebase/categories');
    const result = await getCategories();
    
    if (!result.success) {
      console.error('❌ Failed to fetch categories');
      return;
    }
    
    const categories = result.categories || [];
    const categoriesWithoutImages = categories.filter(cat => !cat.image || !cat.image.trim());
    
    console.log('📂 Categories without images:', categoriesWithoutImages.length);
    
    if (categoriesWithoutImages.length === 0) {
      console.log('✅ All categories already have images!');
      alert('✅ All categories already have images!');
      return;
    }
    
    // Sample high-quality images for different destinations
    const sampleImages = {
      'egypt': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'turkey': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'morocco': 'https://images.unsplash.com/photo-1544948503-7ad532c2c0a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'jordan': 'https://images.unsplash.com/photo-1544948503-7ad532c2c0a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'lebanon': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'saudi': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'uae': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'mountain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'city': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'desert': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
    
    let updatedCount = 0;
    
    for (const category of categoriesWithoutImages) {
      const categoryName = category.name.toLowerCase();
      let imageUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'; // default
      
      // Try to find a matching image
      for (const [key, url] of Object.entries(sampleImages)) {
        if (categoryName.includes(key)) {
          imageUrl = url;
          break;
        }
      }
      
      console.log(`🖼️ Adding image to "${category.name}": ${imageUrl}`);
      
      const updateResult = await updateCategory(category.id, { image: imageUrl });
      if (updateResult.success) {
        updatedCount++;
        console.log(`✅ Updated: ${category.name}`);
      } else {
        console.error(`❌ Failed to update: ${category.name}`);
      }
    }
    
    console.log(`🎯 Added images to ${updatedCount} categories`);
    alert(`✅ Added images to ${updatedCount} categories! Refresh the page to see the results.`);
    
  } catch (error) {
    console.error('❌ Error adding test images:', error);
    alert('❌ Failed to add test images! Check console for details.');
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.testImageUpload = testImageUpload;
  window.testCategoryImageDisplay = testCategoryImageDisplay;
  window.addTestImagesToCategories = addTestImagesToCategories;
  
  console.log('🧪 Image upload test functions available:');
  console.log('   - testImageUpload() - Test file upload and base64 conversion');
  console.log('   - testCategoryImageDisplay() - Test existing category images');
  console.log('   - addTestImagesToCategories() - Add sample images to categories');
}
