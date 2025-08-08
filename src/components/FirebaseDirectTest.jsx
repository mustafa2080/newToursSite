import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const FirebaseDirectTest = () => {
  const [status, setStatus] = useState('');
  const [authState, setAuthState] = useState(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user);
      if (user) {
        addResult('Auth State', true, `User logged in: ${user.email}`);
      } else {
        addResult('Auth State', true, 'No user logged in');
      }
    });

    return () => unsubscribe();
  }, []);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { 
      test, 
      success, 
      message, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testCreateUser = async () => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = '123456';
    
    try {
      setStatus(`Creating user: ${testEmail}...`);
      
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      
      addResult('Create User', true, `User created: ${user.email} (UID: ${user.uid})`);
      setStatus(`✅ User created successfully: ${testEmail}`);
      
      return { email: testEmail, password: testPassword, uid: user.uid };
    } catch (error) {
      addResult('Create User', false, `Error: ${error.message} (Code: ${error.code})`);
      setStatus(`❌ Failed to create user: ${error.message}`);
      return null;
    }
  };

  const testSignIn = async (email, password) => {
    try {
      setStatus(`Signing in: ${email}...`);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      addResult('Sign In', true, `Signed in: ${user.email} (UID: ${user.uid})`);
      setStatus(`✅ Signed in successfully: ${email}`);
      
      return user;
    } catch (error) {
      addResult('Sign In', false, `Error: ${error.message} (Code: ${error.code})`);
      setStatus(`❌ Failed to sign in: ${error.message}`);
      return null;
    }
  };

  const runFullTest = async () => {
    setTestResults([]);
    setStatus('Starting full Firebase test...');
    
    // Test 1: Check Firebase config
    addResult('Config', !!auth, auth ? 'Firebase Auth initialized' : 'Firebase Auth failed');
    
    // Test 2: Create a new user
    const newUser = await testCreateUser();
    
    if (newUser) {
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 3: Try to sign in with the new user
      await testSignIn(newUser.email, newUser.password);
    }
    
    setStatus('Full test completed');
  };

  const testExistingUser = async () => {
    const email = document.getElementById('existing-email').value;
    const password = document.getElementById('existing-password').value;
    
    if (!email || !password) {
      setStatus('Please enter email and password');
      return;
    }
    
    await testSignIn(email, password);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🔥 Firebase Direct Test</h2>
      
      <div className="mb-6 space-y-4">
        <button
          onClick={runFullTest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
        >
          Run Full Test (Create + Login)
        </button>
        
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">Test Existing User:</h3>
          <div className="space-y-2">
            <input
              id="existing-email"
              type="email"
              placeholder="Enter existing email"
              className="w-full p-2 border rounded"
            />
            <input
              id="existing-password"
              type="password"
              placeholder="Enter password"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={testExistingUser}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Existing User Login
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Status:</strong> {status}
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <strong>Current Auth State:</strong> {
          authState ? `Logged in as: ${authState.email}` : 'Not logged in'
        }
      </div>
      
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Test Results:</h3>
          {testResults.map((result, index) => (
            <div key={index} className={`p-3 rounded ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <strong>{result.test}:</strong> {result.message}
              <span className="text-xs text-gray-600 ml-2">{result.timestamp}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h3 className="font-bold mb-2">Firebase Configuration:</h3>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify({
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '***' : 'Not set',
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            currentUser: authState ? authState.email : 'None'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FirebaseDirectTest;
