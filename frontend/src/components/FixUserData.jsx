import React, { useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const FixUserData = () => {
  const [email, setEmail] = useState('mustafa@gmail.com');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fixUserData = async () => {
    try {
      setStatus('🔄 Signing in...');
      
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      setStatus('✅ Signed in successfully. Checking Firestore...');
      
      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setStatus('✅ User document already exists in Firestore');
        return;
      }
      
      setStatus('🔄 Creating user document in Firestore...');
      
      // Create user document
      const userData = {
        uid: user.uid,
        email: user.email,
        firstName: email.split('@')[0], // Use email prefix as first name
        lastName: 'User',
        role: 'admin', // Make them admin
        isActive: true,
        emailVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, userData);
      
      setStatus('✅ User document created successfully! You can now use the login page.');
      
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  const checkUserData = async () => {
    if (!currentUser) {
      setStatus('❌ No user is currently signed in');
      return;
    }
    
    try {
      setStatus('🔄 Checking user data...');
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStatus(`✅ User data found: ${JSON.stringify(userData, null, 2)}`);
      } else {
        setStatus('❌ User document not found in Firestore');
      }
    } catch (error) {
      setStatus(`❌ Error checking user data: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🔧 Fix User Data</h2>
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <strong>Current User:</strong> {currentUser ? currentUser.email : 'Not signed in'}
      </div>
      
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter password"
          />
        </div>
        
        <div className="space-x-4">
          <button
            onClick={fixUserData}
            disabled={!email || !password}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Fix User Data
          </button>
          
          <button
            onClick={checkUserData}
            disabled={!currentUser}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Check Current User Data
          </button>
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Status:</strong>
        <pre className="mt-2 whitespace-pre-wrap">{status}</pre>
      </div>
      
      <div className="p-4 bg-yellow-50 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter the email and password of the user that has login issues</li>
          <li>Click "Fix User Data" to sign in and create missing Firestore document</li>
          <li>Once fixed, go to <a href="/login" className="text-blue-600 underline">/login</a> and try logging in normally</li>
          <li>The user will be created as an admin with full access</li>
        </ol>
      </div>
    </div>
  );
};

export default FixUserData;
