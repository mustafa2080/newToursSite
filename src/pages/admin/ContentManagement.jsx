import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PhotoIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [content, setContent] = useState({
    about: {
      title: '',
      subtitle: '',
      description: '',
      mission: '',
      vision: '',
      values: [],
      team: [],
      hero_image: '',
      gallery: [],
    },
    contact: {
      title: '',
      subtitle: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      working_hours: '',
      map_embed: '',
      social_links: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'about', name: 'About Page', icon: DocumentTextIcon },
    { id: 'contact', name: 'Contact Page', icon: DocumentTextIcon },
    { id: 'gallery', name: 'Gallery', icon: PhotoIcon },
  ];

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API
      setTimeout(() => {
        setContent({
          about: {
            title: 'About Tours',
            subtitle: 'Your Gateway to Amazing Adventures',
            description: 'We are passionate about creating unforgettable travel experiences that connect you with the world\'s most beautiful destinations.',
            mission: 'To provide exceptional travel experiences that inspire, educate, and create lasting memories.',
            vision: 'To be the world\'s most trusted travel companion, making extraordinary journeys accessible to everyone.',
            values: [
              'Customer First',
              'Sustainable Tourism',
              'Cultural Respect',
              'Safety & Security',
              'Innovation',
            ],
            team: [
              {
                name: 'John Smith',
                position: 'CEO & Founder',
                image: 'https://picsum.photos/300/300?random=1801',
                bio: 'Travel enthusiast with 15+ years of experience in the tourism industry.',
              },
              {
                name: 'Sarah Johnson',
                position: 'Head of Operations',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                bio: 'Expert in travel logistics and customer experience management.',
              },
            ],
            hero_image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            gallery: [],
          },
          contact: {
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
          },
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading content:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateNestedContent = (section, parentField, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...prev[section][parentField],
          [field]: value,
        },
      },
    }));
  };

  const addValue = (section, field) => {
    const newValue = prompt('Enter new value:');
    if (newValue) {
      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...prev[section][field], newValue],
        },
      }));
    }
  };

  const removeValue = (section, field, index) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index),
      },
    }));
  };

  const addTeamMember = () => {
    const newMember = {
      name: '',
      position: '',
      image: '',
      bio: '',
    };
    setContent(prev => ({
      ...prev,
      about: {
        ...prev.about,
        team: [...prev.about.team, newMember],
      },
    }));
  };

  const updateTeamMember = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      about: {
        ...prev.about,
        team: prev.about.team.map((member, i) => 
          i === index ? { ...member, [field]: value } : member
        ),
      },
    }));
  };

  const removeTeamMember = (index) => {
    setContent(prev => ({
      ...prev,
      about: {
        ...prev.about,
        team: prev.about.team.filter((_, i) => i !== index),
      },
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" text="Loading content..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage website content and pages</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={handleSave}
            loading={saving}
            icon={<CheckIcon />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 inline mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* About Page Content */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={content.about.title}
                  onChange={(e) => updateContent('about', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={content.about.subtitle}
                  onChange={(e) => updateContent('about', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={content.about.description}
                onChange={(e) => updateContent('about', 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mission & Vision</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission
                </label>
                <textarea
                  rows={3}
                  value={content.about.mission}
                  onChange={(e) => updateContent('about', 'mission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vision
                </label>
                <textarea
                  rows={3}
                  value={content.about.vision}
                  onChange={(e) => updateContent('about', 'vision', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Company Values</h3>
              <Button
                size="small"
                variant="outline"
                icon={<PlusIcon />}
                onClick={() => addValue('about', 'values')}
              >
                Add Value
              </Button>
            </div>
            <div className="space-y-2">
              {content.about.values.map((value, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const newValues = [...content.about.values];
                      newValues[index] = e.target.value;
                      updateContent('about', 'values', newValues);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    size="small"
                    variant="danger"
                    icon={<TrashIcon />}
                    onClick={() => removeValue('about', 'values', index)}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <Button
                size="small"
                variant="outline"
                icon={<PlusIcon />}
                onClick={addTeamMember}
              >
                Add Team Member
              </Button>
            </div>
            <div className="space-y-6">
              {content.about.team.map((member, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Team Member {index + 1}</h4>
                    <Button
                      size="small"
                      variant="danger"
                      icon={<TrashIcon />}
                      onClick={() => removeTeamMember(index)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        value={member.position}
                        onChange={(e) => updateTeamMember(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={member.image}
                        onChange={(e) => updateTeamMember(index, 'image', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        rows={2}
                        value={member.bio}
                        onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Contact Page Content */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={content.contact.title}
                  onChange={(e) => updateContent('contact', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={content.contact.subtitle}
                  onChange={(e) => updateContent('contact', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={content.contact.description}
                onChange={(e) => updateContent('contact', 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={content.contact.address}
                  onChange={(e) => updateContent('contact', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Hours
                </label>
                <textarea
                  rows={3}
                  value={content.contact.working_hours}
                  onChange={(e) => updateContent('contact', 'working_hours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={content.contact.phone}
                  onChange={(e) => updateContent('contact', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => updateContent('contact', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={content.contact.social_links.facebook}
                  onChange={(e) => updateNestedContent('contact', 'social_links', 'facebook', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={content.contact.social_links.instagram}
                  onChange={(e) => updateNestedContent('contact', 'social_links', 'instagram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={content.contact.social_links.twitter}
                  onChange={(e) => updateNestedContent('contact', 'social_links', 'twitter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube
                </label>
                <input
                  type="url"
                  value={content.contact.social_links.youtube}
                  onChange={(e) => updateNestedContent('contact', 'social_links', 'youtube', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Embed</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps Embed Code
              </label>
              <textarea
                rows={4}
                value={content.contact.map_embed}
                onChange={(e) => updateContent('contact', 'map_embed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your Google Maps embed code here..."
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
