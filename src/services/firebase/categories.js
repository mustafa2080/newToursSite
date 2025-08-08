import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const CATEGORIES_COLLECTION = 'categories';

// Create a new category
export const createCategory = async (categoryData) => {
  try {
    console.log('Creating category in Firebase:', categoryData);
    
    const category = {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: categoryData.status || 'active',
    };

    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), category);
    
    console.log('Category created with ID:', docRef.id);
    
    return {
      success: true,
      category: {
        id: docRef.id,
        ...category,
      },
      message: 'Category created successfully'
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create category'
    };
  }
};

// Get all categories with optional filters
export const getCategories = async (filters = {}) => {
  try {
    console.log('Fetching categories from Firebase with filters:', filters);
    
    let q = collection(db, CATEGORIES_COLLECTION);
    const constraints = [];
    
    // Simple query without complex filters to avoid index issues
    const { pageSize = 50 } = filters;

    // Only use simple limit without any where clauses or orderBy
    constraints.push(limit(pageSize));

    // Add constraints to query
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    let categories = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      });
    });

    // Client-side filtering (no Firebase indexes needed)
    if (filters.type) {
      categories = categories.filter(cat => cat.type === filters.type);
    }

    if (filters.status) {
      categories = categories.filter(cat => cat.status === filters.status);
    } else {
      // If no status filter, show active categories or categories without status
      categories = categories.filter(cat => cat.status === 'active' || !cat.status);
    }

    // Sort by name (client-side)
    categories.sort((a, b) => a.name?.localeCompare(b.name) || 0);

    console.log(`Found ${categories.length} categories`);
    
    return {
      success: true,
      categories,
      count: categories.length,
      message: 'Categories retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error.message,
      categories: [],
      message: 'Failed to fetch categories'
    };
  }
};

// Get a single category by ID
export const getCategoryById = async (categoryId) => {
  try {
    console.log('Fetching category by ID:', categoryId);
    
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const category = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
      
      return {
        success: true,
        category,
        message: 'Category retrieved successfully'
      };
    } else {
      return {
        success: false,
        error: 'Category not found',
        message: 'Category not found'
      };
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch category'
    };
  }
};

// Update a category
export const updateCategory = async (categoryId, updateData) => {
  try {
    console.log('Updating category:', categoryId, updateData);
    
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(docRef, dataToUpdate);
    
    // Get the updated category
    const updatedCategory = await getCategoryById(categoryId);
    
    return {
      success: true,
      category: updatedCategory.category,
      message: 'Category updated successfully'
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update category'
    };
  }
};

// Delete a category
export const deleteCategory = async (categoryId) => {
  try {
    console.log('Deleting category:', categoryId);
    
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(docRef);
    
    return {
      success: true,
      message: 'Category deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete category'
    };
  }
};

// Get categories by type (trip or hotel)
export const getCategoriesByType = async (type) => {
  try {
    console.log('Fetching categories by type:', type);
    
    const result = await getCategories({ type, status: 'active' });
    return result;
  } catch (error) {
    console.error('Error fetching categories by type:', error);
    return {
      success: false,
      error: error.message,
      categories: [],
      message: 'Failed to fetch categories'
    };
  }
};

// Get category statistics
export const getCategoryStats = async () => {
  try {
    console.log('Fetching category statistics');
    
    const categoriesResult = await getCategories();
    
    if (!categoriesResult.success) {
      throw new Error(categoriesResult.error);
    }
    
    const categories = categoriesResult.categories;
    
    const stats = {
      total: categories.length,
      active: categories.filter(c => c.status === 'active').length,
      inactive: categories.filter(c => c.status === 'inactive').length,
      tripCategories: categories.filter(c => c.type === 'trip').length,
      hotelCategories: categories.filter(c => c.type === 'hotel').length,
    };
    
    return {
      success: true,
      stats,
      message: 'Statistics retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching category statistics:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch statistics'
    };
  }
};

// Export all functions
export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
  getCategoryStats,
};
