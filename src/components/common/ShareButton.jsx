import React, { useState } from 'react';
import { ShareIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const ShareButton = ({ 
  title, 
  url = window.location.href, 
  description = '', 
  size = 'small',
  variant = 'ghost',
  className = ''
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const shareData = {
    title: title,
    text: description,
    url: url
  };

  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShowShareMenu(false);
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to custom share menu
        setShowShareMenu(true);
      }
    } else {
      // Show custom share menu
      setShowShareMenu(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (error) {
      console.log('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    }
  };

  const shareToSocial = (platform) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setShowShareMenu(false);
      }, 1500);
    }
  };

  const buttonSizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const buttonVariantClasses = {
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white'
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`
          inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200
          ${buttonSizeClasses[size]}
          ${buttonVariantClasses[variant]}
          ${className}
        `}
      >
        <ShareIcon className="h-4 w-4" />
        Share
      </button>

      {/* Custom Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowShareMenu(false)}
            />
            
            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Share this page</h3>

                {/* Success Message */}
                {shareSuccess && (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <CheckIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Shared successfully!</span>
                    </div>
                  </div>
                )}
                
                {/* Copy Link */}
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors mb-2"
                >
                  {copied ? (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5 text-gray-600" />
                  )}
                  <span className={`font-medium ${copied ? 'text-green-600' : 'text-gray-700'}`}>
                    {copied ? 'Link copied!' : 'Copy link'}
                  </span>
                </button>

                {/* Social Media Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => shareToSocial('facebook')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors group"
                  >
                    <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      f
                    </div>
                    <span className="text-sm font-medium">Facebook</span>
                  </button>

                  <button
                    onClick={() => shareToSocial('twitter')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 text-blue-400 transition-colors group"
                  >
                    <div className="w-5 h-5 bg-blue-400 rounded text-white text-xs flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      𝕏
                    </div>
                    <span className="text-sm font-medium">Twitter</span>
                  </button>

                  <button
                    onClick={() => shareToSocial('whatsapp')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors group"
                  >
                    <div className="w-5 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      W
                    </div>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => shareToSocial('telegram')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors group"
                  >
                    <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      T
                    </div>
                    <span className="text-sm font-medium">Telegram</span>
                  </button>

                  <button
                    onClick={() => shareToSocial('linkedin')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors group"
                  >
                    <div className="w-5 h-5 bg-blue-700 rounded text-white text-xs flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      in
                    </div>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </button>

                  <button
                    onClick={() => shareToSocial('email')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors group"
                  >
                    <div className="w-5 h-5 bg-gray-600 rounded text-white text-xs flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      @
                    </div>
                    <span className="text-sm font-medium">Email</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareButton;
