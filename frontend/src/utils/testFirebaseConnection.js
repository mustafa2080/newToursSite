import { auth, db, storage, analytics } from '../config/firebase.js';
import { 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Test Firebase Connection
export const testFirebaseConnection = async () => {
  console.log('🔥 Starting Firebase Connection Test...');
  
  const results = {
    auth: false,
    firestore: false,
    storage: false,
    analytics: false,
    overall: false
  };

  try {
    // Test 1: Firebase Auth
    console.log('1️⃣ Testing Firebase Authentication...');
    
    if (auth) {
      // Test anonymous sign in
      const userCredential = await signInAnonymously(auth);
      if (userCredential.user) {
        console.log('✅ Auth Test: Anonymous sign-in successful');
        console.log('👤 User ID:', userCredential.user.uid);
        results.auth = true;
        
        // Sign out after test
        await auth.signOut();
        console.log('🚪 Signed out successfully');
      }
    } else {
      throw new Error('Auth not initialized');
    }

  } catch (error) {
    console.error('❌ Auth Test Failed:', error.message);
    results.auth = false;
  }

  try {
    // Test 2: Firestore Database
    console.log('2️⃣ Testing Firestore Database...');
    
    if (db) {
      // Create test document
      const testCollection = collection(db, 'connection_test');
      const testDoc = await addDoc(testCollection, {
        message: 'Firebase connection test',
        timestamp: new Date(),
        test: true
      });
      
      console.log('✅ Firestore Test: Document created with ID:', testDoc.id);
      
      // Read test documents
      const querySnapshot = await getDocs(testCollection);
      console.log('📄 Firestore Test: Found', querySnapshot.size, 'test documents');
      
      // Clean up - delete test document
      await deleteDoc(doc(db, 'connection_test', testDoc.id));
      console.log('🗑️ Firestore Test: Cleanup completed');
      
      results.firestore = true;
    } else {
      throw new Error('Firestore not initialized');
    }

  } catch (error) {
    console.error('❌ Firestore Test Failed:', error.message);
    results.firestore = false;
  }

  try {
    // Test 3: Firebase Storage
    console.log('3️⃣ Testing Firebase Storage...');
    
    if (storage) {
      // Create test file
      const testData = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
      const testRef = ref(storage, 'test/connection_test.txt');
      
      // Upload test file
      const snapshot = await uploadBytes(testRef, testData);
      console.log('✅ Storage Test: File uploaded successfully');
      
      // Get download URL
      const downloadURL = await getDownloadURL(testRef);
      console.log('🔗 Storage Test: Download URL:', downloadURL);
      
      // Clean up - delete test file
      await deleteObject(testRef);
      console.log('🗑️ Storage Test: Cleanup completed');
      
      results.storage = true;
    } else {
      throw new Error('Storage not initialized');
    }

  } catch (error) {
    console.error('❌ Storage Test Failed:', error.message);
    results.storage = false;
  }

  try {
    // Test 4: Firebase Analytics
    console.log('4️⃣ Testing Firebase Analytics...');
    
    if (analytics) {
      console.log('✅ Analytics Test: Analytics initialized successfully');
      results.analytics = true;
    } else {
      console.log('⚠️ Analytics Test: Analytics not available (normal in development)');
      results.analytics = true; // Consider this as pass since it's optional
    }

  } catch (error) {
    console.error('❌ Analytics Test Failed:', error.message);
    results.analytics = false;
  }

  // Overall result
  results.overall = results.auth && results.firestore && results.storage;
  
  console.log('🏁 Firebase Connection Test Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Authentication:', results.auth ? '✅ PASS' : '❌ FAIL');
  console.log('🗄️ Firestore:', results.firestore ? '✅ PASS' : '❌ FAIL');
  console.log('📁 Storage:', results.storage ? '✅ PASS' : '❌ FAIL');
  console.log('📊 Analytics:', results.analytics ? '✅ PASS' : '❌ FAIL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 Overall Status:', results.overall ? '✅ ALL SYSTEMS GO!' : '❌ ISSUES DETECTED');
  
  return results;
};

// Test Firebase Configuration
export const testFirebaseConfig = () => {
  console.log('🔧 Firebase Configuration Check:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (auth?.app?.options) {
    const config = auth.app.options;
    console.log('🔑 API Key:', config.apiKey ? '✅ Set' : '❌ Missing');
    console.log('🌐 Auth Domain:', config.authDomain || '❌ Missing');
    console.log('🆔 Project ID:', config.projectId || '❌ Missing');
    console.log('🪣 Storage Bucket:', config.storageBucket || '❌ Missing');
    console.log('📱 App ID:', config.appId || '❌ Missing');
    console.log('📊 Measurement ID:', config.measurementId || '⚠️ Optional');
  } else {
    console.log('❌ Firebase configuration not available');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection;
  window.testFirebaseConfig = testFirebaseConfig;
  
  console.log('🔥 Firebase test functions available:');
  console.log('   - testFirebaseConnection()');
  console.log('   - testFirebaseConfig()');
}
