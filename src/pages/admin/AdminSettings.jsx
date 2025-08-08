import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  BellIcon,
  CurrencyDollarIcon,
  LanguageIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';

const AdminSettings = () => {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Tours',
      siteDescription: 'Discover amazing travel destinations and create unforgettable memories',
      logo: '',
      favicon: '',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
    },
    appearance: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      theme: 'light',
      customCSS: '',
    },
    localization: {
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      adminAlerts: true,
    },
    uploads: {
      maxUploadSize: 10, // MB
      supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
      compressionQuality: 80,
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: '',
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('🔧 Loading system settings...');

      const settingsSnapshot = await getDocs(collection(db, 'system_settings'));
      
      if (!settingsSnapshot.empty) {
        const settingsDoc = settingsSnapshot.docs[0];
        const data = settingsDoc.data();
        
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }

      console.log('✅ Settings loaded');
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section, newData) => {
    try {
      setSaving(true);
      console.log(`💾 Saving ${section} settings...`);

      const updatedSettings = {
        ...settings,
        [section]: newData
      };

      // Save to Firebase
      const settingsRef = collection(db, 'system_settings');
      const settingsSnapshot = await getDocs(settingsRef);

      if (settingsSnapshot.empty) {
        // Create new document
        await addDoc(settingsRef, {
          ...updatedSettings,
          updatedAt: new Date(),
          updatedBy: user?.uid || 'admin'
        });
      } else {
        // Update existing document
        const docRef = doc(db, 'system_settings', settingsSnapshot.docs[0].id);
        await updateDoc(docRef, {
          ...updatedSettings,
          updatedAt: new Date(),
          updatedBy: user?.uid || 'admin'
        });
      }

      // Update local state
      setSettings(updatedSettings);

      console.log('✅ Settings saved');
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'localization', name: 'Localization', icon: LanguageIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'uploads', name: 'File Uploads', icon: PhotoIcon },
    { id: 'social', name: 'Social Media', icon: GlobeAltIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure your application settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={loadSettings}
            className="flex items-center"
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings.general,
                      siteName: e.target.value
                    };
                    setSettings(prev => ({ ...prev, general: newSettings }));
                  }}
                  onBlur={() => saveSettings('general', settings.general)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings.general,
                      siteDescription: e.target.value
                    };
                    setSettings(prev => ({ ...prev, general: newSettings }));
                  }}
                  onBlur={() => saveSettings('general', settings.general)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-xs text-gray-500">Temporarily disable the site for maintenance</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings.general,
                      maintenanceMode: e.target.checked
                    };
                    setSettings(prev => ({ ...prev, general: newSettings }));
                    saveSettings('general', newSettings);
                  }}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Allow Registration</p>
                  <p className="text-xs text-gray-500">Allow new users to register</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.general.allowRegistration}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings.general,
                      allowRegistration: e.target.checked
                    };
                    setSettings(prev => ({ ...prev, general: newSettings }));
                    saveSettings('general', newSettings);
                  }}
                  className="rounded"
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'appearance' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={settings.appearance.primaryColor}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings.appearance,
                      primaryColor: e.target.value
                    };
                    setSettings(prev => ({ ...prev, appearance: newSettings }));
                    saveSettings('appearance', newSettings);
                  }}
                  className="w-20 h-10 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={settings.appearance.secondaryColor}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings.appearance,
                      secondaryColor: e.target.value
                    };
                    setSettings(prev => ({ ...prev, appearance: newSettings }));
                    saveSettings('appearance', newSettings);
                  }}
                  className="w-20 h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Add other tabs content here */}
      </div>
    </div>
  );
};

export default AdminSettings;
