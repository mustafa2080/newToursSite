import { auth, db } from '../config/firebase';

// Check Firebase configuration status
export const checkFirebaseSetup = async () => {
  const status = {
    auth: false,
    firestore: false,
    authEnabled: false,
    errors: [],
    warnings: [],
  };

  try {
    // Check Auth initialization
    if (auth && auth.app) {
      status.auth = true;
      console.log('✅ Firebase Auth is initialized');
      
      // Check if auth is actually working
      try {
        await auth.authStateReady();
        status.authEnabled = true;
        console.log('✅ Firebase Auth is working');
      } catch (authError) {
        status.errors.push('Firebase Auth is initialized but not working: ' + authError.message);
        status.warnings.push('Please check if Authentication is enabled in Firebase Console');
      }
    } else {
      status.errors.push('Firebase Auth is not properly initialized');
    }

    // Check Firestore initialization
    if (db) {
      status.firestore = true;
      console.log('✅ Firestore is initialized');
    } else {
      status.errors.push('Firestore is not properly initialized');
    }

  } catch (error) {
    status.errors.push('Firebase setup check failed: ' + error.message);
  }

  return status;
};

// Get Firebase setup instructions
export const getFirebaseSetupInstructions = () => {
  return {
    title: '🔥 Firebase Setup Instructions',
    steps: [
      {
        step: 1,
        title: 'Go to Firebase Console',
        description: 'Visit https://console.firebase.google.com',
        action: 'Open Firebase Console'
      },
      {
        step: 2,
        title: 'Select Your Project',
        description: 'Choose the "tours-52d78" project',
        action: 'Select Project'
      },
      {
        step: 3,
        title: 'Enable Authentication',
        description: 'Go to Authentication > Sign-in method',
        action: 'Navigate to Authentication'
      },
      {
        step: 4,
        title: 'Enable Email/Password',
        description: 'Enable Email/Password authentication provider',
        action: 'Enable Provider'
      },
      {
        step: 5,
        title: 'Save Settings',
        description: 'Save the authentication settings',
        action: 'Save Configuration'
      },
      {
        step: 6,
        title: 'Refresh Application',
        description: 'Refresh this page and try again',
        action: 'Refresh Page'
      }
    ],
    troubleshooting: [
      {
        issue: 'Project not found',
        solution: 'Make sure you\'re logged in with the correct Google account'
      },
      {
        issue: 'Authentication tab missing',
        solution: 'Ensure you have proper permissions for the Firebase project'
      },
      {
        issue: 'Still not working',
        solution: 'Check browser console for detailed error messages'
      }
    ]
  };
};

// Check if user can create admin accounts
export const canCreateAdmin = async () => {
  const status = await checkFirebaseSetup();
  return status.auth && status.authEnabled && status.firestore;
};

// Get user-friendly error message
export const getFirebaseErrorMessage = (error) => {
  const errorCode = error.code || '';
  const errorMessage = error.message || '';

  // Common Firebase Auth errors
  const errorMap = {
    'auth/configuration-not-found': {
      title: 'Firebase Authentication Not Configured',
      message: 'Authentication is not enabled in your Firebase project.',
      action: 'Enable Authentication in Firebase Console'
    },
    'auth/invalid-api-key': {
      title: 'Invalid API Key',
      message: 'The Firebase API key is invalid or missing.',
      action: 'Check your Firebase configuration'
    },
    'auth/network-request-failed': {
      title: 'Network Error',
      message: 'Unable to connect to Firebase services.',
      action: 'Check your internet connection'
    },
    'auth/email-already-in-use': {
      title: 'Email Already Registered',
      message: 'An account with this email already exists.',
      action: 'Use a different email or login instead'
    },
    'auth/weak-password': {
      title: 'Weak Password',
      message: 'Password should be at least 6 characters.',
      action: 'Choose a stronger password'
    },
    'auth/invalid-email': {
      title: 'Invalid Email',
      message: 'The email address is not valid.',
      action: 'Enter a valid email address'
    }
  };

  // Return mapped error or default
  if (errorMap[errorCode]) {
    return errorMap[errorCode];
  }

  // Default error handling
  return {
    title: 'Firebase Error',
    message: errorMessage || 'An unknown error occurred',
    action: 'Please try again or check the console for details'
  };
};

export default {
  checkFirebaseSetup,
  getFirebaseSetupInstructions,
  canCreateAdmin,
  getFirebaseErrorMessage
};
