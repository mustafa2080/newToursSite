import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChange,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUserData,
  updateUserProfile,
  isUserAdmin,
  resetPassword,
  changePassword,
} from '../services/firebase/auth';
import { notificationService } from '../services/notificationService';

// Create context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChange(async (firebaseUser) => {
        console.log('🔄 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
        setIsLoading(true);

        if (firebaseUser) {
          try {
            console.log('👤 Getting user data for:', firebaseUser.email);
            const userData = await getCurrentUserData();
            if (userData) {
              console.log('✅ User data loaded:', userData.email, 'Role:', userData.role);
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              console.log('❌ No user data found');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error('❌ Error getting user data:', error);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('👋 User logged out');
          setUser(null);
          setIsAuthenticated(false);
        }

        setIsLoading(false);
        console.log('🏁 Auth state update complete. Authenticated:', firebaseUser ? true : false);
      });
    } catch (error) {
      console.error('Auth state change listener failed:', error);
      setError('Authentication service unavailable');
      setIsLoading(false);
    }

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from auth state:', error);
      }
    };
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const result = await loginUser(credentials.email, credentials.password);

      if (result.success) {
        // User state will be updated by the auth state observer
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const result = await registerUser(userData);

      if (result.success) {
        // User state will be updated by the auth state observer

        // Create welcome notification for new user
        try {
          setTimeout(async () => {
            await notificationService.createWelcomeNotification(
              result.user.uid,
              userData.firstName || userData.displayName || userData.email
            );
          }, 2000); // Delay to ensure user context is ready
        } catch (notificationError) {
          console.error('❌ Failed to create welcome notification:', notificationError);
        }

        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      // User state will be updated by the auth state observer
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const result = await updateUserProfile(profileData);

      if (result.success) {
        // Refresh user data
        const userData = await getCurrentUserData();
        if (userData) {
          setUser(userData);
        }
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'super_admin';
  };

  const clearError = () => {
    setError(null);
  };

  const refreshAuthState = async () => {
    try {
      console.log('🔄 Manually refreshing auth state...');
      const userData = await getCurrentUserData();
      if (userData) {
        console.log('✅ Manual refresh - User data loaded:', userData.email);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('❌ Manual refresh - No user data');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Manual refresh error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const resetUserPassword = async (email) => {
    try {
      setError(null);
      const result = await resetPassword(email);

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changeUserPassword = async (newPassword) => {
    try {
      setError(null);
      const result = await changePassword(newPassword);

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    clearError,
    refreshAuthState,
    resetPassword: resetUserPassword,
    changePassword: changeUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
