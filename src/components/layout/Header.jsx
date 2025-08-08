import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  HeartIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../admin/NotificationBell';
import GlobalSearch from '../search/GlobalSearch';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  console.log('🔍 Header render - isAuthenticated:', isAuthenticated, 'user:', user?.email || 'none');

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Trips', href: '/trips' },
    { name: 'Hotels', href: '/hotels' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'My Bookings', href: '/profile/bookings', icon: BookmarkIcon },
    { name: 'Wishlist', href: '/profile/wishlist', icon: HeartIcon },
    { name: 'Account Settings', href: '/profile/settings', icon: Cog6ToothIcon },
  ];

  if (isAdmin()) {
    userMenuItems.push({ name: 'Admin Dashboard', href: '/admin', icon: Cog6ToothIcon });
  }

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="w-full bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">Tours</div>
                  <div className="text-xs text-gray-500 -mt-1">Premium Travel</div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath(item.href)
                    ? 'text-blue-600 bg-blue-50 shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.name}
                {isActivePath(item.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Section - Search & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex">
              <GlobalSearch
                className="w-64"
                placeholder="Search trips, hotels, reviews..."
              />
            </div>

            {/* Notifications & User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Admin Notifications */}
                {isAdmin() && (
                  <div className="relative">
                    <NotificationBell />
                  </div>
                )}

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    {/* Profile Image */}
                    <div className="relative">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-gray-200 hover:border-blue-300 transition-all duration-200">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

                    {/* User Info */}
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.firstName || user?.displayName?.split(' ')[0] || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.role === 'admin' ? 'Administrator' : 'Member'}
                      </div>
                    </div>

                    {/* Dropdown Arrow */}
                    <div className="hidden lg:block">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                      >
                        {/* User Info Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                          <div className="flex items-center space-x-4">
                            {user?.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-14 w-14 rounded-full object-cover border-3 border-white shadow-md"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-3 border-white shadow-md">
                                <UserIcon className="w-7 h-7 text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-semibold text-gray-900 truncate">
                                {user?.firstName && user?.lastName
                                  ? `${user.firstName} ${user.lastName}`
                                  : user?.displayName || 'User'
                                }
                              </p>
                              <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                              <div className="flex items-center mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  user?.role === 'admin'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                  {user?.role === 'admin' ? '👑 Administrator' : '👤 Member'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {userMenuItems.map((item, index) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200 mr-3">
                                <item.icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.name === 'Profile' && 'View and edit your profile'}
                                  {item.name === 'My Bookings' && 'Manage your reservations'}
                                  {item.name === 'Wishlist' && 'Your saved trips and hotels'}
                                  {item.name === 'Account Settings' && 'Privacy and preferences'}
                                  {item.name === 'Admin Dashboard' && 'Manage the platform'}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Logout Section */}
                        <div className="border-t border-gray-100 bg-gray-50">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-6 py-4 text-red-600 hover:bg-red-50 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors duration-200 mr-3">
                              <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">Sign Out</div>
                              <div className="text-xs text-red-500">Logout from your account</div>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* Mobile Search */}
              <GlobalSearch
                className="w-full"
                placeholder="Search trips, hotels, reviews..."
              />

              {/* Navigation Links */}
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200 ${
                      isActivePath(item.href)
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile User Menu */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    {/* User Info in Mobile */}
                    <div className="flex items-center px-4 py-3 bg-blue-50 rounded-lg mb-4">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white">
                          <UserIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-lg font-medium text-gray-900">
                          {user?.firstName || user?.displayName?.split(' ')[0] || 'User'}
                        </p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>

                    {/* User Menu Items */}
                    <div className="space-y-2">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5 mr-3" />
                          <span className="text-lg font-medium">{item.name}</span>
                        </Link>
                      ))}

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
