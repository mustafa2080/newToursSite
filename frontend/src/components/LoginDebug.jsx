import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const LoginDebug = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  const addDebugInfo = (step, success, message, data = null) => {
    setDebugInfo(prev => [...prev, { 
      step, 
      success, 
      message, 
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const debugLogin = async () => {
    setLoading(true);
    setDebugInfo([]);
    
    try {
      addDebugInfo('Start', true, `Attempting login for: ${email}`);
      
      // Step 1: Try Firebase Authentication
      addDebugInfo('Auth', null, 'Attempting Firebase Authentication...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      addDebugInfo('Auth', true, 'Firebase Authentication successful', {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      });
      
      // Step 2: Check Firestore document
      addDebugInfo('Firestore', null, 'Checking user document in Firestore...');
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        addDebugInfo('Firestore', false, 'User document not found in Firestore', {
          collection: 'users',
          documentId: user.uid
        });
        return;
      }
      
      const userData = userDoc.data();
      addDebugInfo('Firestore', true, 'User document found', userData);
      
      // Step 3: Check if user is active
      if (!userData.isActive) {
        addDebugInfo('Validation', false, 'User account is deactivated', {
          isActive: userData.isActive
        });
        return;
      }
      
      addDebugInfo('Validation', true, 'User account is active');
      addDebugInfo('Success', true, 'Login should be successful!');
      
    } catch (error) {
      addDebugInfo('Error', false, error.message, {
        code: error.code,
        fullError: error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🔍 Login Debug Tool</h2>
      
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter email to test"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter password to test"
          />
        </div>
        
        <button
          onClick={debugLogin}
          disabled={loading || !email || !password}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Debug Login'}
        </button>
      </div>
      
      {debugInfo.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Debug Results:</h3>
          {debugInfo.map((info, index) => (
            <div key={index} className={`p-3 rounded border-l-4 ${
              info.success === true ? 'bg-green-50 border-green-500' :
              info.success === false ? 'bg-red-50 border-red-500' :
              'bg-yellow-50 border-yellow-500'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <strong>{info.step}:</strong> {info.message}
                  <span className="text-xs text-gray-500 ml-2">{info.timestamp}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  info.success === true ? 'bg-green-200 text-green-800' :
                  info.success === false ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {info.success === true ? '✅' : info.success === false ? '❌' : '⏳'}
                </span>
              </div>
              
              {info.data && (
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(info.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter the email and password of an existing user</li>
          <li>Click "Debug Login" to see detailed step-by-step process</li>
          <li>Check where exactly the login process fails</li>
          <li>Use this information to fix the issue</li>
        </ol>
      </div>
    </div>
  );
};

export default LoginDebug;
