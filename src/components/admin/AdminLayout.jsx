import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  MapIcon,
  BuildingOfficeIcon,
  UsersIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PresentationChartLineIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PhotoIcon,
  TagIcon,
  CalendarIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import NotificationBell from './NotificationBell';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    inventory: true,
    business: true,
    content: false,
    system: false,
  });
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationSections = [
    {
      name: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon, description: 'Main overview' },
      ]
    },
    {
      name: 'Inventory Management',
      key: 'inventory',
      items: [
        { name: 'Trips', href: '/admin/trips', icon: MapIcon, description: 'Manage trips & tours' },
        { name: 'Hotels', href: '/admin/hotels', icon: BuildingOfficeIcon, description: 'Manage accommodations' },
        { name: 'Categories', href: '/admin/categories', icon: TagIcon, description: 'Trip & hotel categories' },
      ]
    },
    {
      name: 'Business Operations',
      key: 'business',
      items: [
        { name: 'Bookings', href: '/admin/bookings', icon: BookmarkIcon, description: 'Reservation management' },
        { name: 'Customers', href: '/admin/users', icon: UsersIcon, description: 'Customer accounts' },
        { name: 'Reviews', href: '/admin/reviews', icon: StarIcon, description: 'Customer feedback' },
        { name: 'Payments', href: '/admin/payments', icon: CurrencyDollarIcon, description: 'Financial transactions' },
      ]
    },
    {
      name: 'Content & Marketing',
      key: 'content',
      items: [
        { name: 'Website Content', href: '/admin/content', icon: DocumentTextIcon, description: 'Pages & content' },
        { name: 'Comments', href: '/admin/comments', icon: ChatBubbleLeftIcon, description: 'Manage user comments' },
        { name: 'Media Library', href: '/admin/media', icon: PhotoIcon, description: 'Images & videos' },
        { name: 'Promotions', href: '/admin/promotions', icon: GlobeAltIcon, description: 'Deals & offers' },
      ]
    },
    {
      name: 'Analytics & Reports',
      key: 'analytics',
      items: [
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, description: 'Performance metrics' },
        { name: 'Reports', href: '/admin/reports', icon: PresentationChartLineIcon, description: 'Business reports' },
      ]
    },
    {
      name: 'System',
      key: 'system',
      items: [
        { name: 'Search Management', href: '/admin/search', icon: MagnifyingGlassIcon, description: 'Search optimization' },
        { name: 'Notifications', href: '/admin/notifications', icon: BellIcon, description: 'System alerts' },
        { name: 'Security', href: '/admin/security', icon: ShieldCheckIcon, description: 'Access control' },
        { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon, description: 'System configuration' },
        { name: 'Backup & Restore', href: '/admin/backup', icon: ArrowDownTrayIcon, description: 'Data management' },
        { name: 'System Logs', href: '/admin/logs', icon: DocumentTextIcon, description: 'Activity logs' },
      ]
    },
  ];

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActivePath = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 h-screen">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link to="/admin" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Tours</span>
              <span className="ml-2 text-sm text-gray-500">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto pb-20">
            {navigationSections.map((section) => (
              <div key={section.name} className="space-y-1">
                {section.key ? (
                  // Collapsible section
                  <div>
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                    >
                      <span>{section.name}</span>
                      {expandedSections[section.key] ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedSections[section.key] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="space-y-1 overflow-hidden"
                        >
                          {section.items.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                isActivePath(item.href)
                                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                              title={item.description}
                            >
                              <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                                isActivePath(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                              }`} />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500 group-hover:text-gray-600">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Non-collapsible section (Overview)
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                          isActivePath(item.href)
                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={item.description}
                      >
                        <item.icon className={`mr-3 h-6 w-6 transition-colors ${
                          isActivePath(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        <div className="flex-1">
                          <div className="text-base font-semibold">{item.name}</div>
                          <div className="text-xs text-gray-500 group-hover:text-gray-600">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg border-r border-gray-200"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link to="/admin" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Tours</span>
              <span className="ml-2 text-sm text-gray-500">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto pb-20">
            {navigationSections.map((section) => (
              <div key={section.name} className="space-y-1">
                {section.key ? (
                  // Collapsible section
                  <div>
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                    >
                      <span>{section.name}</span>
                      {expandedSections[section.key] ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedSections[section.key] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="space-y-1 overflow-hidden"
                        >
                          {section.items.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                isActivePath(item.href)
                                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                              title={item.description}
                            >
                              <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                                isActivePath(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                              }`} />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500 group-hover:text-gray-600">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Non-collapsible section (Overview)
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                          isActivePath(item.href)
                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                        title={item.description}
                      >
                        <item.icon className={`mr-3 h-6 w-6 transition-colors ${
                          isActivePath(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        <div className="flex-1">
                          <div className="text-base font-semibold">{item.name}</div>
                          <div className="text-xs text-gray-500 group-hover:text-gray-600">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              <div className="hidden sm:block ml-4 lg:ml-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell />

              {/* Quick actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/admin/trips/new">
                  <Button size="small" variant="outline">
                    Add Trip
                  </Button>
                </Link>
                <Link to="/admin/hotels/new">
                  <Button size="small" variant="outline">
                    Add Hotel
                  </Button>
                </Link>
              </div>

              {/* View site */}
              <Link to="/" target="_blank">
                <Button size="small" variant="ghost">
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
