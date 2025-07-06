import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create admin user function
export const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@tours.com';
    const adminPassword = 'admin123456';
    
    console.log('🔄 Creating admin user...');
    
    // Try to create the user
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Admin user created:', user.email);
    
    // Create admin document in Firestore
    const adminDoc = {
      uid: user.uid,
      email: user.email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', user.uid), adminDoc);
    console.log('✅ Admin document created in Firestore');
    
    return {
      success: true,
      message: 'Admin user created successfully',
      credentials: { email: adminEmail, password: adminPassword }
    };
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: true,
        message: 'Admin user already exists',
        credentials: { email: 'admin@tours.com', password: 'admin123456' }
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Create test user function
export const createTestUser = async () => {
  try {
    const testEmail = 'user@test.com';
    const testPassword = 'test123456';
    
    console.log('🔄 Creating test user...');
    
    // Try to create the user
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log('✅ Test user created:', user.email);
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true,
      emailVerified: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    console.log('✅ Test user document created in Firestore');
    
    return {
      success: true,
      message: 'Test user created successfully',
      credentials: { email: testEmail, password: testPassword }
    };
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: true,
        message: 'Test user already exists',
        credentials: { email: 'user@test.com', password: 'test123456' }
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Test login function
export const testLogin = async (email, password) => {
  try {
    console.log('🔄 Testing login for:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Login successful:', user.email);
    
    return {
      success: true,
      message: 'Login successful',
      user: user
    };
    
  } catch (error) {
    console.error('❌ Login failed:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Make functions available in console
if (typeof window !== 'undefined') {
  window.createAdminUser = createAdminUser;
  window.createTestUser = createTestUser;
  window.testLogin = testLogin;
  
  console.log('🔧 Firebase user creation functions available:');
  console.log('- createAdminUser() - Creates admin@tours.com with password admin123456');
  console.log('- createTestUser() - Creates user@test.com with password test123456');
  console.log('- testLogin(email, password) - Tests login with given credentials');
}
