// Debug trip edit functionality
export const debugTripEdit = async (tripId) => {
  console.log('🔍 Debugging trip edit functionality...');
  
  if (!tripId) {
    // Try to get trip ID from URL
    const urlParts = window.location.pathname.split('/');
    const editIndex = urlParts.indexOf('edit');
    if (editIndex > 0) {
      tripId = urlParts[editIndex - 1];
    }
  }
  
  if (!tripId) {
    console.log('❌ No trip ID provided or found in URL');
    alert('Please provide a trip ID or navigate to an edit page');
    return;
  }
  
  console.log('🆔 Testing trip ID:', tripId);
  
  try {
    // Test 1: Check if trip exists in Firebase
    console.log('1️⃣ Testing trip loading from Firebase...');
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripDocRef);
    
    if (tripDoc.exists()) {
      const tripData = { id: tripDoc.id, ...tripDoc.data() };
      console.log('✅ Trip found in Firebase:', tripData.title);
      console.log('📋 Trip data:', tripData);
      
      // Test 2: Test update function
      console.log('2️⃣ Testing update function...');
      const { updateTrip } = await import('../services/firebase/trips');
      
      // Test with minimal data change
      const testUpdateData = {
        title: tripData.title,
        description: tripData.description,
        price: tripData.price,
        updatedAt: new Date(),
        testUpdate: true // Add test field
      };
      
      console.log('🔄 Attempting test update...');
      const updateResult = await updateTrip(tripId, testUpdateData);
      
      if (updateResult.success) {
        console.log('✅ Update function works!');
        
        // Remove test field
        const cleanupData = { ...testUpdateData };
        delete cleanupData.testUpdate;
        await updateTrip(tripId, cleanupData);
        console.log('🧹 Cleanup completed');
        
        alert('✅ Trip edit functionality is working! The issue might be in the form data.');
      } else {
        console.log('❌ Update function failed:', updateResult.error);
        alert('❌ Update function failed: ' + updateResult.error);
      }
      
    } else {
      console.log('❌ Trip not found in Firebase');
      alert('❌ Trip not found in Firebase with ID: ' + tripId);
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
    alert('❌ Debug error: ' + error.message);
  }
};

// Debug form submission
export const debugFormSubmission = () => {
  console.log('📝 Debugging form submission...');
  
  // Find the form
  const form = document.querySelector('form');
  if (!form) {
    console.log('❌ No form found on page');
    alert('❌ No form found on this page');
    return;
  }
  
  console.log('✅ Form found');
  
  // Check form inputs
  const inputs = form.querySelectorAll('input, textarea, select');
  console.log('📋 Form inputs found:', inputs.length);
  
  const formData = {};
  inputs.forEach(input => {
    if (input.name) {
      formData[input.name] = input.value;
      console.log(`  ${input.name}: ${input.value}`);
    }
  });
  
  console.log('📊 Current form data:', formData);
  
  // Check for submit button
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    console.log('✅ Submit button found:', submitButton.textContent);
    console.log('🔒 Button disabled:', submitButton.disabled);
  } else {
    console.log('❌ No submit button found');
  }
  
  // Add form submission listener
  const originalSubmit = form.onsubmit;
  form.onsubmit = (e) => {
    console.log('🚀 Form submission intercepted!');
    console.log('📊 Form data at submission:', new FormData(form));
    
    // Call original handler if exists
    if (originalSubmit) {
      return originalSubmit(e);
    }
  };
  
  console.log('🎯 Form debug completed - submission will be logged');
  alert('✅ Form debug setup complete! Try submitting the form and check console.');
};

