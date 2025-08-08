# 🌍 Premium Tours Website

A modern, full-featured tours and travel website built with React and Firebase, featuring advanced admin dashboard, image compression, contact management, and real-time notifications.

## ✨ Features

### 🎯 **Core Features**
- **Modern React Frontend**: Built with React 18 and Vite for optimal performance
- **Firebase Integration**: Authentication, Firestore database, and Cloud Storage
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live notifications and updates
- **SEO Optimized**: Meta tags and structured data

### 👤 **User Features**
- **Browse & Search**: Advanced search with filters for trips and hotels
- **User Authentication**: Secure login/register system with profile management
- **Booking System**: Complete booking management with payment integration
- **Review System**: User reviews and ratings with moderation
- **Wishlist**: Save favorite trips and hotels
- **Contact System**: Contact form with admin notifications

### 🛠️ **Admin Features**
- **Comprehensive Dashboard**: Analytics, statistics, and real-time data
- **Content Management**: Full CRUD operations for trips, hotels, categories
- **Image Management**: Advanced image compression and storage system
- **Contact Messages**: Real-time contact form submissions with notifications
- **User Management**: User accounts, roles, and permissions
- **Review Moderation**: Approve, edit, or delete user reviews
- **Media Library**: Compressed image storage with gallery management

### 🚀 **Advanced Features**
- **Image Compression**: Automatic image compression to base64 for database storage
- **Real-time Notifications**: Admin notifications for new bookings, contacts, reviews
- **Search System**: Advanced search with autocomplete and filters
- **Gallery Management**: Compressed image galleries with drag-and-drop upload
- **Contact Management**: Admin dashboard for managing customer inquiries
- **Security Features**: Protected routes, input validation, and sanitization

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Heroicons** - Beautiful SVG icons

### **Backend & Database**
- **Firebase Auth** - User authentication and authorization
- **Firestore** - NoSQL database with real-time updates
- **Firebase Storage** - File storage (optional, using compressed base64)
- **Firebase Rules** - Security rules for data protection

### **Additional Libraries**
- **React Router DOM** - Client-side routing
- **React Context API** - State management
- **Custom Hooks** - Reusable logic components

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase account**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/mustafa2080/newToursSite.git
cd newToursSite
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage (optional)
   - Copy your Firebase config

4. **Configure environment variables:**
```bash
cp .env.example .env
```
Edit `.env` with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. **Deploy Firebase rules:**
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules
```

6. **Start the development server:**
```bash
npm run dev
```

7. **Create admin user:**
   - Visit `http://localhost:5173/admin/setup`
   - Create your admin account
   - Start managing your tours website!

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/              # Admin-specific components
│   ├── auth/               # Authentication components
│   ├── common/             # Reusable UI components
│   ├── layout/             # Layout components (Header, Footer)
│   └── reviews/            # Review system components
├── pages/
│   ├── admin/              # Admin dashboard pages
│   ├── auth/               # Login/Register pages
│   └── [other-pages]/      # Public pages
├── services/
│   └── firebase/           # Firebase service integrations
├── utils/                  # Utility functions and helpers
├── contexts/               # React contexts for state management
├── hooks/                  # Custom React hooks
└── styles/                 # CSS and styling files
```

## 🎯 Key Features Breakdown

### 📸 **Image Compression System**
- Automatic image compression to 70% quality
- Resize to optimal dimensions (800x600)
- Convert to base64 for database storage
- Significant storage space savings (60-80% compression)

### 📧 **Contact Management**
- Real-time contact form submissions
- Admin notifications for new messages
- Message status tracking (unread, read, replied, archived)
- Search and filter contact messages

### 🔔 **Notification System**
- Real-time admin notifications
- Browser notifications support
- Notification management dashboard
- Customizable notification types

### 🖼️ **Media Library**
- Compressed image storage
- Gallery management with drag-and-drop
- Image optimization and thumbnails
- Bulk image operations

## 🚀 Deployment

### **Firebase Hosting**
```bash
npm run build
firebase deploy
```

### **Vercel**
```bash
npm run build
# Connect your GitHub repo to Vercel
```

### **Netlify**
```bash
npm run build
# Drag and drop the dist folder to Netlify
```

## 🔧 Configuration

### **Firebase Rules**
The project includes pre-configured Firestore and Storage rules in:
- `firestore.rules` - Database security rules
- `storage.rules` - File storage security rules

### **Admin Setup**
1. Visit `/admin/setup` to create the first admin user
2. Configure website content in Admin → Content Management
3. Add sample data using the provided utilities

## 📊 Performance Features

- **Image Compression**: Reduces storage by 60-80%
- **Lazy Loading**: Images load on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Firebase caching for better performance
- **SEO Optimization**: Meta tags and structured data

## 🛡️ Security Features

- **Firebase Authentication**: Secure user management
- **Protected Routes**: Admin-only areas
- **Input Validation**: Form validation and sanitization
- **CORS Protection**: Secure API endpoints
- **XSS Prevention**: Content sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@tours.com
- **GitHub Issues**: [Create an issue](https://github.com/mustafa2080/newToursSite/issues)
- **Documentation**: Check the `/docs` folder for detailed guides

## 🙏 Acknowledgments

- **Firebase** for the excellent backend services
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Heroicons** for the beautiful icons
- **Unsplash** for the sample images

---

**Made with ❤️ by [Mustafa](https://github.com/mustafa2080)**

🌟 **Star this repo if you found it helpful!**
