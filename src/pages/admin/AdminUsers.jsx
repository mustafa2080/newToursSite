import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { usersCollection, formatDate } from '../../utils/firebaseOperations';
import { AdminRoute } from '../../components/auth/ProtectedRoute';
import AdminDataTable from '../../components/admin/AdminDataTable';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    activeUsers: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await usersCollection.getAll({
        orderBy: ['createdAt', 'desc']
      });
      
      setUsers(usersData);
      
      // Calculate stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats = {
        total: usersData.length,
        admins: usersData.filter(user => user.role === 'admin').length,
        activeUsers: usersData.filter(user => user.status !== 'banned').length,
        newThisMonth: usersData.filter(user => {
          const createdAt = user.createdAt?.toDate();
          return createdAt && createdAt >= thisMonth;
        }).length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    setShowRoleModal(true);
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;

    try {
      await usersCollection.update(selectedUser.id, {
        role: newRole
      });
      
      await loadUsers(); // Reload data
      setShowRoleModal(false);
      setSelectedUser(null);
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    
    try {
      await usersCollection.update(user.id, {
        status: newStatus
      });
      
      await loadUsers(); // Reload data
      toast.success(`User ${newStatus === 'banned' ? 'banned' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await usersCollection.delete(userId);
      await loadUsers(); // Reload data
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      throw error;
    }
  };

  const columns = [
    {
      key: 'photoURL',
      label: 'Avatar',
      render: (value, user) => (
        <div className="flex items-center">
          {value ? (
            <img 
              src={value} 
              alt={`${user.firstName} ${user.lastName}`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, user) => (
        <div>
          <div className="font-medium text-gray-900">
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.displayName || 'No name'
            }
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <EnvelopeIcon className="h-4 w-4 mr-1" />
            {user.email}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      type: 'badge',
      badgeColors: {
        admin: 'bg-red-100 text-red-800',
        user: 'bg-blue-100 text-blue-800',
        moderator: 'bg-purple-100 text-purple-800'
      },
      render: (value) => (
        <div className="flex items-center">
          {value === 'admin' && <ShieldCheckIcon className="h-4 w-4 mr-1 text-red-500" />}
          <span className={`px-2 py-1 text-xs rounded-full ${
            value === 'admin' ? 'bg-red-100 text-red-800' :
            value === 'moderator' ? 'bg-purple-100 text-purple-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {value || 'user'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, user) => (
        <div className="flex items-center">
          {value === 'banned' ? (
            <>
              <XCircleIcon className="h-4 w-4 mr-1 text-red-500" />
              <span className="text-red-600">Banned</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-600">Active</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value || '-'
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      type: 'date',
      sortable: true,
      render: (value) => value ? formatDate(value) : 'Never'
    },
    {
      key: 'createdAt',
      label: 'Joined',
      type: 'date',
      sortable: true
    }
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      title: 'Admin Users',
      value: stats.admins,
      icon: ShieldCheckIcon,
      color: 'red'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      title: 'New This Month',
      value: stats.newThisMonth,
      icon: CalendarDaysIcon,
      color: 'purple'
    }
  ];

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full bg-${stat.color}-100 mr-4`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AdminDataTable
              title="Users"
              data={users}
              columns={columns}
              loading={loading}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              searchable={true}
              filterable={true}
              pagination={true}
              itemsPerPage={15}
              actions={['edit', 'delete']}
            />
          </motion.div>
        </div>

        {/* Role Update Modal */}
        <AnimatePresence>
          {showRoleModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={() => setShowRoleModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <Card className="w-full max-w-md p-6">
                  <div className="flex items-center mb-4">
                    <PencilIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Update User Role
                    </h3>
                  </div>
                  
                  {selectedUser && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {selectedUser.photoURL ? (
                          <img 
                            src={selectedUser.photoURL} 
                            alt="User"
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <UserIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {selectedUser.firstName && selectedUser.lastName 
                              ? `${selectedUser.firstName} ${selectedUser.lastName}`
                              : selectedUser.displayName || 'No name'
                            }
                          </div>
                          <div className="text-sm text-gray-500">{selectedUser.email}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Be careful when assigning admin roles
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleUpdateUserRole}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Update Role
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRoleModal(false)}
                    >
                      Cancel
                    </Button>
                    {selectedUser && (
                      <Button
                        onClick={() => handleToggleUserStatus(selectedUser)}
                        className={selectedUser.status === 'banned' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                        }
                      >
                        {selectedUser.status === 'banned' ? 'Unban' : 'Ban'} User
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminRoute>
  );
};

export default AdminUsers;
