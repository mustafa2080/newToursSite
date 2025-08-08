# 🔥 Firebase Setup Guide

This guide will help you set up Firebase for the Tours project.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Firebase CLI** installed globally
4. **Google account** for Firebase

## 🚀 Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## 🔧 Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `tours-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Wait for project creation

## ⚙️ Step 3: Enable Firebase Services

### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. (Optional) Enable other providers like Google, Facebook

### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll update rules later)
4. Select your preferred location

### Storage
1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select same location as Firestore

### Hosting (Optional)
1. Go to **Hosting**
2. Click **Get started**
3. Follow the setup wizard

## 🔑 Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Add app** > **Web app** (</> icon)
4. Enter app nickname: `tours-frontend`
5. Check **Also set up Firebase Hosting**
6. Copy the configuration object

## 📝 Step 5: Update Environment Variables

1. Open `frontend/.env`
2. Replace the Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Emulator (Development)
VITE_USE_FIREBASE_EMULATOR=false
```

## 🔐 Step 6: Deploy Security Rules

### Login to Firebase
```bash
firebase login
```

### Initialize Firebase in your project
```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Storage
- ✅ Hosting (optional)

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Rules
```bash
firebase deploy --only storage
```

### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

## 👤 Step 7: Create Admin User

1. Run the frontend application:
```bash
cd frontend
npm run dev
```

2. Navigate to `/admin/register`
3. Use the secret key: `TOURS_ADMIN_2024_SECRET`
4. Create your admin account

## 🧪 Step 8: Development with Emulators (Optional)

### Install Emulator Suite
```bash
firebase init emulators
```

Select:
- ✅ Authentication Emulator
- ✅ Firestore Emulator
- ✅ Storage Emulator

### Start Emulators
```bash
firebase emulators:start
```

### Update Environment for Emulators
```env
VITE_USE_FIREBASE_EMULATOR=true
```

## 📊 Step 9: Seed Sample Data (Optional)

You can add sample data through the admin panel or use the Firebase console:

### Sample Trip Data
```javascript
{
  title: "Amazing Beach Adventure",
  description: "Discover pristine beaches and crystal clear waters",
  price: 299,
  durationDays: 5,
  maxParticipants: 20,
  difficultyLevel: "easy",
  categoryId: "beach",
  status: "active",
  featured: true,
  mainImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  gallery: [],
  itinerary: [],
  includedServices: ["Accommodation", "Meals", "Transportation"],
  excludedServices: ["Personal expenses", "Travel insurance"]
}
```

### Sample Hotel Data
```javascript
{
  name: "Luxury Beach Resort",
  description: "5-star beachfront resort with world-class amenities",
  pricePerNight: 150,
  starRating: 5,
  city: "Miami",
  address: "123 Beach Boulevard, Miami, FL",
  status: "active",
  featured: true,
  mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
  amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"],
  roomTypes: {
    "Standard Room": {
      price: 150,
      description: "Comfortable room with ocean view",
      features: ["Ocean View", "King Bed", "WiFi"]
    }
  }
}
```

## 🚀 Step 10: Deploy to Production

### Build the frontend
```bash
cd frontend
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### Deploy all services
```bash
firebase deploy
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check Firestore rules
   - Ensure user is authenticated
   - Verify admin role assignment

2. **CORS Errors**
   - Check Firebase configuration
   - Verify domain is authorized in Firebase console

3. **Emulator Connection Issues**
   - Ensure emulators are running
   - Check `VITE_USE_FIREBASE_EMULATOR` setting
   - Clear browser cache

### Useful Commands

```bash
# Check Firebase projects
firebase projects:list

# Switch Firebase project
firebase use your-project-id

# View Firestore data
firebase firestore:delete --all-collections --force

# Export Firestore data
firebase firestore:export gs://your-bucket/exports

# Import Firestore data
firebase firestore:import gs://your-bucket/exports
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Security](https://firebase.google.com/docs/storage/security)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

## 🎉 You're All Set!

Your Firebase backend is now ready! You can:

1. ✅ Register and authenticate users
2. ✅ Store trips and hotels data
3. ✅ Manage reviews and bookings
4. ✅ Upload and serve images
5. ✅ Use the admin panel
6. ✅ Deploy to production

Happy coding! 🚀
