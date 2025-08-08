import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Button from '../../components/common/Button';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      console.log('🚀 Loading users from Firebase...');

      // Get users from Firebase
      const usersCollection = collection(db, 'users');
      const usersQuery = query(usersCollection, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);

      console.log('📊 Total users in database:', usersSnapshot.size);

      const usersData = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Calculate user statistics
        const bookingsCount = await getUserBookingsCount(userDoc.id);
        const totalSpent = await getUserTotalSpent(userDoc.id);

        const user = {
          id: userDoc.id,
          firstName: userData.firstName || userData.displayName?.split(' ')[0] || 'Unknown',
          lastName: userData.lastName || userData.displayName?.split(' ')[1] || '',
          email: userData.email || 'No email',
          phone: userData.phone || userData.phoneNumber || 'No phone',
          role: userData.role || 'user',
          status: userData.status || 'active',
          emailVerified: userData.emailVerified || false,
          lastLoginAt: userData.lastLoginAt?.toDate?.() || userData.lastLoginAt || userData.createdAt?.toDate?.() || new Date(),
          createdAt: userData.createdAt?.toDate?.() || userData.createdAt || new Date(),
          bookingsCount,
          totalSpent,
          photoURL: userData.photoURL || null,
          provider: userData.provider || 'email',
        };

        usersData.push(user);

        console.log(`👤 User ${usersData.length}:`, {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          bookings: user.bookingsCount,
          spent: user.totalSpent
        });
      }

      console.log('✅ Loaded users:', usersData.length);
      setUsers(usersData);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserBookingsCount = async (userId) => {
    try {
      const bookingsCollection = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsCollection);

      let count = 0;
      bookingsSnapshot.docs.forEach(doc => {
        const booking = doc.data();
        if (booking.userId === userId || booking.customerEmail === users.find(u => u.id === userId)?.email) {
          count++;
        }
      });

      return count;
    } catch (error) {
      console.error('Error getting user bookings count:', error);
      return 0;
    }
  };

  const getUserTotalSpent = async (userId) => {
    try {
      const bookingsCollection = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsCollection);

      let total = 0;
      bookingsSnapshot.docs.forEach(doc => {
        const booking = doc.data();
        if ((booking.userId === userId || booking.customerEmail === users.find(u => u.id === userId)?.email) &&
            (booking.status === 'confirmed' || booking.paymentStatus === 'paid')) {
          total += booking.totalPrice || booking.totalAmount || 0;
        }
      });

      return total;
    } catch (error) {
      console.error('Error getting user total spent:', error);
      return 0;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Admin', icon: ShieldCheckIcon },
      user: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'User', icon: UserIcon },
    };

    const config = roleConfig[role] || roleConfig.user;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleEdit = (userId) => {
    console.log('Edit user:', userId);
    // TODO: Implement user editing modal or navigate to edit page
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        console.log('User deleted successfully');
        loadUsers(); // Reload users list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  };

  const handleView = (userId) => {
    console.log('View user:', userId);
    // TODO: Implement user details modal or navigate to user profile
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: new Date()
      });
      console.log('User status updated successfully');
      loadUsers(); // Reload users list
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          role: newRole,
          updatedAt: new Date()
        });
        console.log('User role updated successfully');
        loadUsers(); // Reload users list
      } catch (error) {
        console.error('Error updating user role:', error);
        alert('Error updating user role. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => loadUsers()}
            className="flex items-center"
          >
            🔄 Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log('Export users')}
          >
            📊 Export
          </Button>
          <Button
            onClick={() => console.log('Add new user')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ➕ Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-32">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="sm:w-32">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-blue-600">
                            {(user.firstName?.[0] || '?')}{(user.lastName?.[0] || '')}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                          {user.emailVerified && (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 inline ml-1" title="Email Verified" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="block"
                      >
                        {getRoleBadge(user.role)}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className="block"
                      >
                        {getStatusBadge(user.status)}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        Last login: {user.lastLoginAt instanceof Date ? user.lastLoginAt.toLocaleDateString() : 'Never'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined: {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Provider: {user.provider || 'email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {user.bookingsCount} bookings
                      </div>
                      <div className="text-sm text-gray-500">
                        ${user.totalSpent} spent
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No users have registered yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