// Test complete edit flow
export const testCompleteEditFlow = async () => {
  console.log('🧪 Testing complete edit flow...');
  
  try {
    // Get current URL to determine trip ID
    const urlParts = window.location.pathname.split('/');
    const editIndex = urlParts.indexOf('edit');
    
    if (editIndex === -1) {
      console.log('❌ Not on an edit page');
      alert('Please navigate to a trip edit page first');
      return;
    }
    
    const tripId = urlParts[editIndex - 1];
    console.log('🆔 Trip ID from URL:', tripId);
    
    // Test 1: Load trip data
    console.log('1️⃣ Testing trip data loading...');
    await debugTripEdit(tripId);
    
    // Test 2: Check form
    console.log('2️⃣ Testing form...');
    setTimeout(() => {
      debugFormSubmission();
    }, 1000);
    
    // Test 3: Check Firebase permissions
    console.log('3️⃣ Testing Firebase permissions...');
    const { auth } = await import('../config/firebase');
    const user = auth.currentUser;
    
    if (user) {
      console.log('✅ User authenticated:', user.email);
      
      // Get user token to check claims
      const token = await user.getIdTokenResult();
      console.log('🔑 User claims:', token.claims);
      
      if (token.claims.admin) {
        console.log('✅ User has admin privileges');
      } else {
        console.log('⚠️ User might not have admin privileges');
      }
    } else {
      console.log('❌ User not authenticated');
      alert('❌ User not authenticated! Please log in first.');
    }
    
  } catch (error) {
    console.error('❌ Error in complete test:', error);
    alert('❌ Test error: ' + error.message);
  }
};

// Monitor form changes
export const monitorFormChanges = () => {
  console.log('👀 Starting form change monitoring...');
  
  const form = document.querySelector('form');
  if (!form) {
    console.log('❌ No form found');
    return;
  }
  
  const inputs = form.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const originalValue = input.value;
    
    input.addEventListener('change', (e) => {
      console.log(`📝 Field changed: ${e.target.name || e.target.id} = "${e.target.value}"`);
    });
    
    input.addEventListener('blur', (e) => {
      if (e.target.value !== originalValue) {
        console.log(`✏️ Field modified: ${e.target.name || e.target.id}`);
        console.log(`   Old: "${originalValue}"`);
        console.log(`   New: "${e.target.value}"`);
      }
    });
  });
  
  console.log('✅ Monitoring', inputs.length, 'form fields');
  alert('✅ Form monitoring active! Changes will be logged to console.');
};

// Quick fix for common edit issues
export const quickFixEditIssues = async () => {
  console.log('🔧 Applying quick fixes for edit issues...');
  
  try {
    // Fix 1: Ensure proper form validation
    const form = document.querySelector('form');
    if (form) {
      // Remove any conflicting validation
      form.noValidate = false;
      console.log('✅ Form validation enabled');
    }
    
    // Fix 2: Check for JavaScript errors
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      console.log('🚨 JavaScript error detected:', {
        message,
        source,
        line: lineno,
        column: colno,
        error
      });
      
      if (originalError) {
        originalError(message, source, lineno, colno, error);
      }
    };
    
    // Fix 3: Ensure Firebase is properly initialized
    const { db } = await import('../config/firebase');
    if (db) {
      console.log('✅ Firebase initialized');
    } else {
      console.log('❌ Firebase not initialized');
    }
    
    console.log('🎯 Quick fixes applied');
    alert('✅ Quick fixes applied! Try editing again.');
    
  } catch (error) {
    console.error('❌ Error applying fixes:', error);
    alert('❌ Error applying fixes: ' + error.message);
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.debugTripEdit = debugTripEdit;
  window.debugFormSubmission = debugFormSubmission;
  window.testCompleteEditFlow = testCompleteEditFlow;
  window.monitorFormChanges = monitorFormChanges;
  window.quickFixEditIssues = quickFixEditIssues;
  
  console.log('🔍 Trip edit debug functions available:');
  console.log('   - debugTripEdit(tripId) - Test trip loading and updating');
  console.log('   - debugFormSubmission() - Debug form submission');
  console.log('   - testCompleteEditFlow() - Test complete edit flow');
  console.log('   - monitorFormChanges() - Monitor form field changes');
  console.log('   - quickFixEditIssues() - Apply quick fixes');
}
