import React from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  SpeakerWaveIcon,
  HandRaisedIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const Accessibility = () => {
  const accessibilityFeatures = [
    {
      title: 'Visual Accessibility',
      icon: EyeIcon,
      color: 'blue',
      features: [
        'High contrast color schemes',
        'Scalable text and images',
        'Screen reader compatibility',
        'Alternative text for images',
        'Keyboard navigation support'
      ]
    },
    {
      title: 'Audio Accessibility',
      icon: SpeakerWaveIcon,
      color: 'green',
      features: [
        'Closed captions for videos',
        'Audio descriptions',
        'Visual indicators for sounds',
        'Adjustable audio controls',
        'Text alternatives for audio content'
      ]
    },
    {
      title: 'Motor Accessibility',
      icon: HandRaisedIcon,
      color: 'purple',
      features: [
        'Keyboard-only navigation',
        'Large clickable areas',
        'Customizable interface',
        'Voice control compatibility',
        'Reduced motion options'
      ]
    },
    {
      title: 'Cognitive Accessibility',
      icon: AdjustmentsHorizontalIcon,
      color: 'orange',
      features: [
        'Clear and simple language',
        'Consistent navigation',
        'Error prevention and correction',
        'Timeout extensions',
        'Help and documentation'
      ]
    }
  ];

  const assistiveTechnologies = [
    {
      name: 'Screen Readers',
      description: 'JAWS, NVDA, VoiceOver, TalkBack',
      compatibility: 'Fully Compatible'
    },
    {
      name: 'Voice Control',
      description: 'Dragon NaturallySpeaking, Voice Control',
      compatibility: 'Fully Compatible'
    },
    {
      name: 'Switch Navigation',
      description: 'Single-switch, multi-switch devices',
      compatibility: 'Compatible'
    },
    {
      name: 'Eye Tracking',
      description: 'Tobii, EyeGaze systems',
      compatibility: 'Compatible'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <HeartIcon className="h-16 w-16 mx-auto mb-6 text-purple-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Accessibility
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              We're committed to making travel accessible for everyone
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Accessibility Commitment
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Tours Platform is committed to ensuring digital accessibility for people with disabilities. 
                We continually improve the user experience for everyone and apply relevant accessibility standards 
                to ensure we provide equal access to information and functionality for all users.
              </p>
            </Card>
          </motion.div>

          {/* Accessibility Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Accessibility Features
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {accessibilityFeatures.map((feature, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <ul className="space-y-2">
                        {feature.features.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-600 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Assistive Technologies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Assistive Technology Compatibility
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {assistiveTechnologies.map((tech, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {tech.compatibility}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Standards Compliance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Standards & Guidelines
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-lg">WCAG</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">WCAG 2.1 AA</h3>
                  <p className="text-sm text-gray-600">Web Content Accessibility Guidelines compliance</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold text-lg">ADA</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">ADA Compliant</h3>
                  <p className="text-sm text-gray-600">Americans with Disabilities Act standards</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold text-lg">508</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Section 508</h3>
                  <p className="text-sm text-gray-600">Federal accessibility requirements</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Accessibility Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <Card className="p-8 bg-blue-50 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Accessibility Tools
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Use these tools to customize your browsing experience
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                  Adjust Text Size
                </Button>
                <Button variant="outline">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  High Contrast Mode
                </Button>
                <Button variant="outline">
                  <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                  Mobile View
                </Button>
                <Button variant="outline">
                  <SpeakerWaveIcon className="h-4 w-4 mr-2" />
                  Screen Reader Mode
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Accessibility Feedback
              </h2>
              <p className="text-gray-600 mb-6">
                We welcome your feedback on the accessibility of Tours Platform. Please let us know 
                if you encounter accessibility barriers or have suggestions for improvement.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Email:</strong> accessibility@tours.com</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p><strong>TTY:</strong> +1 (555) 123-4568</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
                  <p className="text-gray-600 text-sm">
                    We aim to respond to accessibility feedback within 2 business days. 
                    For urgent accessibility issues, please call our support line.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Accessibility;
