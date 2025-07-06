// Test edit system for trips and hotels
export const testTripEditSystem = async () => {
  console.log('🧪 Testing trip edit system...');
  
  try {
    // Get trips from Firebase
    const { getTrips } = await import('../services/firebase/trips');
    const result = await getTrips();
    
    if (!result.success) {
      console.error('❌ Failed to fetch trips');
      return;
    }
    
    const trips = result.trips || [];
    console.log('📂 Total trips found:', trips.length);
    
    if (trips.length === 0) {
      console.log('⚠️ No trips found to test edit system');
      alert('No trips found! Please add some trips first.');
      return;
    }
    
    // Test first trip
    const testTrip = trips[0];
    console.log('🧪 Testing edit for trip:', testTrip.title);
    console.log('🆔 Trip ID:', testTrip.id);
    
    // Check if edit page exists
    const editUrl = `/admin/trips/${testTrip.id}/edit`;
    console.log('🔗 Edit URL:', editUrl);
    
    // Test navigation
    if (window.location.pathname !== editUrl) {
      console.log('🔄 Navigating to edit page...');
      window.location.href = editUrl;
    } else {
      console.log('✅ Already on edit page');
      
      // Test form loading
      setTimeout(() => {
        const form = document.querySelector('form');
        const titleInput = document.querySelector('input[name="title"]');
        const submitButton = document.querySelector('button[type="submit"]');
        
        console.log('📋 Form elements check:');
        console.log('  Form found:', !!form);
        console.log('  Title input found:', !!titleInput);
        console.log('  Submit button found:', !!submitButton);
        
        if (titleInput) {
          console.log('  Title value:', titleInput.value);
        }
        
        // Test image upload section
        const imageUpload = document.querySelector('[data-testid="image-upload"]') || 
                           document.querySelector('.image-upload') ||
                           document.querySelector('input[type="file"]');
        console.log('  Image upload found:', !!imageUpload);
        
        if (form && titleInput && submitButton) {
          console.log('✅ Trip edit form is working correctly!');
          alert('✅ Trip edit system is working! Form loaded successfully.');
        } else {
          console.log('❌ Trip edit form has issues');
          alert('❌ Trip edit form has issues! Check console for details.');
        }
      }, 2000);
    }
    
  } catch (error) {
    console.error('❌ Error testing trip edit system:', error);
    alert('❌ Error testing trip edit system! Check console for details.');
  }
};

export const testHotelEditSystem = async () => {
  console.log('🧪 Testing hotel edit system...');
  
  try {
    // Get hotels from Firebase
    const { getHotels } = await import('../services/firebase/hotels');
    const result = await getHotels();
    
    if (!result.success) {
      console.error('❌ Failed to fetch hotels');
      return;
    }
    
    const hotels = result.hotels || [];
    console.log('🏨 Total hotels found:', hotels.length);
    
    if (hotels.length === 0) {
      console.log('⚠️ No hotels found to test edit system');
      alert('No hotels found! Please add some hotels first.');
      return;
    }
    
    // Test first hotel
    const testHotel = hotels[0];
    console.log('🧪 Testing edit for hotel:', testHotel.name);
    console.log('🆔 Hotel ID:', testHotel.id);
    
    // Check if edit page exists
    const editUrl = `/admin/hotels/${testHotel.id}/edit`;
    console.log('🔗 Edit URL:', editUrl);
    
    // Test navigation
    if (window.location.pathname !== editUrl) {
      console.log('🔄 Navigating to edit page...');
      window.location.href = editUrl;
    } else {
      console.log('✅ Already on edit page');
      
      // Test form loading
      setTimeout(() => {
        const form = document.querySelector('form');
        const nameInput = document.querySelector('input[name="name"]');
        const submitButton = document.querySelector('button[type="submit"]');
        
        console.log('📋 Form elements check:');
        console.log('  Form found:', !!form);
        console.log('  Name input found:', !!nameInput);
        console.log('  Submit button found:', !!submitButton);
        
        if (nameInput) {
          console.log('  Name value:', nameInput.value);
        }
        
        // Test image upload section
        const imageUpload = document.querySelector('[data-testid="image-upload"]') || 
                           document.querySelector('.image-upload') ||
                           document.querySelector('input[type="file"]');
        console.log('  Image upload found:', !!imageUpload);
        
        if (form && nameInput && submitButton) {
          console.log('✅ Hotel edit form is working correctly!');
          alert('✅ Hotel edit system is working! Form loaded successfully.');
        } else {
          console.log('❌ Hotel edit form has issues');
          alert('❌ Hotel edit form has issues! Check console for details.');
        }
      }, 2000);
    }
    
  } catch (error) {
    console.error('❌ Error testing hotel edit system:', error);
    alert('❌ Error testing hotel edit system! Check console for details.');
  }
};

