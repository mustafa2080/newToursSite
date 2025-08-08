import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getContent } from '../services/firebase/content';
import { contactMessagesService } from '../services/firebase/contactMessages';

const Contact = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading contact content from Firebase...');

      // Load contact content from Firebase
      const result = await getContent('contact');

      if (result.success) {
        setContent(result.content);
        console.log('✅ Contact content loaded successfully:', result.content);
      } else {
        console.error('❌ Error loading contact content:', result.error);
        // Fallback to default content
        setContent({
          title: 'Contact Us',
          subtitle: 'Get in Touch',
          description: 'Have questions about your next adventure? We\'re here to help you plan the perfect trip. Our travel experts are ready to assist you with personalized recommendations and support.',
          address: '123 Travel Street, Adventure City, AC 12345, United States',
          phone: '+1 (555) 123-4567',
          email: 'info@tours.com',
          working_hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
          map_embed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890123!2d-74.00123456789012!3d40.71234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ0LjQiTiA3NMKwMDAnMDQuNCJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
          social_links: {
            facebook: 'https://facebook.com/tours',
            instagram: 'https://instagram.com/tours',
            twitter: 'https://twitter.com/tours',
            youtube: 'https://youtube.com/tours',
          },
        });
      }
    } catch (error) {
      console.error('❌ Error loading contact content:', error);
      // Fallback to default content
      setContent({
        title: 'Contact Us',
        subtitle: 'Get in Touch',
        description: 'Have questions about your next adventure? We\'re here to help you plan the perfect trip.',
        address: '123 Travel Street, Adventure City, AC 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@tours.com',
        working_hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
        map_embed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890123!2d-74.00123456789012!3d40.71234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ0LjQiTiA3NMKwMDAnMDQuNCJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
        social_links: {
          facebook: 'https://facebook.com/tours',
          instagram: 'https://instagram.com/tours',
          twitter: 'https://twitter.com/tours',
          youtube: 'https://youtube.com/tours',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setFormLoading(true);
      console.log('📧 Sending contact message...');

      // Send message using new contact messages service
      const result = await contactMessagesService.submitMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      if (result.success) {
        console.log('✅ Message sent successfully');

        // Show success message
        alert('🎉 Thank you for your message! We have received your inquiry and will get back to you within 24 hours.');

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });

        // Clear any form errors
        setFormErrors({});

        console.log('📧 Message ID:', result.messageId);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('❌ Error sending message: ' + error.message + '\n\nPlease try again or contact us directly.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading contact page..." />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Available</h2>
          <p className="text-gray-600">Unable to load page content. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {content?.title || 'Contact Us'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            {content?.description || 'Get in touch with us for your next adventure'}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPinIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Address</h4>
                      <p className="text-gray-600 mt-1">{content?.address || '123 Travel Street, Adventure City, AC 12345'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <PhoneIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Phone</h4>
                      <p className="text-gray-600 mt-1">
                        <a href={`tel:${content?.phone || '+1-555-123-4567'}`} className="hover:text-blue-600">
                          {content?.phone || '+1 (555) 123-4567'}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600 mt-1">
                        <a href={`mailto:${content?.email || 'info@tours.com'}`} className="hover:text-blue-600">
                          {content?.email || 'info@tours.com'}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ClockIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Working Hours</h4>
                      <div className="text-gray-600 mt-1 whitespace-pre-line">
                        {content?.working_hours || 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  {Object.entries(content?.social_links || {}).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <span className="sr-only">{platform}</span>
                      {/* Add social media icons here */}
                      <span className="text-sm font-bold">
                        {platform.charAt(0).toUpperCase()}
                      </span>
                    </a>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Your full name"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your phone number"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.subject ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="What's this about?"
                      />
                      {formErrors.subject && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tell us about your travel plans or questions..."
                    />
                    {formErrors.message && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.message}</p>
                    )}
                  </div>

                  <div>
                    <Button
                      type="submit"
                      size="large"
                      loading={formLoading}
                      disabled={formLoading}
                      icon={<PaperAirplaneIcon />}
                      className="w-full md:w-auto"
                    >
                      {formLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Find Us</h3>
            <div
              className="w-full h-80 rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: content?.map_embed || '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">Map not available</div>' }}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
