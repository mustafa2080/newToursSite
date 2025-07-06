import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const QuickSetup = () => {
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([]);

  const createUser = async (email, password, firstName, lastName, role = 'user') => {
    try {
      setStatus(`Creating user: ${email}...`);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        role,
        isActive: true,
        emailVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc);
      
      setUsers(prev => [...prev, { email, password, role, status: 'Created' }]);
      setStatus(`✅ User ${email} created successfully`);
      
      return { success: true, user };
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setUsers(prev => [...prev, { email, password, role, status: 'Already exists' }]);
        setStatus(`⚠️ User ${email} already exists`);
        return { success: true, message: 'User already exists' };
      }
      
      setUsers(prev => [...prev, { email, password, role, status: `Error: ${error.message}` }]);
      setStatus(`❌ Error creating ${email}: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const testLogin = async (email, password) => {
    try {
      setStatus(`Testing login for: ${email}...`);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      setStatus(`✅ Login successful for ${email}`);
      return { success: true, user };
    } catch (error) {
      setStatus(`❌ Login failed for ${email}: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const setupUsers = async () => {
    setUsers([]);
    setStatus('Setting up users...');
    
    // Create admin user
    await createUser('admin@tours.com', 'admin123456', 'Admin', 'User', 'admin');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create test user
    await createUser('user@test.com', 'test123456', 'Test', 'User', 'user');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create another test user
    await createUser('demo@example.com', 'demo123456', 'Demo', 'User', 'user');
    
    setStatus('✅ All users setup completed!');
  };

  const testAllLogins = async () => {
    setStatus('Testing all logins...');
    
    for (const user of users) {
      if (user.status === 'Created' || user.status === 'Already exists') {
        await testLogin(user.email, user.password);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setStatus('✅ Login tests completed!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Quick Firebase Setup</h2>
      
      <div className="mb-6">
        <button
          onClick={setupUsers}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600"
        >
          Create Test Users
        </button>
        
        <button
          onClick={testAllLogins}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={users.length === 0}
        >
          Test All Logins
        </button>
      </div>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Status:</strong> {status}
      </div>
      
      {users.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Created Users:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Password</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border font-mono">{user.password}</td>
                    <td className="px-4 py-2 border">{user.role}</td>
                    <td className={`px-4 py-2 border ${
                      user.status === 'Created' ? 'text-green-600' : 
                      user.status === 'Already exists' ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {user.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Create Test Users" to set up demo accounts</li>
          <li>Click "Test All Logins" to verify they work</li>
          <li>Go to <a href="/login" className="text-blue-600 underline">/login</a> and use any of the created accounts</li>
          <li>Admin account: admin@tours.com / admin123456</li>
          <li>User accounts: user@test.com / test123456 or demo@example.com / demo123456</li>
        </ol>
      </div>
    </div>
  );
};

export default QuickSetup;
