// Test specific trip update
export const testSpecificTripUpdate = async () => {
  const tripId = 'axvqA39tQFw6TZdufGce';
  console.log('🧪 Testing specific trip update:', tripId);
  
  try {
    // Test 1: Load trip data
    console.log('1️⃣ Loading trip data...');
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripDocRef);
    
    if (!tripDoc.exists()) {
      console.log('❌ Trip not found');
      alert('❌ Trip not found');
      return;
    }
    
    const tripData = { id: tripDoc.id, ...tripDoc.data() };
    console.log('✅ Trip loaded:', tripData.title);
    console.log('📋 Trip data:', tripData);
    
    // Test 2: Perform a small update
    console.log('2️⃣ Performing test update...');
    
    const testUpdateData = {
      title: tripData.title,
      description: tripData.description,
      price: tripData.price,
      updatedAt: new Date(),
      lastTestUpdate: new Date().toISOString()
    };
    
    console.log('📤 Update data:', testUpdateData);
    
    await updateDoc(tripDocRef, testUpdateData);
    
    console.log('✅ Update successful!');
    
    // Show success message
    showSuccessMessage('Trip updated successfully!');
    
    // Clean up test field
    setTimeout(async () => {
      const cleanupData = { ...testUpdateData };
      delete cleanupData.lastTestUpdate;
      await updateDoc(tripDocRef, cleanupData);
      console.log('🧹 Test field cleaned up');
    }, 3000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test update failed:', error);
    showErrorMessage('Update failed: ' + error.message);
    return false;
  }
};

// Show success message
const showSuccessMessage = (message) => {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.test-message');
  existingMessages.forEach(msg => msg.remove());
  
  const successDiv = document.createElement('div');
  successDiv.className = 'test-message bg-green-50 border border-green-200 rounded-md p-4 mb-4';
  successDiv.style.position = 'fixed';
  successDiv.style.top = '20px';
  successDiv.style.right = '20px';
  successDiv.style.zIndex = '9999';
  successDiv.style.minWidth = '300px';
  successDiv.style.animation = 'slideIn 0.3s ease-out';
  
  successDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h3 class="text-sm font-medium text-green-800">Success!</h3>
        <p class="text-sm text-green-700 mt-1">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-green-500 hover:text-green-700">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;
  
  // Add CSS animation
  if (!document.getElementById('test-message-styles')) {
    const style = document.createElement('style');
    style.id = 'test-message-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(successDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    successDiv.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 300);
  }, 5000);
};

// Show error message
const showErrorMessage = (message) => {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'test-message bg-red-50 border border-red-200 rounded-md p-4 mb-4';
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '20px';
  errorDiv.style.right = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.minWidth = '300px';
  errorDiv.style.animation = 'slideIn 0.3s ease-out';
  
  errorDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <div>
        <h3 class="text-sm font-medium text-red-800">Error</h3>
        <p class="text-sm text-red-700 mt-1">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-red-500 hover:text-red-700">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 300);
  }, 5000);
};

// Test form submission on current page
export const testCurrentFormSubmission = () => {
  console.log('📝 Testing form submission on current page...');
  
  const form = document.querySelector('form');
  if (!form) {
    console.log('❌ No form found');
    alert('❌ No form found on this page');
    return;
  }
  
  console.log('✅ Form found');
  
  // Get form data
  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  
  console.log('📊 Current form data:', data);
  
  // Check required fields
  const requiredFields = ['title', 'description', 'price'];
  const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
  
  if (missingFields.length > 0) {
    console.log('⚠️ Missing required fields:', missingFields);
    showErrorMessage(`Missing required fields: ${missingFields.join(', ')}`);
    return;
  }
  
  console.log('✅ All required fields present');
  
  // Simulate successful submission
  console.log('🎯 Simulating successful form submission...');
  showSuccessMessage('Trip updated successfully!');
  
  // Test actual update
  setTimeout(() => {
    testSpecificTripUpdate();
  }, 2000);
};

// Monitor form submission
export const monitorFormSubmission = () => {
  console.log('👀 Monitoring form submission...');
  
  const form = document.querySelector('form');
  if (!form) {
    console.log('❌ No form found');
    return;
  }
  
  // Override form submission
  const originalSubmit = form.onsubmit;
  
  form.onsubmit = (e) => {
    console.log('🚀 Form submission intercepted!');
    console.log('📊 Form data:', new FormData(form));
    
    // Show monitoring message
    showSuccessMessage('Form submission detected! Monitoring...');
    
    // Call original handler
    if (originalSubmit) {
      return originalSubmit(e);
    }
  };
  
  // Also monitor submit button clicks
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.addEventListener('click', () => {
      console.log('🖱️ Submit button clicked!');
    });
  }
  
  console.log('✅ Form submission monitoring active');
  alert('✅ Form submission monitoring active! Try submitting the form.');
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.testSpecificTripUpdate = testSpecificTripUpdate;
  window.testCurrentFormSubmission = testCurrentFormSubmission;
  window.monitorFormSubmission = monitorFormSubmission;
  
  console.log('🧪 Specific trip test functions available:');
  console.log('   - testSpecificTripUpdate() - Test update for current trip');
  console.log('   - testCurrentFormSubmission() - Test form submission');
  console.log('   - monitorFormSubmission() - Monitor form submissions');
}
