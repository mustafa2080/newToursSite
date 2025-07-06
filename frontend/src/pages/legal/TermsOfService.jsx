import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';

const TermsOfService = () => {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: DocumentTextIcon,
      content: `By accessing and using Tours Platform ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      icon: ScaleIcon,
      content: `"Service" refers to the Tours Platform website and mobile applications. "User" refers to anyone who accesses or uses the Service. "Content" refers to all information, data, text, software, music, sound, photographs, graphics, video, messages, or other materials.`
    },
    {
      id: 'user-accounts',
      title: '3. User Accounts',
      icon: ShieldCheckIcon,
      content: `You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.`
    },
    {
      id: 'booking-terms',
      title: '4. Booking Terms',
      icon: DocumentTextIcon,
      content: `All bookings are subject to availability and confirmation. Prices are subject to change without notice until booking is confirmed. Payment must be made in full at the time of booking unless otherwise specified.`
    },
    {
      id: 'cancellation',
      title: '5. Cancellation Policy',
      icon: ExclamationTriangleIcon,
      content: `Cancellation policies vary by service provider. Please review the specific cancellation terms for each booking. Refunds, if applicable, will be processed according to the terms specified at the time of booking.`
    },
    {
      id: 'liability',
      title: '6. Limitation of Liability',
      icon: ShieldCheckIcon,
      content: `Tours Platform acts as an intermediary between users and service providers. We are not liable for any damages, losses, or injuries that may occur during your travel. Travel insurance is strongly recommended.`
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property',
      icon: ScaleIcon,
      content: `All content on Tours Platform is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`
    },
    {
      id: 'prohibited-uses',
      title: '8. Prohibited Uses',
      icon: ExclamationTriangleIcon,
      content: `You may not use our service for any unlawful purpose, to violate any laws, to infringe upon intellectual property rights, to harass or abuse others, or to interfere with the security of the Service.`
    },
    {
      id: 'privacy',
      title: '9. Privacy Policy',
      icon: ShieldCheckIcon,
      content: `Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.`
    },
    {
      id: 'modifications',
      title: '10. Modifications to Terms',
      icon: DocumentTextIcon,
      content: `We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after changes are posted constitutes acceptance of the modified terms.`
    },
    {
      id: 'termination',
      title: '11. Termination',
      icon: ExclamationTriangleIcon,
      content: `We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.`
    },
    {
      id: 'governing-law',
      title: '12. Governing Law',
      icon: ScaleIcon,
      content: `These Terms shall be interpreted and governed by the laws of the jurisdiction in which Tours Platform operates, without regard to its conflict of law provisions.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <DocumentTextIcon className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Please read these terms carefully before using Tours Platform
            </p>
            <div className="mt-6 text-sm text-blue-200">
              Last updated: January 1, 2024
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Tours Platform
              </h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms of Service ("Terms") govern your use of Tours Platform and all related services. 
                By using our platform, you agree to these terms in full. If you disagree with any part of these terms, 
                you must not use our service.
              </p>
            </Card>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 2) }}
              >
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <section.icon className="h-6 w-6 text-blue-600 mt-1" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {section.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="p-8 bg-blue-50 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions About These Terms?
              </h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> legal@tours.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Travel Street, Adventure City, AC 12345</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
