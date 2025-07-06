import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ServerIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { backupAPI } from '../../services/api';

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [stats, setStats] = useState({
    totalBackups: 0,
    totalSize: 0,
    lastBackup: null,
    autoBackupEnabled: true
  });

  useEffect(() => {
    loadBackups();
    loadStats();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await backupAPI.getAll();
      setBackups(response.data || []);
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await backupAPI.getStats();
      setStats(response.data || stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await backupAPI.create({
        type: 'manual',
        description: `Manual backup created on ${new Date().toLocaleString()}`
      });
      
      if (response.success) {
        await loadBackups();
        await loadStats();
        alert('Backup created successfully!');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (backupId, filename) => {
    try {
      const response = await backupAPI.download(backupId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('Error downloading backup: ' + error.message);
    }
  };

  const restoreBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return;
    }

    setRestoring(true);
    try {
      const response = await backupAPI.restore(backupId);
      
      if (response.success) {
        alert('Backup restored successfully! Please refresh the page.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Error restoring backup: ' + error.message);
    } finally {
      setRestoring(false);
    }
  };

  const deleteBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      await backupAPI.delete(backupId);
      await loadBackups();
      await loadStats();
      alert('Backup deleted successfully!');
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Error deleting backup: ' + error.message);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please select a valid backup file (.json)');
      return;
    }

    setUploadFile(file);
  };

  const uploadAndRestore = async () => {
    if (!uploadFile) return;

    if (!window.confirm('Are you sure you want to restore from this file? This will overwrite current data.')) {
      return;
    }

    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append('backup', uploadFile);

      const response = await backupAPI.uploadAndRestore(formData);
      
      if (response.success) {
        alert('Backup restored successfully! Please refresh the page.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error uploading and restoring backup:', error);
      alert('Error restoring backup: ' + error.message);
    } finally {
      setRestoring(false);
      setUploadFile(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ServerIcon className="h-8 w-8 mr-3 text-blue-600" />
                Backup & Restore
              </h1>
              <p className="text-gray-600 mt-2">
                Manage database backups and restore points
              </p>
            </div>
            <Button
              onClick={createBackup}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creating ? (
                <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              )}
              Create Backup
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Backups</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBackups}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CloudIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Size</p>
                <p className="text-2xl font-semibold text-gray-900">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Backup</p>
                <p className="text-sm font-semibold text-gray-900">
                  {stats.lastBackup ? formatDate(stats.lastBackup) : 'Never'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className={`h-8 w-8 ${stats.autoBackupEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Auto Backup</p>
                <p className="text-sm font-semibold text-gray-900">
                  {stats.autoBackupEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Restore from File
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {uploadFile && (
                <Button
                  onClick={uploadAndRestore}
                  disabled={restoring}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {restoring ? (
                    <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  )}
                  Restore
                </Button>
              )}
            </div>
            {uploadFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
              </p>
            )}
          </Card>
        </motion.div>

        {/* Backups List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Backups
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <ClockIcon className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Loading backups...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="p-8 text-center">
                <DocumentArrowDownIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No backups available</p>
                <p className="text-sm text-gray-400 mt-1">Create your first backup to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {backups.map((backup) => (
                  <div key={backup.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {backup.filename}
                          </h3>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            backup.type === 'auto' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {backup.type}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>{formatDate(backup.created_at)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatFileSize(backup.size)}</span>
                          {backup.description && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{backup.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => downloadBackup(backup.id, backup.filename)}
                          size="small"
                          variant="outline"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          onClick={() => restoreBackup(backup.id)}
                          disabled={restoring}
                          size="small"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          onClick={() => deleteBackup(backup.id)}
                          size="small"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Notes
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Restoring a backup will overwrite all current data</li>
                    <li>Always create a backup before restoring</li>
                    <li>Backup files contain sensitive information - store securely</li>
                    <li>Auto backups are created daily at 2:00 AM</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BackupRestore;
