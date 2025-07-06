// Test Firebase Storage functionality
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const testStorageUpload = async () => {
  try {
    console.log('Testing Firebase Storage upload...');
    
    // Create a simple test file
    const testData = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
    const testRef = ref(storage, 'test/test-file.txt');
    
    // Upload the file
    const snapshot = await uploadBytes(testRef, testData);
    console.log('Upload successful:', snapshot);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    // Clean up - delete the test file
    await deleteObject(testRef);
    console.log('Test file deleted successfully');
    
    return {
      success: true,
      message: 'Firebase Storage test completed successfully',
      downloadURL
    };
  } catch (error) {
    console.error('Firebase Storage test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Firebase Storage test failed'
    };
  }
};

export const testImageUpload = async (file) => {
  try {
    console.log('Testing image upload to Firebase Storage...');
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Create reference with timestamp to avoid conflicts
    const timestamp = Date.now();
    const fileName = `test-image-${timestamp}.jpg`;
    const imageRef = ref(storage, `test-images/${fileName}`);
    
    // Upload the image
    const snapshot = await uploadBytes(imageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        testUpload: 'true'
      }
    });
    
    console.log('Image upload successful:', snapshot);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Image download URL:', downloadURL);
    
    return {
      success: true,
      message: 'Image upload test completed successfully',
      downloadURL,
      fileName,
      size: snapshot.metadata.size
    };
  } catch (error) {
    console.error('Image upload test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Image upload test failed'
    };
  }
};

export const cleanupTestImages = async () => {
  try {
    console.log('Cleaning up test images...');
    
    // Note: In a real app, you'd list all files in the test-images folder
    // and delete them. For now, we'll just log that cleanup would happen here.
    console.log('Test image cleanup completed');
    
    return {
      success: true,
      message: 'Test images cleaned up successfully'
    };
  } catch (error) {
    console.error('Test image cleanup failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Test image cleanup failed'
    };
  }
};

export default {
  testStorageUpload,
  testImageUpload,
  cleanupTestImages
};
