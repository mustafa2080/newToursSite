// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7J92Y83_7OIXHY3RBcNNmG3TTi8CNnuE",
  authDomain: "tours-52d78.firebaseapp.com",
  projectId: "tours-52d78",
  storageBucket: "tours-52d78.firebasestorage.app",
  messagingSenderId: "442131342279",
  appId: "1:442131342279:web:f0d7b0fafd88bf98f22fe2",
  measurementId: "G-7R5HYZ455N"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized in service worker');
} catch (error) {
  console.error('❌ Firebase initialization failed in service worker:', error);
}

// Initialize Firebase Messaging
let messaging;
try {
  messaging = firebase.messaging();
  console.log('✅ Firebase Messaging initialized in service worker');
} catch (error) {
  console.error('❌ Firebase Messaging initialization failed in service worker:', error);
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

  const { notification, data } = payload;
  
  const notificationTitle = notification?.title || 'New Notification';
  const notificationOptions = {
    body: notification?.body || '',
    icon: notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: data?.type || 'general',
    data: data || {},
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn('Firebase Messaging not available in service worker');
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const { action, data } = event;
  
  if (action === 'view' || !action) {
    // Open the app or navigate to specific page
    const urlToOpen = data?.url || '/admin/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
