import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { contactMessagesService } from '../../services/firebase/contactMessages';

const ContactMessagesManagement = () => {
  console.log('📧 ContactMessagesManagement component loading...');
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0
  });

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      const filters = filter === 'all' ? {} : { status: filter };
      const result = await contactMessagesService.getAllMessages(filters);

      if (result.success) {
        setMessages(result.data);
        setStats(result.stats);
        console.log(`✅ Loaded ${result.data.length} messages`);
      } else {
        console.error('❌ Failed to load messages:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (messageId, newStatus, adminNotes = '') => {
    try {
      setActionLoading(true);
      const result = await contactMessagesService.updateMessageStatus(messageId, newStatus, {
        admin_notes: adminNotes,
        replied_by: 'admin'
      });

      if (result.success) {
        console.log(`✅ Message marked as ${newStatus}`);
        loadMessages();
        setShowModal(false);
      } else {
        console.error('❌ Failed to update message status:', result.error);
      }
    } catch (error) {
      console.error('❌ Error updating message:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      setActionLoading(true);
      const result = await contactMessagesService.deleteMessage(messageId);

      if (result.success) {
        console.log('✅ Message deleted successfully');
        loadMessages();
        setShowModal(false);
      } else {
        console.error('❌ Failed to delete message:', result.error);
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openMessageModal = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // Mark as read if it's unread
    if (message.status === 'unread') {
      await handleStatusUpdate(message.id, 'read');
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading contact messages..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600">Manage customer inquiries and messages</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <EnvelopeOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-gray-900">{stats.read}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.replied}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-gray-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900">{stats.archived}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'read', 'replied', 'archived'].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? 'primary' : 'outline'}
                size="sm"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Messages List */}
      <Card className="overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Found</h3>
            <p className="text-gray-600">No contact messages match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {message.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {message.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {message.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openMessageModal(message)}
                          size="sm"
                          variant="outline"
                          icon={<EyeIcon />}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => handleDelete(message.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          icon={<TrashIcon />}
                          loading={actionLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ContactMessagesManagement;
