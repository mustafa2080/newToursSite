import React from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  EyeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const CookiesPolicy = () => {
  const cookieTypes = [
    {
      type: 'Essential Cookies',
      icon: ShieldCheckIcon,
      color: 'green',
      description: 'Required for the website to function properly',
      examples: ['Login sessions', 'Shopping cart', 'Security features'],
      canDisable: false
    },
    {
      type: 'Analytics Cookies',
      icon: ChartBarIcon,
      color: 'blue',
      description: 'Help us understand how visitors use our website',
      examples: ['Page views', 'User behavior', 'Performance metrics'],
      canDisable: true
    },
    {
      type: 'Marketing Cookies',
      icon: EyeIcon,
      color: 'purple',
      description: 'Used to deliver personalized advertisements',
      examples: ['Ad targeting', 'Social media integration', 'Remarketing'],
      canDisable: true
    },
    {
      type: 'Preference Cookies',
      icon: AdjustmentsHorizontalIcon,
      color: 'orange',
      description: 'Remember your settings and preferences',
      examples: ['Language settings', 'Currency preferences', 'Theme choices'],
      canDisable: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <CogIcon className="h-16 w-16 mx-auto mb-6 text-orange-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Cookie Policy
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Learn about how we use cookies to improve your experience
            </p>
            <div className="mt-6 text-sm text-orange-200">
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
                What Are Cookies?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                understanding how you use our site.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We use different types of cookies for various purposes, and you have control over 
                which ones you accept.
              </p>
            </Card>
          </motion.div>

          {/* Cookie Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              {cookieTypes.map((cookie, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-${cookie.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <cookie.icon className={`h-6 w-6 text-${cookie.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cookie.type}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          cookie.canDisable 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cookie.canDisable ? 'Optional' : 'Required'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {cookie.description}
                      </p>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Examples:</h4>
                        <ul className="text-sm text-gray-600">
                          {cookie.examples.map((example, exIndex) => (
                            <li key={exIndex} className="flex items-center">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Cookie Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Managing Your Cookie Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Through Our Website
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You can manage your cookie preferences using our cookie consent banner 
                    or by accessing the cookie settings in your account.
                  </p>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                    Manage Cookie Preferences
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Through Your Browser
                  </h3>
                  <p className="text-gray-600 mb-3">
                    You can also control cookies through your browser settings:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Third-Party Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Third-Party Cookies
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may also use third-party services that set their own cookies. These include:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Google Analytics</h3>
                  <p className="text-sm text-gray-600">Helps us understand website usage and performance</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Social Media</h3>
                  <p className="text-sm text-gray-600">Enables social sharing and embedded content</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Processors</h3>
                  <p className="text-sm text-gray-600">Secure payment processing and fraud prevention</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Customer Support</h3>
                  <p className="text-sm text-gray-600">Live chat and help desk functionality</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-8 bg-orange-50 border-orange-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions About Cookies?
              </h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@tours.com</p>
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

export default CookiesPolicy;
