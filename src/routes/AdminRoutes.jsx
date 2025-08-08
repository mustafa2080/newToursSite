import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from '../components/auth/ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboardNew';
import AdminTrips from '../pages/admin/AdminTrips';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminHotels from '../pages/admin/AdminHotels';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminContent from '../pages/admin/AdminContent';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import ReportsManagement from '../pages/admin/ReportsManagement';

// System Management Pages
import SearchManagement from '../pages/admin/SearchManagement';
import NotificationsManagement from '../pages/admin/NotificationsManagement';
import SecurityManagement from '../pages/admin/SecurityManagement';
import BackupRestore from '../pages/admin/BackupRestore';
import SystemLogs from '../pages/admin/SystemLogs';

// Website Content Pages
import ContentManagement from '../pages/admin/ContentManagement';
import CommentsManagement from '../pages/admin/CommentsManagement';
import ContactMessagesManagement from '../pages/admin/ContactMessagesManagement';
import MediaLibrary from '../pages/admin/MediaLibrarySimple';
import PromotionsManagement from '../pages/admin/PromotionsManagement';

const AdminRoutes = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <Routes>
          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Content Management */}
          <Route path="trips" element={<AdminTrips />} />
          <Route path="trips/new" element={<div>Create Trip Form</div>} />
          <Route path="trips/:id/edit" element={<div>Edit Trip Form</div>} />
          
          <Route path="hotels" element={<AdminHotels />} />
          <Route path="hotels/new" element={<div>Create Hotel Form</div>} />
          <Route path="hotels/:id/edit" element={<div>Edit Hotel Form</div>} />
          
          <Route path="categories" element={<AdminCategories />} />
          
          {/* User Management */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<div>User Details</div>} />
          
          {/* Booking Management */}
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="bookings/:id" element={<div>Booking Details</div>} />
          
          {/* Review Management */}
          <Route path="reviews" element={<AdminReviews />} />
          
          {/* Content Management */}
          <Route path="content" element={<AdminContent />} />
          <Route path="content/about" element={<div>Edit About Page</div>} />
          <Route path="content/contact" element={<div>Edit Contact Page</div>} />
          
          {/* Analytics & Reports */}
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<ReportsManagement />} />

          {/* Settings */}
          <Route path="settings" element={<AdminSettings />} />

          {/* System Management */}
          <Route path="search" element={<SearchManagement />} />
          <Route path="notifications" element={<NotificationsManagement />} />
          <Route path="security" element={<SecurityManagement />} />
          <Route path="backup" element={<BackupRestore />} />
          <Route path="logs" element={<SystemLogs />} />

          {/* Website Content */}
          <Route path="content" element={<ContentManagement />} />
          <Route path="comments" element={<CommentsManagement />} />
          <Route path="contact-messages" element={<ContactMessagesManagement />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="promotions" element={<PromotionsManagement />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminRoutes;
