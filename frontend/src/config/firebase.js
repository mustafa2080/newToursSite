import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC7J92Y83_7OIXHY3RBcNNmG3TTi8CNnuE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tours-52d78.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tours-52d78",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tours-52d78.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "442131342279",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:442131342279:web:f0d7b0fafd88bf98f22fe2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7R5HYZ455N"
};

// Validate configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('Missing Firebase configuration fields:', missingFields);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize Firebase services with error handling
let auth, db, storage, functions, analytics;

try {
  auth = getAuth(app);

  // Test auth configuration
  if (auth && auth.app) {
    console.log('✅ Firebase Auth initialized successfully');
    console.log('🔧 Auth domain:', auth.app.options.authDomain);
    console.log('🔧 Project ID:', auth.app.options.projectId);
  } else {
    throw new Error('Auth object is invalid');
  }
} catch (error) {
  console.error('❌ Firebase Auth initialization failed:', error);
  console.error('🔧 Check your Firebase project settings');
  console.error('🔧 Ensure Authentication is enabled in Firebase Console');

  // Create a mock auth object for development
  auth = {
    currentUser: null,
    app: { options: { authDomain: 'mock', projectId: 'mock' } },
    authStateReady: () => Promise.reject(new Error('Auth not configured')),
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase Authentication is not enabled. Please enable it in Firebase Console.')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase Authentication is not enabled. Please enable it in Firebase Console.')),
    signOut: () => Promise.reject(new Error('Auth not configured')),
  };
}

try {
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
} catch (error) {
  console.error('❌ Firestore initialization failed:', error);
}

try {
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized');
} catch (error) {
  console.error('❌ Firebase Storage initialization failed:', error);
}

try {
  functions = getFunctions(app);
  console.log('✅ Firebase Functions initialized');
} catch (error) {
  console.error('❌ Firebase Functions initialization failed:', error);
}

try {
  analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
  if (analytics) console.log('✅ Firebase Analytics initialized');
} catch (error) {
  console.warn('⚠️ Firebase Analytics initialization failed:', error);
  analytics = null;
}

export { app, auth, db, storage, functions, analytics };

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Auth emulator
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    
    // Firestore emulator
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Storage emulator
    if (!storage._delegate._host.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    
    // Functions emulator
    if (!functions._delegate._url.includes('localhost')) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
    
    console.log('🔥 Connected to Firebase emulators');
  } catch (error) {
    console.warn('Firebase emulator connection failed:', error);
  }
}

export default app;
