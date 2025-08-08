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
import { getContent, updateContent, getAllContent } from '../../services/firebase/content';
import imageStorageService from '../../services/firebase/imageStorage';
import { formatFileSize, validateImageFile } from '../../utils/imageStorage';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [compressionStats, setCompressionStats] = useState(null);

  // Sample gallery images
  const sampleGalleryImages = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  ];

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
      console.log('🔄 Loading content from Firebase...');

      // Load all content from Firebase
      const result = await getAllContent();

      if (result.success) {
        setContent(result.content);
        console.log('✅ Content loaded successfully:', result.content);
      } else {
        console.error('❌ Error loading content:', result.error);
        // Use default content if Firebase fails
        const aboutResult = await getContent('about');
        const contactResult = await getContent('contact');

        setContent({
          about: aboutResult.success ? aboutResult.content : getDefaultAboutContent(),
          contact: contactResult.success ? contactResult.content : getDefaultContactContent(),
        });
      }
    } catch (error) {
      console.error('❌ Error loading content:', error);
      // Fallback to default content
      setContent({
        about: getDefaultAboutContent(),
        contact: getDefaultContactContent(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAboutContent = () => ({
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
  });

  const getDefaultContactContent = () => ({
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

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving content to Firebase...');

      // Save each content section to Firebase
      const savePromises = Object.entries(content).map(async ([page, pageContent]) => {
        const result = await updateContent(page, pageContent);
        if (!result.success) {
          throw new Error(`Failed to save ${page}: ${result.error}`);
        }
        return result;
      });

      await Promise.all(savePromises);

      console.log('✅ Content saved successfully');
      alert('Content saved successfully!');
    } catch (error) {
      console.error('❌ Error saving content:', error);
      alert('Error saving content: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSampleContent = async () => {
    if (!window.confirm('This will add sample content to Firebase. Continue?')) {
      return;
    }

    try {
      setSaving(true);
      console.log('📝 Adding sample content to Firebase...');

      // Sample content for About page
      const aboutContent = {
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
            bio: 'Travel enthusiast with 15+ years of experience in the tourism industry.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Sarah Johnson',
            position: 'Head of Operations',
            bio: 'Expert in travel logistics and customer experience management.',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          },
        ],
        hero_image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        ],
      };

      // Sample content for Contact page
      const contactContent = {
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
      };

      // Save sample content
      await updateContent('about', aboutContent);
      await updateContent('contact', contactContent);

      // Update local state
      setContent({
        about: aboutContent,
        contact: contactContent,
      });

      console.log('✅ Sample content added successfully');
      alert('Sample content added successfully!');
    } catch (error) {
      console.error('❌ Error adding sample content:', error);
      alert('Error adding sample content: ' + error.message);
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

  // Gallery functions
  const addGalleryImage = async () => {
    if (!newImageUrl.trim()) return;

    // Validate URL
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    if (!urlPattern.test(newImageUrl)) {
      alert('Please enter a valid image URL (jpg, png, gif, webp)');
      return;
    }

    try {
      setUploadingImage(true);
      console.log('📤 Compressing and storing image from URL...');

      // Store compressed image in Firebase
      const result = await imageStorageService.storeImageFromUrl(newImageUrl, {
        folder: 'gallery',
        category: 'gallery',
        description: 'Gallery image added from URL'
      });

      if (result.success) {
        // Add the stored image data to gallery
        const imageData = {
          id: result.id,
          base64: result.data.base64,
          name: result.data.name,
          compressedSize: result.data.compressedSize,
          originalSize: result.data.originalSize,
          compressionRatio: result.data.compressionRatio
        };

        const updatedContent = {
          ...content,
          about: {
            ...content.about,
            gallery: [...(content.about.gallery || []), imageData]
          }
        };

        setContent(updatedContent);
        setNewImageUrl('');
        setCompressionStats(result.compression);

        console.log('✅ Image compressed and added to gallery');
        alert(`Image added successfully!\nCompression: ${result.compression.ratio}% (${formatFileSize(result.compression.originalSize)} → ${formatFileSize(result.compression.compressedSize)})`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error adding image:', error);
      alert('Error adding image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeGalleryImage = async (index) => {
    const imageToRemove = content.about.gallery[index];

    try {
      // If it's a stored image object with ID, delete from Firebase
      if (typeof imageToRemove === 'object' && imageToRemove.id) {
        console.log('🗑️ Deleting image from Firebase:', imageToRemove.id);
        const result = await imageStorageService.deleteImage(imageToRemove.id);

        if (!result.success) {
          console.warn('⚠️ Failed to delete from Firebase, removing from gallery anyway');
        }
      }

      // Remove from gallery
      const updatedContent = {
        ...content,
        about: {
          ...content.about,
          gallery: content.about.gallery.filter((_, i) => i !== index)
        }
      };

      setContent(updatedContent);
      console.log('✅ Image removed from gallery at index:', index);
    } catch (error) {
      console.error('❌ Error removing image:', error);
      alert('Error removing image: ' + error.message);
    }
  };

  const addSampleImage = async (imageUrl) => {
    // Check if image already exists
    const existingImage = content.about.gallery?.find(img =>
      (typeof img === 'string' && img === imageUrl) ||
      (typeof img === 'object' && img.originalUrl === imageUrl)
    );

    if (existingImage) {
      alert('This image is already in the gallery');
      return;
    }

    try {
      setUploadingImage(true);
      console.log('📤 Compressing and storing sample image...');

      // Store compressed image in Firebase
      const result = await imageStorageService.storeImageFromUrl(imageUrl, {
        folder: 'gallery',
        category: 'gallery',
        description: 'Sample gallery image'
      });

      if (result.success) {
        // Add the stored image data to gallery
        const imageData = {
          id: result.id,
          base64: result.data.base64,
          name: result.data.name,
          compressedSize: result.data.compressedSize,
          originalSize: result.data.originalSize,
          compressionRatio: result.data.compressionRatio,
          originalUrl: imageUrl
        };

        const updatedContent = {
          ...content,
          about: {
            ...content.about,
            gallery: [...(content.about.gallery || []), imageData]
          }
        };

        setContent(updatedContent);
        console.log('✅ Sample image compressed and added to gallery');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error adding sample image:', error);
      alert('Error adding sample image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setUploadingImage(true);
      console.log('📤 Processing uploaded files...');

      for (const file of files) {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(`${file.name}: ${validation.error}`);
          continue;
        }

        // Store compressed image in Firebase
        const result = await imageStorageService.storeImageFile(file, {
          folder: 'gallery',
          category: 'gallery',
          description: `Uploaded gallery image: ${file.name}`
        });

        if (result.success) {
          // Add the stored image data to gallery
          const imageData = {
            id: result.id,
            base64: result.data.base64,
            name: result.data.name,
            compressedSize: result.data.compressedSize,
            originalSize: result.data.originalSize,
            compressionRatio: result.data.compressionRatio
          };

          const updatedContent = {
            ...content,
            about: {
              ...content.about,
              gallery: [...(content.about.gallery || []), imageData]
            }
          };

          setContent(updatedContent);
          console.log(`✅ ${file.name} compressed and added to gallery`);
        } else {
          console.error(`❌ Error processing ${file.name}:`, result.error);
          alert(`Error processing ${file.name}: ${result.error}`);
        }
      }

      // Reset file input
      event.target.value = '';
      alert('Files processed successfully!');
    } catch (error) {
      console.error('❌ Error processing files:', error);
      alert('Error processing files: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
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
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {(!content.about || !content.contact) && (
            <Button
              onClick={addSampleContent}
              loading={saving}
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              Add Sample Content
            </Button>
          )}
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
                  value={content.contact.social_links?.facebook || ''}
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
                  value={content.contact.social_links?.instagram || ''}
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
                  value={content.contact.social_links?.twitter || ''}
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
                  value={content.contact.social_links?.youtube || ''}
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

      {/* Gallery Content */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery Management</h3>
            <p className="text-gray-600 mb-6">
              Manage your website's image gallery. Add, remove, and organize images for display on your site.
            </p>

            {/* Current Gallery Images */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Current Gallery Images</h4>
              {content.about.gallery && content.about.gallery.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {content.about.gallery.map((image, index) => {
                    // Handle both old URL format and new compressed format
                    const imageUrl = typeof image === 'string' ? image : image.base64;
                    const isCompressed = typeof image === 'object';

                    return (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center">
                          <button
                            onClick={() => removeGalleryImage(index)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 mb-2"
                          >
                            Remove
                          </button>
                          {isCompressed && (
                            <div className="text-white text-xs text-center">
                              <div>{formatFileSize(image.compressedSize)}</div>
                              <div>{image.compressionRatio}% compressed</div>
                            </div>
                          )}
                        </div>
                        {isCompressed && (
                          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            Compressed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No images in gallery yet</p>
                </div>
              )}
            </div>

            {/* Upload from Device */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Upload from Device</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Select images from your device. They will be automatically compressed and stored.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="gallery-file-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="gallery-file-upload"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      uploadingImage
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    }`}
                  >
                    {uploadingImage ? 'Processing...' : 'Select Images'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Max 10MB per file. Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            </div>

            {/* Add New Image from URL */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Add from URL</h4>
              <div className="flex gap-4">
                <input
                  type="url"
                  placeholder="Enter image URL..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={uploadingImage}
                />
                <Button
                  onClick={addGalleryImage}
                  disabled={!newImageUrl.trim() || uploadingImage}
                  loading={uploadingImage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Image
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter a valid image URL. It will be compressed and stored automatically.
              </p>
            </div>

            {/* Compression Stats */}
            {compressionStats && (
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Last Compression Stats</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Original Size:</span>
                      <p className="text-green-700">{formatFileSize(compressionStats.originalSize)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Compressed Size:</span>
                      <p className="text-green-700">{formatFileSize(compressionStats.compressedSize)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Savings:</span>
                      <p className="text-green-700">{compressionStats.ratio}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Images */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Sample Images</h4>
              <p className="text-sm text-gray-600 mb-3">Click to add and compress sample images:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sampleGalleryImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !uploadingImage && addSampleImage(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Sample ${index + 1}`}
                      className="w-full h-20 object-cover rounded border border-gray-200 hover:border-blue-500 transition-colors"
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                        {uploadingImage ? 'Processing...' : 'Click to add'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Sample images will be compressed and stored in the database automatically.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
