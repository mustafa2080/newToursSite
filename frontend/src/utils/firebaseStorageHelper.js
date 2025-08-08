import { ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

// Helper function to get proper image URL with fallback
export const getImageUrl = (imagePath, fallbackType = 'general', index = 0) => {
  // If it's a valid HTTP URL and not a blob, return as is
  if (imagePath && imagePath.startsWith('http') && !imagePath.includes('blob:')) {
    return imagePath;
  }

  // Return fallback image based on type
  return getFallbackImage(fallbackType, index);
};

// Helper function to get proper download URL from Firebase Storage
export const getFirebaseImageUrl = async (imagePath) => {
  try {
    if (!imagePath) return null;

    // If it's a blob URL, return fallback
    if (imagePath.includes('blob:')) {
      return null;
    }

    // If it's already a full HTTP URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it's a Firebase Storage path (gs:// or just path)
    let storagePath = imagePath;
    if (imagePath.startsWith('gs://')) {
      // Extract path from gs:// URL
      storagePath = imagePath.replace('gs://tours-52d78.firebasestorage.app/', '');
    }

    // Get reference and download URL
    const imageRef = ref(storage, storagePath);
    const downloadURL = await getDownloadURL(imageRef);

    console.log(`✅ Firebase Storage URL resolved: ${storagePath} -> ${downloadURL}`);
    return downloadURL;

  } catch (error) {
    console.error('❌ Error getting Firebase Storage URL:', error);
    console.error('   Original path:', imagePath);
    return null;
  }
};

// Helper function to convert Firebase Storage URLs to proper download URLs
export const convertFirebaseStorageUrl = (originalUrl) => {
  if (!originalUrl) return null;
  
  try {
    // If it's already a proper download URL, return as is
    if (originalUrl.includes('firebasestorage.googleapis.com') && originalUrl.includes('token=')) {
      return originalUrl;
    }
    
    // If it's a Firebase Storage API URL, convert to download URL
    if (originalUrl.includes('firebasestorage.googleapis.com/v0/b/') && originalUrl.includes('/o?name=')) {
      // Extract the file path from the URL
      const urlParts = originalUrl.split('/o?name=');
      if (urlParts.length === 2) {
        const filePath = decodeURIComponent(urlParts[1]);
        const bucketName = 'tours-52d78.firebasestorage.app';
        
        // Create proper download URL format
        const encodedPath = encodeURIComponent(filePath);
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
        
        console.log(`🔄 Converted Firebase Storage URL: ${filePath} -> ${downloadUrl}`);
        return downloadUrl;
      }
    }
    
    // If it's a gs:// URL, convert to download URL
    if (originalUrl.startsWith('gs://')) {
      const filePath = originalUrl.replace('gs://tours-52d78.firebasestorage.app/', '');
      const encodedPath = encodeURIComponent(filePath);
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/tours-52d78.firebasestorage.app/o/${encodedPath}?alt=media`;
      
      console.log(`🔄 Converted gs:// URL: ${filePath} -> ${downloadUrl}`);
      return downloadUrl;
    }
    
    return originalUrl;
    
  } catch (error) {
    console.error('❌ Error converting Firebase Storage URL:', error);
    return originalUrl;
  }
};

// Helper function to fix all Firebase Storage URLs in categories
export const fixCategoriesStorageUrls = async () => {
  try {
    console.log('🔧 Fixing Firebase Storage URLs in categories...');
    
    const { getCategories, updateCategory } = await import('../services/firebase/categories');
    const result = await getCategories();
    
    if (!result.success) {
      console.error('❌ Failed to fetch categories');
      return;
    }
    
    const categories = result.categories || [];
    let fixedCount = 0;
    
    for (const category of categories) {
      if (category.image && category.image.includes('firebasestorage.googleapis.com')) {
        const originalUrl = category.image;
        const fixedUrl = convertFirebaseStorageUrl(originalUrl);
        
        if (fixedUrl !== originalUrl) {
          console.log(`🔧 Fixing URL for category "${category.name}"`);
          console.log(`   Original: ${originalUrl}`);
          console.log(`   Fixed: ${fixedUrl}`);
          
          const updateResult = await updateCategory(category.id, { image: fixedUrl });
          if (updateResult.success) {
            fixedCount++;
            console.log(`✅ Updated category "${category.name}" with fixed URL`);
          } else {
            console.error(`❌ Failed to update category "${category.name}":`, updateResult.error);
          }
        }
      }
    }
    
    console.log(`🎯 Fixed ${fixedCount} category image URLs`);
    return fixedCount;
    
  } catch (error) {
    console.error('❌ Error fixing categories storage URLs:', error);
    return 0;
  }
};

// Helper function to validate image URL
export const validateImageUrl = async (imageUrl) => {
  try {
    if (!imageUrl) return false;
    
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
    
  } catch (error) {
    console.error('❌ Error validating image URL:', error);
    return false;
  }
};

// Get fallback image for different types
export const getFallbackImage = (type = 'general', index = 0) => {
  const baseIndex = Math.abs(index) % 1000;

  switch (type) {
    case 'trip':
    case 'trips':
      return `https://picsum.photos/500/300?random=${800 + baseIndex}`;
    case 'hotel':
    case 'hotels':
      return `https://picsum.photos/500/300?random=${900 + baseIndex}`;
    case 'category':
    case 'categories':
      return `https://picsum.photos/400/250?random=${700 + baseIndex}`;
    default:
      return `https://picsum.photos/500/300?random=${600 + baseIndex}`;
  }
};

// Helper function to get fallback image for categories
export const getCategoryFallbackImage = (categoryName, index = 0) => {
  const baseIndex = Math.abs(index) % 100;
  const fallbackImages = {
    'Mountain': `https://picsum.photos/400/250?random=${700 + baseIndex}`,
    'Beach': `https://picsum.photos/400/250?random=${710 + baseIndex}`,
    'Cultural': `https://picsum.photos/400/250?random=${720 + baseIndex}`,
    'Adventure': `https://picsum.photos/400/250?random=${730 + baseIndex}`,
    'City': `https://picsum.photos/400/250?random=${740 + baseIndex}`,
    'Nature': `https://picsum.photos/400/250?random=${750 + baseIndex}`,
    'Therapeutic': `https://picsum.photos/400/250?random=${760 + baseIndex}`,
    'egypt': 'https://picsum.photos/400/250?random=780',
    'turkey': 'https://picsum.photos/400/250?random=781',
    'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'morocco': 'https://images.unsplash.com/photo-1544948503-7ad532c2c0a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'jordan': 'https://images.unsplash.com/photo-1544948503-7ad532c2c0a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'lebanon': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'saudi': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'uae': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  };
  
  const categoryNameLower = categoryName.toLowerCase();
  
  // Try to find a matching fallback image
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (categoryNameLower.includes(key)) {
      return url;
    }
  }
  
  // Default fallback
  return `https://images.unsplash.com/photo-${1500000000000 + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`;
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.getFirebaseImageUrl = getFirebaseImageUrl;
  window.convertFirebaseStorageUrl = convertFirebaseStorageUrl;
  window.fixCategoriesStorageUrls = fixCategoriesStorageUrls;
  window.validateImageUrl = validateImageUrl;
  window.getCategoryFallbackImage = getCategoryFallbackImage;
  
  console.log('🔧 Firebase Storage helper functions available:');
  console.log('   - getFirebaseImageUrl(path)');
  console.log('   - convertFirebaseStorageUrl(url)');
  console.log('   - fixCategoriesStorageUrls()');
  console.log('   - validateImageUrl(url)');
  console.log('   - getCategoryFallbackImage(name, index)');
}
