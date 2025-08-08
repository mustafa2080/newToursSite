import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  NewspaperIcon,
  TrophyIcon,
  UsersIcon,
  GlobeAltIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Press = () => {
  const [activeTab, setActiveTab] = useState('news');

  // Press releases data
  const pressReleases = [
    {
      id: 1,
      title: 'Tours Platform Launches Revolutionary Travel Experience System',
      date: '2024-01-15',
      excerpt: 'Our new platform introduces innovative features that transform how travelers discover and book their perfect adventures.',
      category: 'Product Launch',
      downloadUrl: '#',
    },
    {
      id: 2,
      title: 'Partnership with Leading Hotels Expands Global Reach',
      date: '2023-12-10',
      excerpt: 'Strategic partnerships with premium hotel chains bring exclusive accommodations to our platform.',
      category: 'Partnership',
      downloadUrl: '#',
    },
    {
      id: 3,
      title: 'Sustainable Tourism Initiative Wins Industry Award',
      date: '2023-11-20',
      excerpt: 'Our commitment to eco-friendly travel practices recognized by the Global Tourism Council.',
      category: 'Award',
      downloadUrl: '#',
    },
  ];

  // Media coverage
  const mediaCoverage = [
    {
      id: 1,
      publication: 'Travel Weekly',
      title: 'The Future of Digital Travel Booking',
      date: '2024-01-20',
      url: '#',
      logo: 'https://picsum.photos/120/60?random=1',
    },
    {
      id: 2,
      publication: 'Tourism Today',
      title: 'Innovative Platforms Reshaping Travel Industry',
      date: '2024-01-10',
      url: '#',
      logo: 'https://picsum.photos/120/60?random=2',
    },
    {
      id: 3,
      publication: 'Digital Travel News',
      title: 'Customer-First Approach Drives Success',
      date: '2023-12-15',
      url: '#',
      logo: 'https://picsum.photos/120/60?random=3',
    },
  ];

  // Company statistics
  const stats = [
    { label: 'Active Users', value: '50K+', icon: UsersIcon },
    { label: 'Destinations', value: '200+', icon: GlobeAltIcon },
    { label: 'Partner Hotels', value: '1,000+', icon: TrophyIcon },
    { label: 'Bookings Completed', value: '25K+', icon: ChartBarIcon },
  ];

  // Press kit resources
  const pressKitResources = [
    {
      name: 'Company Logo Pack',
      description: 'High-resolution logos in various formats',
      type: 'ZIP',
      size: '2.5 MB',
      downloadUrl: '#',
    },
    {
      name: 'Brand Guidelines',
      description: 'Complete brand identity and usage guidelines',
      type: 'PDF',
      size: '1.8 MB',
      downloadUrl: '#',
    },
    {
      name: 'Executive Photos',
      description: 'Professional headshots of leadership team',
      type: 'ZIP',
      size: '5.2 MB',
      downloadUrl: '#',
    },
    {
      name: 'Product Screenshots',
      description: 'High-quality platform interface images',
      type: 'ZIP',
      size: '8.1 MB',
      downloadUrl: '#',
    },
  ];

  const tabs = [
    { id: 'news', name: 'Press Releases', icon: NewspaperIcon },
    { id: 'coverage', name: 'Media Coverage', icon: DocumentTextIcon },
    { id: 'kit', name: 'Press Kit', icon: PhotoIcon },
    { id: 'contact', name: 'Media Contact', icon: UsersIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Press & Media Center
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 max-w-3xl mx-auto mb-8"
            >
              Stay updated with the latest news, announcements, and media resources from Tours Platform
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download Press Kit
              </Button>
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Media Contact
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Press Releases Tab */}
            {activeTab === 'news' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Press Releases</h2>
                <div className="grid gap-6">
                  {pressReleases.map((release) => (
                    <Card key={release.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {release.category}
                            </span>
                            <span className="ml-3 text-sm text-gray-500">
                              {new Date(release.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {release.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {release.excerpt}
                          </p>
                        </div>
                        <Button
                          size="small"
                          variant="outline"
                          className="ml-4"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Media Coverage Tab */}
            {activeTab === 'coverage' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Coverage</h2>
                <div className="grid gap-6">
                  {mediaCoverage.map((article) => (
                    <Card key={article.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={article.logo}
                            alt={article.publication}
                            className="h-12 w-24 object-contain bg-gray-100 rounded"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {article.publication} • {new Date(article.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Read Article
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Press Kit Tab */}
            {activeTab === 'kit' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Press Kit Resources</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {pressKitResources.map((resource, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {resource.name}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {resource.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium mr-2">
                              {resource.type}
                            </span>
                            <span>{resource.size}</span>
                          </div>
                        </div>
                        <Button
                          size="small"
                          className="ml-4"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Media Contact Tab */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Press Inquiries</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">Sarah Johnson</p>
                        <p className="text-gray-600">Director of Communications</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email: press@tours.com</p>
                        <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Response time: Within 24 hours</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Partnership Inquiries</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">Michael Chen</p>
                        <p className="text-gray-600">Head of Business Development</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email: partnerships@tours.com</p>
                        <p className="text-gray-600">Phone: +1 (555) 123-4568</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Response time: Within 48 hours</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Guidelines</h3>
                  <div className="prose text-gray-600">
                    <ul className="space-y-2">
                      <li>• Please use our official company name "Tours Platform" in all references</li>
                      <li>• High-resolution logos and images are available in our press kit</li>
                      <li>• For interviews, please provide questions 24 hours in advance</li>
                      <li>• We're available for phone, video, or in-person interviews</li>
                      <li>• Please send us a copy of published articles for our records</li>
                    </ul>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Press;
