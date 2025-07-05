import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const CONTENT_COLLECTION = 'content';

// Get content by page
export const getContent = async (page) => {
  try {
    const contentRef = doc(db, CONTENT_COLLECTION, page);
    const contentDoc = await getDoc(contentRef);

    if (!contentDoc.exists()) {
      // Return default content if not found
      return {
        success: true,
        content: getDefaultContent(page),
      };
    }

    return {
      success: true,
      content: contentDoc.data(),
    };
  } catch (error) {
    console.error('Get content error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update content for a page
export const updateContent = async (page, contentData) => {
  try {
    const contentRef = doc(db, CONTENT_COLLECTION, page);
    
    const updatedData = {
      ...contentData,
      page,
      updatedAt: serverTimestamp(),
    };

    // Check if document exists
    const contentDoc = await getDoc(contentRef);
    
    if (!contentDoc.exists()) {
      // Create new document
      updatedData.createdAt = serverTimestamp();
      await setDoc(contentRef, updatedData);
    } else {
      // Update existing document
      await updateDoc(contentRef, updatedData);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update content error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all content pages
export const getAllContent = async () => {
  try {
    const pages = ['about', 'contact', 'privacy', 'terms'];
    const contentPromises = pages.map(page => getContent(page));
    const results = await Promise.all(contentPromises);
    
    const allContent = {};
    results.forEach((result, index) => {
      if (result.success) {
        allContent[pages[index]] = result.content;
      }
    });

    return {
      success: true,
      content: allContent,
    };
  } catch (error) {
    console.error('Get all content error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Default content for different pages
const getDefaultContent = (page) => {
  const defaults = {
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
        'Authenticity',
      ],
      team: [
        {
          name: 'John Smith',
          position: 'CEO & Founder',
          image: 'https://picsum.photos/300/300?random=1501',
          bio: 'Travel enthusiast with 15+ years of experience in the tourism industry.',
        },
        {
          name: 'Sarah Johnson',
          position: 'Head of Operations',
          image: 'https://picsum.photos/300/300?random=1502',
          bio: 'Expert in travel logistics and customer experience management.',
        },
      ],
      heroImage: 'https://picsum.photos/2070/1080?random=1503',
      stats: {
        yearsExperience: 15,
        destinations: 150,
        happyCustomers: 25000,
        teamMembers: 50,
      },
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Get in Touch',
      description: 'Have questions about your next adventure? We\'re here to help you plan the perfect trip.',
      address: '123 Travel Street, Adventure City, AC 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@tours.com',
      workingHours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
      mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890123!2d-74.00123456789012!3d40.71234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ0LjQiTiA3NMKwMDAnMDQuNCJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
      socialLinks: {
        facebook: 'https://facebook.com/tours',
        instagram: 'https://instagram.com/tours',
        twitter: 'https://twitter.com/tours',
        youtube: 'https://youtube.com/tours',
      },
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How We Protect Your Information',
      lastUpdated: new Date().toISOString(),
      sections: [
        {
          title: 'Information We Collect',
          content: 'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us.',
        },
        {
          title: 'How We Use Your Information',
          content: 'We use the information we collect to provide, maintain, and improve our services.',
        },
        {
          title: 'Information Sharing',
          content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.',
        },
        {
          title: 'Data Security',
          content: 'We implement appropriate security measures to protect your personal information.',
        },
        {
          title: 'Contact Us',
          content: 'If you have any questions about this Privacy Policy, please contact us at privacy@tours.com.',
        },
      ],
    },
    terms: {
      title: 'Terms of Service',
      subtitle: 'Terms and Conditions',
      lastUpdated: new Date().toISOString(),
      sections: [
        {
          title: 'Acceptance of Terms',
          content: 'By using our service, you agree to be bound by these terms and conditions.',
        },
        {
          title: 'Use of Service',
          content: 'You may use our service only for lawful purposes and in accordance with these terms.',
        },
        {
          title: 'Booking and Payment',
          content: 'All bookings are subject to availability and confirmation. Payment is required at the time of booking.',
        },
        {
          title: 'Cancellation Policy',
          content: 'Cancellation policies vary by trip and hotel. Please review the specific cancellation policy before booking.',
        },
        {
          title: 'Limitation of Liability',
          content: 'Our liability is limited to the amount paid for the service.',
        },
        {
          title: 'Contact Information',
          content: 'For questions about these terms, contact us at legal@tours.com.',
        },
      ],
    },
  };

  return defaults[page] || {};
};

// Get site settings
export const getSiteSettings = async () => {
  try {
    const settingsRef = doc(db, CONTENT_COLLECTION, 'settings');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      return {
        success: true,
        settings: getDefaultSettings(),
      };
    }

    return {
      success: true,
      settings: settingsDoc.data(),
    };
  } catch (error) {
    console.error('Get site settings error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update site settings
export const updateSiteSettings = async (settingsData) => {
  try {
    const settingsRef = doc(db, CONTENT_COLLECTION, 'settings');
    
    const updatedData = {
      ...settingsData,
      updatedAt: serverTimestamp(),
    };

    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      updatedData.createdAt = serverTimestamp();
      await setDoc(settingsRef, updatedData);
    } else {
      await updateDoc(settingsRef, updatedData);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update site settings error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Default site settings
const getDefaultSettings = () => {
  return {
    siteName: 'Tours',
    siteDescription: 'Discover amazing travel destinations and create unforgettable memories',
    logo: '',
    favicon: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxUploadSize: 10, // MB
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: '',
    },
    seo: {
      metaTitle: 'Tours - Amazing Travel Experiences',
      metaDescription: 'Discover breathtaking destinations and create unforgettable memories with our curated travel experiences.',
      metaKeywords: 'travel, tours, vacation, adventure, destinations',
      ogImage: '',
    },
    analytics: {
      googleAnalyticsId: '',
      facebookPixelId: '',
    },
    email: {
      fromName: 'Tours',
      fromEmail: 'noreply@tours.com',
      supportEmail: 'support@tours.com',
    },
  };
};
