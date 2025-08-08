import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import NotificationManager from './components/common/NotificationManager';

import './utils/updateImagesInFirebase'; // Make functions available in console
import './utils/seedTrips'; // Make seedTrips available in console
import './utils/seedHotels'; // Make seedHotels available in console
import './utils/seedBookings'; // Make seedBookings available in console
import './utils/testFirebaseConnection'; // Make Firebase test functions available in console
import './utils/checkCategoriesImages'; // Make categories image checker functions available in console
import './utils/firebaseStorageHelper'; // Make Firebase Storage helper functions available in console
import './utils/fixAllFirebaseUrls'; // Make Firebase URL fix functions available in console
import './utils/testImageUpload'; // Make image upload test functions available in console
import './utils/debugCategoriesImages'; // Make categories debug functions available in console
import './utils/fixBlackImages'; // Make black images fix functions available in console
import './utils/addSampleImages'; // Make sample images functions available in console
import './utils/testEditSystem'; // Make edit system test functions available in console
import './utils/debugTripEdit'; // Make trip edit debug functions available in console
import './utils/testSuccessMessage'; // Make success message test functions available in console
import './utils/testSpecificTrip'; // Make specific trip test functions available in console
import './utils/fixDocumentSize'; // Make document size fix functions available in console
import './utils/quickImageFix'; // Make quick image fix functions available in console
import './utils/createAdminUser'; // Make admin user creation functions available in console
import './utils/setupNotifications'; // Make notification setup functions available in console
import './utils/testFirebase'; // Make Firebase test functions available in console
import Layout from './components/layout/Layout';
import FirebaseTest from './components/FirebaseTest';
import QuickSetup from './components/QuickSetup';
import LoginDebug from './components/LoginDebug';
import FirebaseDirectTest from './components/FirebaseDirectTest';
import FixUserData from './components/FixUserData';
import HotelDataViewer from './components/HotelDataViewer';
import UpdateHotelPrices from './components/UpdateHotelPrices';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import Home from './pages/Home';
import Trips from './pages/Trips';
import Hotels from './pages/Hotels';
import TripDetail from './pages/TripDetail';
import HotelDetail from './pages/HotelDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Press from './pages/Press';
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import CancellationPolicy from './pages/legal/CancellationPolicy';
import CookiesPolicy from './pages/legal/CookiesPolicy';
import HelpCenter from './pages/support/HelpCenter';
import Safety from './pages/support/Safety';
import Accessibility from './pages/support/Accessibility';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/admin/AdminRegister';
import SecretAdminSetup from './pages/admin/SecretAdminSetup';
import AdminDashboard from './pages/admin/AdminDashboard';
import TripsManagement from './pages/admin/TripsManagement';
import AddTrip from './pages/admin/AddTrip';
import EditTrip from './pages/admin/EditTrip';
import HotelsManagement from './pages/admin/HotelsManagement';
import AddHotel from './pages/admin/AddHotel';
import EditHotel from './pages/admin/EditHotel';
import UsersManagement from './pages/admin/UsersManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import RatingsManagement from './pages/admin/RatingsManagement';
import ContentManagement from './pages/admin/ContentManagement';
import NotificationsManagement from './pages/admin/NotificationsManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import AddCategory from './pages/admin/AddCategory';
import EditCategory from './pages/admin/EditCategory';
import SearchManagement from './pages/admin/SearchManagement';
import BackupRestore from './pages/admin/BackupRestore';
import SystemLogs from './pages/admin/SystemLogs';
import CommentsManagement from './pages/admin/CommentsManagement';
import ContactMessagesManagement from './pages/admin/ContactMessagesManagement';
import CategoryPage from './pages/CategoryPage';
import PaymentsManagement from './pages/admin/PaymentsManagement';
import ReportsManagement from './pages/admin/ReportsManagement';
import SecurityManagement from './pages/admin/SecurityManagement';
import BookTrip from './pages/BookTrip';
import BookHotel from './pages/BookHotel';
import HotelReviews from './pages/HotelReviews';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import SetupData from './pages/SetupData';
import ImageGalleryTest from './components/test/ImageGalleryTest';
import SearchDebugger from './components/debug/SearchDebugger';
import CategoriesImageUpdater from './components/debug/CategoriesImageUpdater';
import './App.css';

