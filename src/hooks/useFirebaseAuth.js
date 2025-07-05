import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Load additional user data from Firestore
          await loadUserData(firebaseUser.uid);
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        // Create user document if it doesn't exist
        const newUserData = {
          uid,
          email: auth.currentUser?.email,
          firstName: '',
          lastName: '',
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', uid), newUserData);
        setUserData(newUserData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully signed in!');
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to sign in';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(result.user, {
        displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      });

      // Create user document in Firestore
      const userDocData = {
        uid: result.user.uid,
        email: result.user.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', result.user.uid), userDocData);
      setUserData(userDocData);
      
      toast.success('Account created successfully!');
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error);
      
      let errorMessage = 'Failed to create account';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setUserData(null);
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error);
      toast.error('Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setLoading(true);
      
      // Update Firebase Auth profile if needed
      const authUpdates = {};
      if (updates.firstName || updates.lastName) {
        authUpdates.displayName = `${updates.firstName || userData?.firstName || ''} ${updates.lastName || userData?.lastName || ''}`.trim();
      }
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }
      
      // Update email if changed
      if (updates.email && updates.email !== user.email) {
        await updateEmail(user, updates.email);
      }
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUserData(prev => ({ ...prev, ...updates }));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error);
      
      let errorMessage = 'Failed to update profile';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please sign in again to update your email';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setLoading(true);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Password change error:', error);
      setError(error);
      
      let errorMessage = 'Failed to update password';
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Current password is incorrect';
          break;
        case 'auth/weak-password':
          errorMessage = 'New password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error);
      
      let errorMessage = 'Failed to send reset email';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return userData?.role === 'admin';
  };

  const hasRole = (role) => {
    return userData?.role === role;
  };

  return {
    user,
    userData,
    loading,
    error,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    changePassword,
    resetPassword,
    isAdmin,
    hasRole,
    loadUserData
  };
};

export default useFirebaseAuth;
