import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { contactMessagesService } from '../../services/firebase/contactMessages';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMessages();
    
    // Set up real-time listener for new messages
    const unsubscribe = contactMessagesService.listenToNewMessages((newMessages) => {
      console.log('🔔 New contact messages received:', newMessages.length);
      
      // Show notification for new messages
      if (newMessages.length > 0) {
        const latestMessage = newMessages[0];
        showNotification(`New message from ${latestMessage.name}`, latestMessage.subject);
      }
      
      // Reload messages to get updated list
      loadMessages();
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const result = await contactMessagesService.getAllMessages();
      
      if (result.success) {
        setMessages(result.data);
        setStats(result.stats);
        console.log('✅ Contact messages loaded:', result.data.length);
      } else {
        console.error('❌ Error loading messages:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      const result = await contactMessagesService.updateMessageStatus(messageId, newStatus, {
        replied_by: 'admin' // You can get actual admin user here
      });
      
      if (result.success) {
        console.log(`✅ Message ${messageId} status updated to: ${newStatus}`);
        loadMessages(); // Reload to get updated data
        
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      }
    } catch (error) {
      console.error('❌ Error updating message status:', error);
      alert('Error updating message status: ' + error.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await contactMessagesService.deleteMessage(messageId);
      
      if (result.success) {
        console.log(`✅ Message ${messageId} deleted`);
        loadMessages(); // Reload to get updated data
        
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      alert('Error deleting message: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'read': return <EyeIcon className="h-4 w-4" />;
      case 'replied': return <CheckCircleIcon className="h-4 w-4" />;
      case 'archived': return <ClockIcon className="h-4 w-4" />;
      default: return <EnvelopeIcon className="h-4 w-4" />;
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    const matchesSearch = !searchTerm || 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">Manage customer inquiries and support requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unread || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.replied || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900">{stats.archived || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Messages ({filteredMessages.length})
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <EnvelopeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{message.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(message.status)}`}>
                          {getStatusIcon(message.status)}
                          {message.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">{message.subject}</p>
                      <p className="text-xs text-gray-500">
                        {message.created_at.toLocaleDateString()} at {message.created_at.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Message Details */}
        <Card className="p-6">
          {selectedMessage ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Message Details</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span>{selectedMessage.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                {selectedMessage.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received</label>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {selectedMessage.created_at.toLocaleDateString()} at {selectedMessage.created_at.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedMessage.status === 'read' ? 'primary' : 'outline'}
                      onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                    >
                      Mark as Read
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedMessage.status === 'replied' ? 'primary' : 'outline'}
                      onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                    >
                      Mark as Replied
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedMessage.status === 'archived' ? 'primary' : 'outline'}
                      onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <EnvelopeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a message to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContactMessages;
