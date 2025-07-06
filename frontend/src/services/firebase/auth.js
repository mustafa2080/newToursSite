import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  deleteUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

// Auth state observer
export const onAuthStateChange = (callback) => {
  try {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      console.warn('Firebase Auth not properly initialized');
      // Return a mock unsubscribe function
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('Auth state change error:', error);
    // Return a mock unsubscribe function
    return () => {};
  }
};

// Register new user
export const registerUser = async (userData) => {
  try {
    // Check if auth is available
    if (!auth) {
      throw new Error('Firebase Authentication is not initialized. Please check your Firebase configuration.');
    }

    // Test auth connection
    try {
      await auth.authStateReady();
    } catch (authError) {
      console.error('Auth state error:', authError);
      throw new Error('Firebase Authentication service is not available. Please check your internet connection and Firebase setup.');
    }

    const { email, password, firstName, lastName, phone, dateOfBirth, role = 'user' } = userData;

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      phone: phone || null,
      dateOfBirth: dateOfBirth || null,
      role,
      emailVerified: user.emailVerified,
      profileImage: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      isActive: true,
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    
    // Send email verification
    await sendEmailVerification(user);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userDoc,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    
    const userData = userDoc.data();
    
    // Check if user is active
    if (!userData.isActive) {
      await signOut(auth);
      throw new Error('Account is deactivated');
    }
    
    // Update last login time
    await updateDoc(userDocRef, {
      lastLoginAt: serverTimestamp(),
    });
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        ...userData,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get current user data
export const getCurrentUserData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    const { firstName, lastName, phone, dateOfBirth, profileImage } = userData;
    
    // Update Firebase Auth profile
    if (firstName && lastName) {
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: profileImage || user.photoURL,
      });
    }
    
    // Update Firestore document
    const userDocRef = doc(db, 'users', user.uid);
    const updateData = {
      updatedAt: serverTimestamp(),
    };
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    
    await updateDoc(userDocRef, updateData);
    
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Change password
export const changePassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    await updatePassword(user, newPassword);
    
    // Update timestamp in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete user account
export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', user.uid));
    
    // Delete user account
    await deleteUser(user);
    
    return { success: true };
  } catch (error) {
    console.error('Delete account error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Check if user is admin
export const isUserAdmin = async (uid = null) => {
  try {
    const userId = uid || auth.currentUser?.uid;
    if (!userId) return false;
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return userData.role === 'admin' || userData.role === 'super_admin';
  } catch (error) {
    console.error('Check admin error:', error);
    return false;
  }
};

// Send email verification
export const sendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    console.error('Send verification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
