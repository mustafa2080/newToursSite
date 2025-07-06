import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing Firebase connection...');
  const [testResults, setTestResults] = useState([]);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message }]);
  };

  const testFirebaseConnection = async () => {
    try {
      // Test 1: Check Firebase Auth
      addResult('Firebase Auth', !!auth, auth ? 'Auth initialized' : 'Auth failed');
      
      // Test 2: Check Firestore
      addResult('Firestore', !!db, db ? 'Firestore initialized' : 'Firestore failed');
      
      // Test 3: Try to create a test user
      const testEmail = 'test@example.com';
      const testPassword = 'testpassword123';
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        addResult('Create User', true, 'Test user created successfully');
        
        // Test 4: Try to create user document
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: testEmail,
            createdAt: new Date(),
            isTest: true
          });
          addResult('Firestore Write', true, 'User document created');
        } catch (error) {
          addResult('Firestore Write', false, error.message);
        }
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          // Try to sign in instead
          try {
            await signInWithEmailAndPassword(auth, testEmail, testPassword);
            addResult('Sign In', true, 'Test user signed in successfully');
          } catch (signInError) {
            addResult('Sign In', false, signInError.message);
          }
        } else {
          addResult('Create User', false, error.message);
        }
      }
      
      setStatus('Firebase tests completed');
    } catch (error) {
      addResult('General', false, error.message);
      setStatus('Firebase tests failed');
    }
  };

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Firebase Connection Test</h2>
      <p className="mb-4 text-gray-600">{status}</p>
      
      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div key={index} className={`p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <strong>{result.test}:</strong> {result.message}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Firebase Configuration:</h3>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify({
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '***' : 'Not set',
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FirebaseTest;
