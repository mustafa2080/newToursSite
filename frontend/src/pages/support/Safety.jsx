import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const Safety = () => {
  const safetyMeasures = [
    {
      title: 'Verified Partners',
      icon: ShieldCheckIcon,
      description: 'All our hotel and tour partners are thoroughly vetted and regularly audited for safety standards.',
      color: 'green'
    },
    {
      title: 'Travel Insurance',
      icon: HeartIcon,
      description: 'We strongly recommend comprehensive travel insurance and can help you find the right coverage.',
      color: 'blue'
    },
    {
      title: '24/7 Support',
      icon: PhoneIcon,
      description: 'Our emergency support team is available around the clock to assist you during your travels.',
      color: 'purple'
    },
    {
      title: 'Local Expertise',
      icon: MapPinIcon,
      description: 'Our local partners provide up-to-date safety information and guidance for each destination.',
      color: 'orange'
    }
  ];

  const emergencyContacts = [
    {
      region: 'North America',
      phone: '+1 (555) 911-HELP',
      email: 'emergency-na@tours.com'
    },
    {
      region: 'Europe',
      phone: '+44 20 7946 0958',
      email: 'emergency-eu@tours.com'
    },
    {
      region: 'Asia Pacific',
      phone: '+65 6123 4567',
      email: 'emergency-ap@tours.com'
    },
    {
      region: 'Rest of World',
      phone: '+1 (555) 911-HELP',
      email: 'emergency@tours.com'
    }
  ];

  const safetyTips = [
    {
      category: 'Before You Travel',
      tips: [
        'Research your destination\'s current safety conditions',
        'Register with your embassy or consulate',
        'Purchase comprehensive travel insurance',
        'Make copies of important documents',
        'Share your itinerary with family or friends',
        'Check visa and vaccination requirements'
      ]
    },
    {
      category: 'During Your Trip',
      tips: [
        'Keep emergency contacts easily accessible',
        'Stay aware of your surroundings',
        'Use hotel safes for valuables',
        'Follow local laws and customs',
        'Stay in touch with family regularly',
        'Trust your instincts if something feels wrong'
      ]
    },
    {
      category: 'Health & Medical',
      tips: [
        'Carry a basic first aid kit',
        'Know the location of nearest hospitals',
        'Bring necessary medications with prescriptions',
        'Stay hydrated and eat safely',
        'Protect yourself from sun exposure',
        'Be cautious with local water and food'
      ]
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
              Travel Safety
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Your safety is our top priority. Learn about our safety measures and travel tips.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Safety Measures */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Safety Commitment
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We implement comprehensive safety measures to ensure your peace of mind while traveling
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyMeasures.map((measure, index) => (
              <motion.div
                key={measure.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 2) }}
              >
                <Card className="p-6 text-center h-full">
                  <div className={`w-12 h-12 bg-${measure.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <measure.icon className={`h-6 w-6 text-${measure.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {measure.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {measure.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Emergency Contacts
            </h2>
            <p className="text-gray-600">
              24/7 emergency support numbers by region
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.region}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 4) }}
              >
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <GlobeAltIcon className="h-6 w-6 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contact.region}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">{contact.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      <span>{contact.email}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Card className="p-6 bg-red-50 border-red-200">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                In Case of Emergency
              </h3>
              <p className="text-gray-600 mb-4">
                Always contact local emergency services first (911, 112, etc.), then reach out to our emergency support team.
              </p>
              <Button className="bg-red-600 hover:bg-red-700">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Call Emergency Support
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Travel Safety Tips
            </h2>
            <p className="text-gray-600">
              Essential safety guidelines for a secure and enjoyable trip
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {safetyTips.map((section, index) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 7) }}
              >
                <Card className="p-6 h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {section.category}
                  </h3>
                  <ul className="space-y-3">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Card className="p-8">
              <UserGroupIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Additional Safety Resources
              </h2>
              <p className="text-gray-600 mb-6">
                Access more safety information and travel advisories from official sources
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline">
                  Government Travel Advisories
                </Button>
                <Button variant="outline">
                  Health & Vaccination Info
                </Button>
                <Button variant="outline">
                  Travel Insurance Guide
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Safety;
