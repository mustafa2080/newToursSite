import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatCurrency } from '../../utils/firebaseOperations';

const AdminDataTable = ({
  title,
  data = [],
  columns = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  filterable = true,
  pagination = true,
  itemsPerPage = 10,
  actions = ['view', 'edit', 'delete'],
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Filter and search data
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    return columns.some(column => {
      const value = getNestedValue(item, column.key);
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = pagination 
    ? sortedData.slice(startIndex, startIndex + itemsPerPage)
    : sortedData;

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(prev => 
      prev.length === paginatedData.length 
        ? []
        : paginatedData.map(item => item.id)
    );
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete && onDelete) {
      try {
        await onDelete(itemToDelete.id);
        toast.success(`${title.slice(0, -1)} deleted successfully`);
      } catch (error) {
        toast.error(`Failed to delete ${title.slice(0, -1).toLowerCase()}`);
      }
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const renderCellValue = (item, column) => {
    const value = getNestedValue(item, column.key);
    
    if (column.render) {
      return column.render(value, item);
    }
    
    switch (column.type) {
      case 'currency':
        return formatCurrency(value);
      case 'date':
        return formatDate(value);
      case 'boolean':
        return value ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        ) : (
          <XCircleIcon className="h-5 w-5 text-red-500" />
        );
      case 'badge':
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${column.badgeColors?.[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      case 'image':
        return value ? (
          <img src={value} alt="" className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        );
      default:
        return value?.toString() || '-';
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">
            {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        
        {onAdd && (
          <Button onClick={onAdd} icon={<PlusIcon />}>
            Add {title.slice(0, -1)}
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      {(searchable || filterable) && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {searchable && (
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${title.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selected
                </span>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setSelectedItems([])}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner size="large" text={`Loading ${title.toLowerCase()}...`} />
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {title.toLowerCase()} found
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : `Get started by adding your first ${title.slice(0, -1).toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {actions.length > 0 && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span className="text-gray-400">
                            {getSortIcon(column.key) || '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {paginatedData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      {actions.length > 0 && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renderCellValue(item, column)}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {actions.includes('view') && onView && (
                              <button
                                onClick={() => onView(item)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="View"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            )}
                            {actions.includes('edit') && onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="Edit"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            {actions.includes('delete') && onDelete && (
                              <button
                                onClick={() => handleDelete(item)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="small"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              icon={<ChevronLeftIcon />}
            >
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="small"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              icon={<ChevronRightIcon />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-md p-6">
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirm Delete
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this {title.slice(0, -1).toLowerCase()}? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDataTable;
