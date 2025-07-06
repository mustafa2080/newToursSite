// Test success message functionality
export const testSuccessMessage = () => {
  console.log('✅ Testing success message display...');
  
  // Create a test success message
  const testMessage = 'Trip updated successfully!';
  
  // Find the page container
  const pageContainer = document.querySelector('.space-y-6') || document.body;
  
  // Create success message element
  const successDiv = document.createElement('div');
  successDiv.className = 'bg-green-50 border border-green-200 rounded-md p-4 mb-4';
  successDiv.style.animation = 'fadeIn 0.3s ease-in-out';
  
  successDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h3 class="text-sm font-medium text-green-800">Success!</h3>
        <p class="text-sm text-green-700 mt-1">${testMessage}</p>
      </div>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  // Insert at the top of the page
  pageContainer.insertBefore(successDiv, pageContainer.firstChild);
  
  console.log('✅ Test success message displayed');
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    successDiv.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 300);
  }, 5000);
  
  // Add fadeOut animation
  style.textContent += `
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-10px); }
    }
  `;
  
  alert('✅ Test success message displayed! It will disappear in 5 seconds.');
};

// Test error message
export const testErrorMessage = () => {
  console.log('❌ Testing error message display...');
  
  const testMessage = 'Test error message - this is just a test!';
  
  const pageContainer = document.querySelector('.space-y-6') || document.body;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'bg-red-50 border border-red-200 rounded-md p-4 mb-4';
  errorDiv.style.animation = 'fadeIn 0.3s ease-in-out';
  
  errorDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <div>
        <h3 class="text-sm font-medium text-red-800">Error</h3>
        <p class="text-sm text-red-700 mt-1">${testMessage}</p>
      </div>
    </div>
  `;
  
  pageContainer.insertBefore(errorDiv, pageContainer.firstChild);
  
  console.log('❌ Test error message displayed');
  
  setTimeout(() => {
    errorDiv.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 300);
  }, 5000);
  
  alert('❌ Test error message displayed! It will disappear in 5 seconds.');
};

// Test actual trip update with success message
export const testTripUpdateWithMessage = async () => {
  console.log('🧪 Testing trip update with success message...');
  
  try {
    // Get current URL to determine trip ID
    const urlParts = window.location.pathname.split('/');
    const editIndex = urlParts.indexOf('edit');
    
    if (editIndex === -1) {
      alert('❌ Please navigate to a trip edit page first');
      return;
    }
    
    const tripId = urlParts[editIndex - 1];
    console.log('🆔 Trip ID:', tripId);
    
    // Get current trip data
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripDocRef);
    
    if (!tripDoc.exists()) {
      alert('❌ Trip not found');
      return;
    }
    
    const tripData = tripDoc.data();
    console.log('📋 Current trip data:', tripData);
    
    // Make a small test update
    const testUpdate = {
      ...tripData,
      updatedAt: new Date(),
      testField: `Test update at ${new Date().toISOString()}`
    };
    
    console.log('🔄 Performing test update...');
    await updateDoc(tripDocRef, testUpdate);
    
    console.log('✅ Test update successful!');
    
    // Show success message
    testSuccessMessage();
    
    // Clean up test field after 3 seconds
    setTimeout(async () => {
      const cleanupData = { ...testUpdate };
      delete cleanupData.testField;
      await updateDoc(tripDocRef, cleanupData);
      console.log('🧹 Test field cleaned up');
    }, 3000);
    
  } catch (error) {
    console.error('❌ Test update failed:', error);
    testErrorMessage();
  }
};

// Check if success/error messages are working in current page
export const checkMessageSystem = () => {
  console.log('🔍 Checking message system on current page...');
  
  // Check if we're on an edit page
  const isEditPage = window.location.pathname.includes('/edit');
  
  if (!isEditPage) {
    console.log('⚠️ Not on an edit page');
    alert('Please navigate to an edit page to test the message system');
    return;
  }
  
  // Check for existing success/error message containers
  const successMessages = document.querySelectorAll('.bg-green-50');
  const errorMessages = document.querySelectorAll('.bg-red-50');
  
  console.log('📊 Message system check:');
  console.log('  Success message containers found:', successMessages.length);
  console.log('  Error message containers found:', errorMessages.length);
  
  // Check for form
  const form = document.querySelector('form');
  console.log('  Form found:', !!form);
  
  // Check for submit button
  const submitButton = document.querySelector('button[type="submit"]');
  console.log('  Submit button found:', !!submitButton);
  
  if (form && submitButton) {
    console.log('✅ Message system components are present');
    
    // Test both message types
    console.log('🧪 Testing message display...');
    testSuccessMessage();
    
    setTimeout(() => {
      testErrorMessage();
    }, 2000);
    
  } else {
    console.log('❌ Message system components missing');
    alert('❌ Form or submit button not found on this page');
  }
};

// Force show success message for current trip update
export const forceShowSuccessMessage = () => {
  console.log('🎯 Forcing success message display...');
  
  // Remove any existing messages
  const existingMessages = document.querySelectorAll('.bg-green-50, .bg-red-50');
  existingMessages.forEach(msg => msg.remove());
  
  // Show success message
  testSuccessMessage();
  
  console.log('✅ Success message forced to display');
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.testSuccessMessage = testSuccessMessage;
  window.testErrorMessage = testErrorMessage;
  window.testTripUpdateWithMessage = testTripUpdateWithMessage;
  window.checkMessageSystem = checkMessageSystem;
  window.forceShowSuccessMessage = forceShowSuccessMessage;
  
  console.log('✅ Success message test functions available:');
  console.log('   - testSuccessMessage() - Show test success message');
  console.log('   - testErrorMessage() - Show test error message');
  console.log('   - testTripUpdateWithMessage() - Test actual update with message');
  console.log('   - checkMessageSystem() - Check message system on current page');
  console.log('   - forceShowSuccessMessage() - Force show success message');
}