function App() {
  return (
    <div className="optimized-fonts">
      <AuthProvider>
        <NotificationsProvider>
          <Router>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
          <Routes>
          <Route path="/" element={<Layout />}>
            {/* Main public routes */}
            <Route index element={<Home />} />
            <Route path="trips" element={<Trips />} />
            <Route path="trips/:slug" element={<TripDetail />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="hotels/:slug" element={<HotelDetail />} />
            <Route path="categories/:slug" element={<CategoryPage />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="setup-data" element={<SetupData />} />
            <Route path="test/image-gallery" element={<ImageGalleryTest />} />
            <Route path="debug/search" element={<SearchDebugger />} />
            <Route path="debug/categories" element={<CategoriesImageUpdater />} />
            <Route path="test/firebase" element={<FirebaseTest />} />
            <Route path="setup" element={<QuickSetup />} />
            <Route path="debug/login" element={<LoginDebug />} />
            <Route path="test/firebase-direct" element={<FirebaseDirectTest />} />
            <Route path="fix/user-data" element={<FixUserData />} />
            <Route path="debug/hotel-data/:hotelId?" element={<HotelDataViewer />} />
            <Route path="admin/update-hotel-prices/:hotelId?" element={<UpdateHotelPrices />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="press" element={<Press />} />

            {/* Legal Pages */}
            <Route path="terms" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="cancellation" element={<CancellationPolicy />} />
            <Route path="cookies" element={<CookiesPolicy />} />

            {/* Support Pages */}
            <Route path="help" element={<HelpCenter />} />
            <Route path="safety" element={<Safety />} />
            <Route path="accessibility" element={<Accessibility />} />

            {/* Booking routes */}
            <Route path="book/trip/:tripId" element={<BookTrip />} />
            <Route path="book/hotel/:hotelId" element={<BookHotel />} />
            <Route path="hotel/:hotelId/reviews" element={<HotelReviews />} />

            {/* Profile routes */}
            <Route path="profile/*" element={<Profile />} />

            {/* Auth routes (with layout - navbar and footer) */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="admin/register" element={<AdminRegister />} />
          </Route>

          {/* Secret Admin Setup (without layout) */}
          <Route path="/secret-admin-setup" element={<SecretAdminSetup />} />

          {/* Admin routes (protected with separate admin layout) */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="trips" element={<TripsManagement />} />
            <Route path="trips/new" element={<AddTrip />} />
            <Route path="trips/:id/edit" element={<EditTrip />} />
            <Route path="hotels" element={<HotelsManagement />} />
            <Route path="hotels/new" element={<AddHotel />} />
            <Route path="hotels/:id/edit" element={<EditHotel />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="bookings" element={<BookingsManagement />} />
            <Route path="reviews" element={<RatingsManagement />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="notifications" element={<NotificationsManagement />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="categories/new" element={<AddCategory />} />
            <Route path="categories/:id/edit" element={<EditCategory />} />
            <Route path="payments" element={<PaymentsManagement />} />
            <Route path="analytics" element={<AdminDashboard />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="security" element={<SecurityManagement />} />
            <Route path="settings" element={<ContentManagement />} />
            <Route path="search" element={<SearchManagement />} />
            <Route path="backup" element={<BackupRestore />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="comments" element={<CommentsManagement />} />
            <Route path="contact-messages" element={<ContactMessagesManagement />} />
            {/* Add more admin routes here */}
          </Route>
        </Routes>
        </Router>

        {/* Real-time Notifications */}
        <NotificationManager />
      </NotificationsProvider>
    </AuthProvider>
    </div>
  );
}

export default App;
