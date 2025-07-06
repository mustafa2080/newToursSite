import React from 'react';
import { motion } from 'framer-motion';
import {
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';

const CancellationPolicy = () => {
  const cancellationTiers = [
    {
      period: '24+ hours before',
      refund: '100%',
      description: 'Full refund for cancellations made 24 hours or more before the scheduled date',
      color: 'green',
      icon: CheckCircleIcon
    },
    {
      period: '12-24 hours before',
      refund: '50%',
      description: 'Partial refund for cancellations made between 12-24 hours before',
      color: 'yellow',
      icon: ClockIcon
    },
    {
      period: 'Less than 12 hours',
      refund: '0%',
      description: 'No refund for cancellations made less than 12 hours before',
      color: 'red',
      icon: XCircleIcon
    }
  ];

  const specialCircumstances = [
    {
      title: 'Medical Emergency',
      description: 'Full refund with valid medical documentation',
      icon: ExclamationTriangleIcon,
      color: 'blue'
    },
    {
      title: 'Natural Disasters',
      description: 'Full refund for weather-related cancellations',
      icon: ExclamationTriangleIcon,
      color: 'orange'
    },
    {
      title: 'Travel Restrictions',
      description: 'Full refund for government-imposed travel bans',
      icon: ExclamationTriangleIcon,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <XCircleIcon className="h-16 w-16 mx-auto mb-6 text-red-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Cancellation Policy
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Understand our cancellation terms and refund policies
            </p>
            <div className="mt-6 text-sm text-red-200">
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
                General Cancellation Terms
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our cancellation policy is designed to be fair to both travelers and service providers. 
                Refund amounts depend on when you cancel relative to your booking date.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Please note that some bookings may have different cancellation terms as specified by individual service providers.
              </p>
            </Card>
          </motion.div>

          {/* Cancellation Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Standard Cancellation Schedule
            </h2>
            <div className="grid gap-6">
              {cancellationTiers.map((tier, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-${tier.color}-100 rounded-lg flex items-center justify-center`}>
                        <tier.icon className={`h-6 w-6 text-${tier.color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tier.period}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {tier.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold text-${tier.color}-600`}>
                        {tier.refund}
                      </div>
                      <div className="text-sm text-gray-500">refund</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Special Circumstances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Special Circumstances
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {specialCircumstances.map((circumstance, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className={`w-12 h-12 bg-${circumstance.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <circumstance.icon className={`h-6 w-6 text-${circumstance.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {circumstance.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {circumstance.description}
                  </p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* How to Cancel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How to Cancel Your Booking
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Log into your account</h3>
                    <p className="text-gray-600 text-sm">Access your Tours Platform account and navigate to "My Bookings"</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Select your booking</h3>
                    <p className="text-gray-600 text-sm">Find the booking you want to cancel and click "View Details"</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Request cancellation</h3>
                    <p className="text-gray-600 text-sm">Click "Cancel Booking" and follow the prompts to complete the process</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Receive confirmation</h3>
                    <p className="text-gray-600 text-sm">You'll receive an email confirmation with refund details within 24 hours</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <Card className="p-8 bg-yellow-50 border-yellow-200">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Important Notes
                  </h2>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Refunds are processed to the original payment method within 5-10 business days</li>
                    <li>• Some third-party services may have different cancellation policies</li>
                    <li>• Group bookings may have special cancellation terms</li>
                    <li>• Travel insurance may cover additional cancellation scenarios</li>
                    <li>• Cancellation fees may apply for certain premium services</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-8 bg-blue-50 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need Help with Cancellation?
              </h2>
              <p className="text-gray-600 mb-4">
                Our customer service team is here to help with any cancellation questions:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> cancellations@tours.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Hours:</strong> Monday-Friday 9AM-6PM, Saturday 10AM-4PM</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CancellationPolicy;
