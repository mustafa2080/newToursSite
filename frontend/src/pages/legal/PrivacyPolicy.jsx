import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  UserGroupIcon,
  CogIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';

const PrivacyPolicy = () => {
  const sections = [
    {
      id: 'information-collection',
      title: '1. Information We Collect',
      icon: EyeIcon,
      content: `We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes your name, email address, phone number, payment information, and travel preferences.`
    },
    {
      id: 'information-use',
      title: '2. How We Use Your Information',
      icon: CogIcon,
      content: `We use your information to provide and improve our services, process bookings, communicate with you, personalize your experience, and ensure the security of our platform.`
    },
    {
      id: 'information-sharing',
      title: '3. Information Sharing',
      icon: UserGroupIcon,
      content: `We may share your information with service providers (hotels, tour operators), payment processors, and other third parties necessary to complete your bookings. We do not sell your personal information.`
    },
    {
      id: 'data-security',
      title: '4. Data Security',
      icon: LockClosedIcon,
      content: `We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`
    },
    {
      id: 'cookies',
      title: '5. Cookies and Tracking',
      icon: CogIcon,
      content: `We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.`
    },
    {
      id: 'your-rights',
      title: '6. Your Rights',
      icon: ShieldCheckIcon,
      content: `You have the right to access, update, or delete your personal information. You may also opt out of certain communications and request data portability where applicable under local laws.`
    },
    {
      id: 'data-retention',
      title: '7. Data Retention',
      icon: LockClosedIcon,
      content: `We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.`
    },
    {
      id: 'international-transfers',
      title: '8. International Data Transfers',
      icon: UserGroupIcon,
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.`
    },
    {
      id: 'children-privacy',
      title: '9. Children\'s Privacy',
      icon: ExclamationTriangleIcon,
      content: `Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.`
    },
    {
      id: 'policy-changes',
      title: '10. Changes to This Policy',
      icon: CogIcon,
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.`
    }
  ];

  const dataTypes = [
    {
      category: 'Account Information',
      items: ['Name', 'Email address', 'Phone number', 'Password (encrypted)', 'Profile picture']
    },
    {
      category: 'Booking Information',
      items: ['Travel dates', 'Destination preferences', 'Guest details', 'Special requests', 'Payment information']
    },
    {
      category: 'Usage Information',
      items: ['Pages visited', 'Search queries', 'Device information', 'IP address', 'Browser type']
    },
    {
      category: 'Communication Data',
      items: ['Customer service interactions', 'Email communications', 'Survey responses', 'Feedback and reviews']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ShieldCheckIcon className="h-16 w-16 mx-auto mb-6 text-green-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="mt-6 text-sm text-green-200">
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
                Our Commitment to Your Privacy
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At Tours Platform, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using our platform, you consent to the data practices described in this policy.
              </p>
            </Card>
          </motion.div>

          {/* Data Collection Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Types of Information We Collect
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {dataTypes.map((type, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{type.category}</h3>
                    <ul className="space-y-1">
                      {type.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 3) }}
              >
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <section.icon className="h-6 w-6 text-green-600 mt-1" />
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
            <Card className="p-8 bg-green-50 border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Our Privacy Team
              </h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@tours.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Travel Street, Adventure City, AC 12345</p>
                <p><strong>Data Protection Officer:</strong> dpo@tours.com</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
