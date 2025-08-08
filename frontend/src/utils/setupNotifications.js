import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Setup notifications collection and rules
export const setupNotificationsCollection = async () => {
  try {
    console.log('🔔 Setting up notifications collection...');
    
    // Create a sample notification document to initialize the collection
    const sampleNotification = {
      userId: 'sample-user-id',
      type: 'info',
      title: 'Welcome to Notifications!',
      message: 'This is a sample notification to initialize the collection.',
      createdAt: new Date(),
      read: false,
      data: {
        type: 'system'
      }
    };

    const notificationsRef = collection(db, 'notifications');
    const sampleDocRef = doc(notificationsRef, 'sample-notification');
    
    await setDoc(sampleDocRef, sampleNotification);
    
    console.log('✅ Notifications collection initialized');
    
    // Instructions for Firestore rules
    console.log(`
🔔 FIRESTORE RULES FOR NOTIFICATIONS:

Add these rules to your Firestore Security Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notifications rules
    match /notifications/{notificationId} {
      // Users can read their own notifications
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Users can update their own notifications (mark as read)
      allow update: if request.auth != null && 
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.keys().hasOnly(['read', 'readAt']) &&
                   request.resource.data.read is bool;
      
      // System can create notifications for any user
      allow create: if request.auth != null;
      
      // Users can delete their own notifications
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Other existing rules...
  }
}

📝 To apply these rules:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. Add the notifications rules to your existing rules
5. Click "Publish"
    `);
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up notifications collection:', error);
    return false;
  }
};

// Test notifications functionality
export const testNotifications = async (userId) => {
  try {
    console.log('🧪 Testing notifications for user:', userId);
    
    const testNotifications = [
      {
        userId,
        type: 'success',
        title: 'Test Success Notification',
        message: 'This is a test success notification.',
        createdAt: new Date(),
        read: false,
        data: { type: 'test' }
      },
      {
        userId,
        type: 'booking',
        title: 'Test Booking Notification',
        message: 'Your test booking has been confirmed.',
        createdAt: new Date(),
        read: false,
        data: { type: 'test', bookingId: 'test-booking-123' }
      },
      {
        userId,
        type: 'favorite',
        title: 'Test Favorite Notification',
        message: 'Test item has been added to your favorites.',
        createdAt: new Date(),
        read: false,
        data: { type: 'test', itemId: 'test-item-123' }
      }
    ];

    const notificationsRef = collection(db, 'notifications');
    
    for (const notification of testNotifications) {
      const docRef = doc(notificationsRef);
      await setDoc(docRef, notification);
      console.log('✅ Test notification created:', notification.title);
    }
    
    console.log('🎉 All test notifications created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
    return false;
  }
};

// Make functions available in console for testing
if (typeof window !== 'undefined') {
  window.setupNotificationsCollection = setupNotificationsCollection;
  window.testNotifications = testNotifications;
  
  console.log(`
🔔 NOTIFICATION SETUP FUNCTIONS AVAILABLE:

1. Setup notifications collection:
   setupNotificationsCollection()

2. Test notifications for a user:
   testNotifications('your-user-id')

3. Example usage:
   setupNotificationsCollection().then(() => {
     testNotifications('your-user-id');
   });
  `);
}
