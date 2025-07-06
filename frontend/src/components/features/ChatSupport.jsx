import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatSupport = ({ className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState('online'); // 'online', 'away', 'offline'
  const [chatSession, setChatSession] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    if (isOpen && !chatSession) {
      initializeChat();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate agent responses
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      const timer = setTimeout(() => {
        simulateAgentResponse();
      }, 1000 + Math.random() * 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const initializeChat = () => {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setChatSession(sessionId);
    
    // Welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: user 
        ? `Hi ${user.firstName}! I'm Sarah, your travel assistant. How can I help you today?`
        : "Hi there! I'm Sarah, your travel assistant. How can I help you plan your perfect trip?",
      sender: 'agent',
      timestamp: new Date(),
      agentName: 'Sarah',
      agentAvatar: '/images/agents/sarah.jpg'
    };
    
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      userName: user ? `${user.firstName} ${user.lastName}` : 'Guest'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(true);

    // In a real app, this would send to your chat API
    // For demo, we'll simulate agent responses
  };

  const simulateAgentResponse = () => {
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you with that! Let me find the best options for you.",
        "That sounds like an amazing trip! I can recommend some fantastic destinations.",
        "Great question! Based on your preferences, I have several suggestions.",
        "I understand your concern. Let me provide you with detailed information.",
        "Perfect! I can help you book that right away. Would you like me to check availability?",
        "That's a popular choice! Many of our travelers love that destination.",
        "I can definitely assist with that. Let me pull up the latest information for you.",
        "Excellent! I'll make sure to find you the best deals available."
      ];

      const response = {
        id: Date.now(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'agent',
        timestamp: new Date(),
        agentName: 'Sarah',
        agentAvatar: '/images/agents/sarah.jpg'
      };

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const message = {
      id: Date.now(),
      text: `Shared file: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };

    setMessages(prev => [...prev, message]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgentStatusColor = () => {
    switch (agentStatus) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
            {isUser ? (
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            ) : (
              <img
                src={message.agentAvatar || '/images/agents/default.jpg'}
                alt={message.agentName}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
          </div>

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div
              className={`
                px-4 py-2 rounded-lg max-w-full break-words
                ${isUser 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
                }
              `}
            >
              {message.file ? (
                <div className="flex items-center space-x-2">
                  <PaperClipIcon className="h-4 w-4" />
                  <span className="text-sm">{message.file.name}</span>
                </div>
              ) : (
                <p className="text-sm">{message.text}</p>
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 text-white rounded-full
          shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200
          flex items-center justify-center transition-colors
          ${isOpen ? 'hidden' : 'flex'}
          ${className}
        `}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src="/images/agents/sarah.jpg"
                    alt="Sarah"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getAgentStatusColor()} rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Sarah</h3>
                  <p className="text-xs text-primary-100">Travel Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary-700 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map(renderMessage)}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src="/images/agents/sarah.jpg"
                      alt="Sarah"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => setNewMessage("I need help with booking")}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  Booking Help
                </button>
                <button
                  onClick={() => setNewMessage("What are your best deals?")}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  Best Deals
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatSupport;

// Value Proposition:
// 1. **Instant Support**: 24/7 availability reduces booking abandonment
// 2. **Personalized Assistance**: AI + human agents provide tailored recommendations
// 3. **Increased Conversions**: Real-time help during decision-making process
// 4. **Customer Satisfaction**: Immediate problem resolution builds trust
// 5. **Competitive Advantage**: Premium support experience differentiates from competitors
