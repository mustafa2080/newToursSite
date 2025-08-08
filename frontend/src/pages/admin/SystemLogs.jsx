import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { logsAPI } from '../../services/api';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    level: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [filters, pagination.page]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadLogs(true);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, filters]);

  const loadLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await logsAPI.getAll({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setLogs(response.data.logs || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      return;
    }

    try {
      await logsAPI.clear();
      await loadLogs();
      alert('Logs cleared successfully!');
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Error clearing logs: ' + error.message);
    }
  };

  const exportLogs = async () => {
    try {
      const response = await logsAPI.export(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `system-logs-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Error exporting logs: ' + error.message);
    }
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warn':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLogBadgeColor = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const logLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'error', label: 'Error' },
    { value: 'warn', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' }
  ];

  const logCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'auth', label: 'Authentication' },
    { value: 'api', label: 'API Requests' },
    { value: 'database', label: 'Database' },
    { value: 'backup', label: 'Backup/Restore' },
    { value: 'search', label: 'Search' },
    { value: 'upload', label: 'File Upload' },
    { value: 'email', label: 'Email' },
    { value: 'system', label: 'System' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-600" />
                System Logs
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor system activities and troubleshoot issues
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="small"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              <Button
                onClick={exportLogs}
                variant="outline"
                size="small"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={clearLogs}
                variant="outline"
                size="small"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear Logs
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {logLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {logCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="datetime-local"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="datetime-local"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Logs List */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Activity Logs ({pagination.total})
            </h2>
            {autoRefresh && (
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Auto-refreshing every 5 seconds
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <ClockIcon className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No logs found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getLogIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getLogBadgeColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            {log.category}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-900 font-medium">
                        {log.message}
                      </p>
                      {log.details && (
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                        </p>
                      )}
                      {log.user_id && (
                        <p className="mt-1 text-xs text-gray-500">
                          User: {log.user_email || log.user_id}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  size="small"
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  size="small"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getLogIcon(selectedLog.level)}
                  <span className={`px-2 py-1 text-xs rounded-full ${getLogBadgeColor(selectedLog.level)}`}>
                    {selectedLog.level.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    {selectedLog.category}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                  <p className="text-gray-700">{selectedLog.message}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Timestamp</h4>
                  <p className="text-gray-700">{formatDate(selectedLog.timestamp)}</p>
                </div>
                {selectedLog.details && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {typeof selectedLog.details === 'string' 
                        ? selectedLog.details 
                        : JSON.stringify(selectedLog.details, null, 2)
                      }
                    </pre>
                  </div>
                )}
                {selectedLog.user_id && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                    <p className="text-gray-700">
                      ID: {selectedLog.user_id}<br />
                      Email: {selectedLog.user_email || 'N/A'}
                    </p>
                  </div>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">IP Address</h4>
                    <p className="text-gray-700">{selectedLog.ip_address}</p>
                  </div>
                )}
                {selectedLog.user_agent && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">User Agent</h4>
                    <p className="text-gray-700 text-sm break-all">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