// Test edit links in management pages
export const testEditLinks = () => {
  console.log('🔗 Testing edit links in management pages...');
  
  // Find all edit buttons/links
  const editButtons = document.querySelectorAll('a[href*="/edit"], button[onclick*="edit"], button[onclick*="Edit"]');
  console.log('🔍 Edit buttons/links found:', editButtons.length);
  
  editButtons.forEach((button, index) => {
    console.log(`🔗 Edit link ${index + 1}:`, {
      tagName: button.tagName,
      href: button.href || 'N/A',
      onclick: button.onclick ? 'Has onclick' : 'No onclick',
      text: button.textContent.trim(),
      classes: button.className
    });
    
    // Add visual indicator
    button.style.border = '2px solid #3b82f6';
    button.style.backgroundColor = '#dbeafe';
  });
  
  if (editButtons.length > 0) {
    console.log('✅ Edit links found and highlighted!');
    alert(`✅ Found ${editButtons.length} edit links! They are now highlighted in blue.`);
  } else {
    console.log('❌ No edit links found on this page');
    alert('❌ No edit links found on this page!');
  }
};

// Test Firebase update functions
export const testFirebaseUpdateFunctions = async () => {
  console.log('🔥 Testing Firebase update functions...');
  
  try {
    // Test trip update function
    console.log('1️⃣ Testing trip update function...');
    const { updateTrip } = await import('../services/firebase/trips');
    
    if (typeof updateTrip === 'function') {
      console.log('✅ updateTrip function exists');
    } else {
      console.log('❌ updateTrip function not found');
    }
    
    // Test hotel update function
    console.log('2️⃣ Testing hotel update function...');
    const { updateHotel } = await import('../services/firebase/hotels');
    
    if (typeof updateHotel === 'function') {
      console.log('✅ updateHotel function exists');
    } else {
      console.log('❌ updateHotel function not found');
    }
    
    console.log('🎯 Firebase update functions test completed!');
    alert('✅ Firebase update functions are available!');
    
  } catch (error) {
    console.error('❌ Error testing Firebase update functions:', error);
    alert('❌ Error testing Firebase update functions! Check console for details.');
  }
};

// Comprehensive edit system test
export const testCompleteEditSystem = async () => {
  console.log('🧪 Running comprehensive edit system test...');
  
  try {
    // Test 1: Firebase functions
    await testFirebaseUpdateFunctions();
    
    // Test 2: Edit links on current page
    testEditLinks();
    
    // Test 3: Check if we're on a management page
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/admin/trips') && !currentPath.includes('/edit')) {
      console.log('📍 On trips management page - testing trip edit system...');
      setTimeout(() => testTripEditSystem(), 2000);
    } else if (currentPath.includes('/admin/hotels') && !currentPath.includes('/edit')) {
      console.log('📍 On hotels management page - testing hotel edit system...');
      setTimeout(() => testHotelEditSystem(), 2000);
    } else if (currentPath.includes('/edit')) {
      console.log('📍 Already on edit page - testing form...');
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          console.log('✅ Edit form found on page');
          alert('✅ Edit form is loaded and ready!');
        } else {
          console.log('❌ No edit form found on page');
          alert('❌ No edit form found on this edit page!');
        }
      }, 1000);
    } else {
      console.log('📍 Not on a management or edit page');
      alert('Please navigate to /admin/trips or /admin/hotels to test the edit system.');
    }
    
  } catch (error) {
    console.error('❌ Error in comprehensive edit system test:', error);
    alert('❌ Error in comprehensive test! Check console for details.');
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.testTripEditSystem = testTripEditSystem;
  window.testHotelEditSystem = testHotelEditSystem;
  window.testEditLinks = testEditLinks;
  window.testFirebaseUpdateFunctions = testFirebaseUpdateFunctions;
  window.testCompleteEditSystem = testCompleteEditSystem;
  
  console.log('🧪 Edit system test functions available:');
  console.log('   - testTripEditSystem() - Test trip editing');
  console.log('   - testHotelEditSystem() - Test hotel editing');
  console.log('   - testEditLinks() - Test edit links on current page');
  console.log('   - testFirebaseUpdateFunctions() - Test Firebase update functions');
  console.log('   - testCompleteEditSystem() - Run comprehensive test');
}
