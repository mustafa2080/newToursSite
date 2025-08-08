import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CogIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Button from './Button';
import Card from './Card';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
        initializeServices(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const initializeServices = (prefs) => {
    // Initialize analytics if consented
    if (prefs.analytics && typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      }
    }

    // Initialize marketing services if consented
    if (prefs.marketing && typeof window !== 'undefined') {
      // Facebook Pixel, Google Ads, etc.
      if (window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        });
      }
    }

    // Initialize functional services if consented
    if (prefs.functional && typeof window !== 'undefined') {
      // Chat widgets, maps, etc.
      console.log('Functional cookies enabled');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    initializeServices(allAccepted);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    setPreferences(necessaryOnly);
    localStorage.setItem('cookieConsent', JSON.stringify(necessaryOnly));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    initializeServices(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (type, value) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function properly. They enable basic features like page navigation and access to secure areas.',
      required: true,
      examples: 'Authentication, security, shopping cart'
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'These cookies enhance your experience by remembering your preferences and providing personalized features.',
      required: false,
      examples: 'Language preferences, region settings, accessibility options'
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      required: false,
      examples: 'Google Analytics, page views, user behavior'
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'These cookies are used to deliver personalized advertisements and measure the effectiveness of advertising campaigns.',
      required: false,
      examples: 'Facebook Pixel, Google Ads, retargeting'
    }
  ];

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <Card className="mx-auto max-w-4xl bg-white shadow-2xl border-t-4 border-blue-600">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We use cookies to enhance your browsing experience, serve personalized content, 
                      and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                      You can customize your preferences by clicking "Cookie Settings".
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleAcceptAll}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Accept All
                      </Button>
                      <Button
                        onClick={handleAcceptNecessary}
                        variant="outline"
                      >
                        Necessary Only
                      </Button>
                      <Button
                        onClick={() => setShowSettings(true)}
                        variant="outline"
                        icon={<CogIcon />}
                      >
                        Cookie Settings
                      </Button>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <a 
                        href="/privacy-policy" 
                        className="text-blue-600 hover:text-blue-700 underline mr-4"
                      >
                        Privacy Policy
                      </a>
                      <a 
                        href="/cookie-policy" 
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Cookie Policy
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowSettings(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <CogIcon className="h-6 w-6 text-blue-600 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Cookie Preferences
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Description */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Customize your cookie preferences below. You can change these settings at any time, 
                        but some features may not work properly if certain cookies are disabled.
                      </p>
                    </div>
                  </div>

                  {/* Cookie Types */}
                  <div className="space-y-6">
                    {cookieTypes.map((type) => (
                      <div key={type.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{type.name}</h3>
                          <div className="flex items-center">
                            {type.required ? (
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Always Active
                              </span>
                            ) : (
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={preferences[type.id]}
                                  onChange={(e) => handlePreferenceChange(type.id, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                        <p className="text-xs text-gray-500">
                          <strong>Examples:</strong> {type.examples}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-8 flex flex-wrap gap-3 justify-end">
                    <Button
                      onClick={() => setShowSettings(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAcceptNecessary}
                      variant="outline"
                    >
                      Necessary Only
                    </Button>
                    <Button
                      onClick={handleSavePreferences}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Save Preferences
                    </Button>
                  </div>

                  {/* Links */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                    <a 
                      href="/privacy-policy" 
                      className="text-blue-600 hover:text-blue-700 underline mr-4"
                    >
                      Privacy Policy
                    </a>
                    <a 
                      href="/cookie-policy" 
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Cookie Policy
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsent;
