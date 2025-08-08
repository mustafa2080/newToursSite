import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample categories data with beautiful images
const sampleCategories = [
  {
    id: 'beach-destinations',
    name: 'Beach',
    slug: 'beach-destinations',
    description: 'Discover pristine beaches and crystal-clear waters around the world',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isActive: true,
    featured: true,
    order: 1,
    tripsCount: 15,
    hotelsCount: 25,
    searchKeywords: ['beach', 'ocean', 'sea', 'sand', 'tropical', 'paradise', 'swimming', 'surfing', 'diving']
  },
  {
    id: 'mountain-adventures',
    name: 'Mountain',
    slug: 'mountain-adventures',
    description: 'Experience breathtaking mountain landscapes and outdoor adventures',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isActive: true,
    featured: true,
    order: 2,
    tripsCount: 20,
    hotelsCount: 18,
    searchKeywords: ['mountain', 'hiking', 'climbing', 'nature', 'adventure', 'peaks', 'alpine', 'trekking', 'wilderness']
  },
  {
    id: 'city-breaks',
    name: 'City',
    slug: 'city-breaks',
    description: 'Explore vibrant cities with rich culture and modern attractions',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isActive: true,
    featured: true,
    order: 3,
    tripsCount: 30,
    hotelsCount: 45,
    searchKeywords: ['city', 'urban', 'culture', 'museums', 'shopping', 'nightlife', 'architecture', 'restaurants', 'entertainment']
  },
  {
    id: 'desert-expeditions',
    name: 'Desert',
    slug: 'desert-expeditions',
    description: 'Journey through stunning desert landscapes and ancient cultures',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isActive: true,
    featured: true,
    order: 4,
    tripsCount: 12,
    hotelsCount: 8,
    searchKeywords: ['desert', 'sand dunes', 'oasis', 'camel', 'nomad', 'sahara', 'adventure', 'camping', 'stargazing']
  },
  {
    id: 'safari-wildlife',
    name: 'Safari',
    slug: 'safari-wildlife',
    description: 'Witness incredible wildlife in their natural habitats',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isActive: true,
    featured: true,
    order: 5,
    tripsCount: 18,
    hotelsCount: 12,
    searchKeywords: ['safari', 'wildlife', 'animals', 'africa', 'big five', 'lions', 'elephants', 'photography', 'nature']
  },
  {
    id: 'tropical-islands',
    name: 'Island',
    slug: 'tropical-islands',
    description: 'Escape to paradise on beautiful tropical islands',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isActive: true,
    featured: true,
    order: 6,
    tripsCount: 22,
    hotelsCount: 35,
    searchKeywords: ['island', 'tropical', 'paradise', 'palm trees', 'lagoon', 'coral reef', 'snorkeling', 'relaxation', 'honeymoon']
  },
  {
    id: 'cultural-heritage',
    name: 'Cultural',
    slug: 'cultural-heritage',
    description: 'Immerse yourself in rich cultural heritage and traditions',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isActive: true,
    featured: true,
    order: 7,
    tripsCount: 25,
    hotelsCount: 20,
    searchKeywords: ['culture', 'heritage', 'history', 'temples', 'monuments', 'traditions', 'art', 'museums', 'ancient']
  },
  {
    id: 'luxury-travel',
    name: 'Luxury',
    slug: 'luxury-travel',
    description: 'Indulge in the finest luxury travel experiences',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isActive: true,
    featured: true,
    order: 8,
    tripsCount: 15,
    hotelsCount: 30,
    searchKeywords: ['luxury', 'premium', 'exclusive', 'spa', 'fine dining', 'private', 'vip', 'high-end', 'boutique']
  }
];

// Function to add sample categories
export const addSampleCategories = async () => {
  try {
    console.log('🏷️ Starting to add sample categories...');
    
    // Check if categories already exist
    const categoriesRef = collection(db, 'categories');
    const existingSnapshot = await getDocs(categoriesRef);
    
    if (existingSnapshot.size > 0) {
      console.log(`📊 Found ${existingSnapshot.size} existing categories. Skipping sample data creation.`);
      return {
        success: true,
        message: `Found ${existingSnapshot.size} existing categories`,
        categoriesAdded: 0
      };
    }
    
    const results = [];
    
    // Add each category
    for (const category of sampleCategories) {
      try {
        const categoryDoc = doc(db, 'categories', category.id);
        await setDoc(categoryDoc, {
          ...category,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        results.push({
          id: category.id,
          name: category.name,
          status: 'success'
        });
        
        console.log(`✅ Added category: ${category.name}`);
      } catch (error) {
        console.error(`❌ Failed to add category ${category.name}:`, error);
        results.push({
          id: category.id,
          name: category.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`🎉 Categories setup completed: ${successCount} successful, ${errorCount} failed`);
    
    return {
      success: true,
      message: `Added ${successCount} categories successfully`,
      categoriesAdded: successCount,
      results: results
    };
    
  } catch (error) {
    console.error('❌ Error adding sample categories:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to update existing categories with images
export const updateCategoriesWithImages = async () => {
  try {
    console.log('🖼️ Starting to update categories with images...');
    
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.size === 0) {
      return {
        success: false,
        error: 'No categories found. Please add categories first.'
      };
    }
    
    const updates = [];
    
    // Create a mapping of category names to images
    const imageMapping = {};
    sampleCategories.forEach(cat => {
      imageMapping[cat.name.toLowerCase()] = cat.image;
    });
    
    // Update each existing category
    for (const docSnapshot of snapshot.docs) {
      const categoryData = docSnapshot.data();
      const categoryName = categoryData.name?.toLowerCase() || '';
      
      // Find matching image
      let imageUrl = null;
      for (const [key, url] of Object.entries(imageMapping)) {
        if (categoryName.includes(key) || key.includes(categoryName)) {
          imageUrl = url;
          break;
        }
      }
      
      // Use default image if no match found
      if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      }
      
      try {
        await updateDoc(doc(db, 'categories', docSnapshot.id), {
          image: imageUrl,
          updatedAt: new Date()
        });
        
        updates.push({
          id: docSnapshot.id,
          name: categoryData.name,
          status: 'success',
          imageUrl: imageUrl
        });
        
        console.log(`✅ Updated category: ${categoryData.name}`);
      } catch (error) {
        console.error(`❌ Failed to update category ${categoryData.name}:`, error);
        updates.push({
          id: docSnapshot.id,
          name: categoryData.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    const successCount = updates.filter(u => u.status === 'success').length;
    const errorCount = updates.filter(u => u.status === 'error').length;
    
    console.log(`🎉 Categories update completed: ${successCount} successful, ${errorCount} failed`);
    
    return {
      success: true,
      message: `Updated ${successCount} categories successfully`,
      categoriesUpdated: successCount,
      updates: updates
    };
    
  } catch (error) {
    console.error('❌ Error updating categories:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default { addSampleCategories, updateCategoriesWithImages };
