import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import { ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  redirectTo = '/login',
  fallback = null 
}) => {
  const [user, loading, error] = useAuthState(auth);
  const { userData, loading: userDataLoading } = useFirebaseAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading || userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Checking authentication..." />
      </div>
    );
  }

  // Handle authentication errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">
            There was an error checking your authentication status.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    // Store the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if admin role is required
  if (requireAdmin && (!userData || userData.role !== 'admin')) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <LockClosedIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Admin privileges are required.
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return children;
};

// Higher-order component for easier usage
export const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific components for common use cases
export const AdminRoute = ({ children, fallback = null }) => (
  <ProtectedRoute requireAuth={true} requireAdmin={true} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const UserRoute = ({ children, redirectTo = '/login' }) => (
  <ProtectedRoute requireAuth={true} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

export const PublicRoute = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
