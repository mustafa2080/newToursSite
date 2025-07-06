import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getCountFromServer,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Generic CRUD operations
export class FirebaseCollection {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  // Create a new document
  async create(data) {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...docData };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get a single document by ID
  async getById(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error(`${this.collectionName} not found`);
      }
    } catch (error) {
      console.error(`Error getting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get all documents with optional filtering and pagination
  async getAll(options = {}) {
    try {
      let q = this.collectionRef;

      // Apply filters
      if (options.where) {
        options.where.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }

      // Apply ordering
      if (options.orderBy) {
        const [field, direction = 'asc'] = options.orderBy;
        q = query(q, orderBy(field, direction));
      }

      // Apply pagination
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting ${this.collectionName} list:`, error);
      throw error;
    }
  }

  // Update a document
  async update(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      await updateDoc(docRef, updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete a document
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return { id, deleted: true };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get document count
  async getCount(whereConditions = []) {
    try {
      let q = this.collectionRef;
      
      whereConditions.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });

      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} count:`, error);
      throw error;
    }
  }

  // Real-time listener
  onSnapshot(callback, options = {}) {
    try {
      let q = this.collectionRef;

      // Apply filters
      if (options.where) {
        options.where.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }

      // Apply ordering
      if (options.orderBy) {
        const [field, direction = 'asc'] = options.orderBy;
        q = query(q, orderBy(field, direction));
      }

      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      });
    } catch (error) {
      console.error(`Error setting up ${this.collectionName} listener:`, error);
      throw error;
    }
  }

  // Batch operations
  async batchUpdate(updates) {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, data }) => {
        const docRef = doc(db, this.collectionName, id);
        batch.update(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      return { success: true, count: updates.length };
    } catch (error) {
      console.error(`Error batch updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async batchDelete(ids) {
    try {
      const batch = writeBatch(db);
      
      ids.forEach(id => {
        const docRef = doc(db, this.collectionName, id);
        batch.delete(docRef);
      });

      await batch.commit();
      return { success: true, count: ids.length };
    } catch (error) {
      console.error(`Error batch deleting ${this.collectionName}:`, error);
      throw error;
    }
  }
}

// File upload utilities
export class FirebaseStorage {
  constructor(basePath = '') {
    this.basePath = basePath;
  }

  // Upload a single file
  async uploadFile(file, path, metadata = {}) {
    try {
      const fullPath = this.basePath ? `${this.basePath}/${path}` : path;
      const storageRef = ref(storage, fullPath);
      
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: fullPath,
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Upload multiple files
  async uploadFiles(files, pathPrefix = '') {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileName = `${Date.now()}_${index}_${file.name}`;
        const path = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;
        return this.uploadFile(file, path);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  // Delete a file
  async deleteFile(path) {
    try {
      const fullPath = this.basePath ? `${this.basePath}/${path}` : path;
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);
      return { success: true, path: fullPath };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // List files in a directory
  async listFiles(path = '') {
    try {
      const fullPath = this.basePath ? `${this.basePath}/${path}` : path;
      const storageRef = ref(storage, fullPath);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url
          };
        })
      );

      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
}

// Specific collection instances
export const usersCollection = new FirebaseCollection('users');
export const tripsCollection = new FirebaseCollection('trips');
export const hotelsCollection = new FirebaseCollection('hotels');
export const bookingsCollection = new FirebaseCollection('bookings');
export const reviewsCollection = new FirebaseCollection('reviews');
export const categoriesCollection = new FirebaseCollection('categories');
export const mediaCollection = new FirebaseCollection('media');

// Storage instances
export const avatarStorage = new FirebaseStorage('avatars');
export const tripStorage = new FirebaseStorage('trips');
export const hotelStorage = new FirebaseStorage('hotels');
export const generalStorage = new FirebaseStorage('general');

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default {
  FirebaseCollection,
  FirebaseStorage,
  usersCollection,
  tripsCollection,
  hotelsCollection,
  bookingsCollection,
  reviewsCollection,
  categoriesCollection,
  mediaCollection,
  avatarStorage,
  tripStorage,
  hotelStorage,
  generalStorage,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateSlug,
  generateBookingReference
};
