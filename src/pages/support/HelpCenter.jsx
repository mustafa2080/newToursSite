import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  CreditCardIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    {
      title: 'Booking & Reservations',
      icon: BookOpenIcon,
      description: 'Help with making and managing bookings',
      color: 'blue',
      articles: 12
    },
    {
      title: 'Payments & Billing',
      icon: CreditCardIcon,
      description: 'Payment methods, refunds, and billing issues',
      color: 'green',
      articles: 8
    },
    {
      title: 'Travel Information',
      icon: MapPinIcon,
      description: 'Destination guides and travel tips',
      color: 'purple',
      articles: 15
    },
    {
      title: 'Account Management',
      icon: UserIcon,
      description: 'Profile settings and account security',
      color: 'orange',
      articles: 6
    }
  ];

  const faqs = [
    {
      question: 'How do I make a booking?',
      answer: 'To make a booking, browse our trips or hotels, select your preferred option, choose your dates, and follow the checkout process. You\'ll need to create an account and provide payment information.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Cancellation policies vary by service provider. Please check the specific cancellation terms for your booking. Most bookings can be cancelled within 24-48 hours for a full refund.'
    },
    {
      question: 'How do I modify my booking?',
      answer: 'You can modify your booking by logging into your account and accessing your bookings. Some modifications may incur additional fees depending on the service provider\'s policies.'
    },
    {
      question: 'Is travel insurance recommended?',
      answer: 'Yes, we strongly recommend travel insurance to protect against unexpected cancellations, medical emergencies, or travel disruptions. We can help you find suitable coverage.'
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach our customer support team via phone, email, or live chat. Our support hours are Monday-Friday 9AM-6PM, and Saturday 10AM-4PM.'
    }
  ];

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: ChatBubbleLeftRightIcon,
      availability: 'Available 24/7',
      action: 'Start Chat',
      color: 'blue'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with a support agent',
      icon: PhoneIcon,
      availability: 'Mon-Fri 9AM-6PM',
      action: 'Call Now',
      color: 'green'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: EnvelopeIcon,
      availability: 'Response within 24 hours',
      action: 'Send Email',
      color: 'purple'
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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
            <QuestionMarkCircleIcon className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Find answers to your questions and get the help you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse Help Topics
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers organized by topic, or search for specific questions above
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 2) }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                    <category.icon className={`h-6 w-6 text-${category.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {category.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    {category.articles} articles
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Quick answers to the most common questions
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 4) }}
              >
                <Card className="overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-600">
              Our support team is here to help you with any questions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 5) }}
              >
                <Card className="p-6 text-center">
                  <div className={`w-12 h-12 bg-${option.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <option.icon className={`h-6 w-6 text-${option.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {option.description}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {option.availability}
                  </p>
                  <Button
                    className={`w-full bg-${option.color}-600 hover:bg-${option.color}-700`}
                  >
                    {option.action}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
