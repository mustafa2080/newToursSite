import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    // Listen for changes
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    reducedMotion,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme} ${reducedMotion ? 'reduce-motion' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Enhanced Motion Components with theme awareness
export const MotionDiv = ({ children, reducedMotion: customReducedMotion, ...props }) => {
  const { reducedMotion } = useTheme();
  const shouldReduceMotion = customReducedMotion ?? reducedMotion;

  if (shouldReduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return <motion.div {...props}>{children}</motion.div>;
};

export const MotionSection = ({ children, reducedMotion: customReducedMotion, ...props }) => {
  const { reducedMotion } = useTheme();
  const shouldReduceMotion = customReducedMotion ?? reducedMotion;

  if (shouldReduceMotion) {
    return <section {...props}>{children}</section>;
  }

  return <motion.section {...props}>{children}</motion.section>;
};

// Theme-aware animation variants
export const themeVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },
  
  // Hover animations
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeOut' }
  },
  
  // Loading animations
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  },
  
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Accessibility-focused motion component
export const AccessibleMotion = ({ 
  children, 
  variant = 'fadeIn', 
  delay = 0,
  duration,
  ...props 
}) => {
  const { reducedMotion } = useTheme();
  
  if (reducedMotion) {
    return <div {...props}>{children}</div>;
  }

  const motionProps = {
    ...themeVariants[variant],
    transition: {
      ...themeVariants[variant].transition,
      delay,
      ...(duration && { duration })
    }
  };

  return (
    <motion.div {...motionProps} {...props}>
      {children}
    </motion.div>
  );
};

// Page transition wrapper
export const PageTransition = ({ children, className = '' }) => {
  const { reducedMotion } = useTheme();
  
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger container for lists
export const StaggerContainer = ({ children, className = '', delay = 0.1 }) => {
  const { reducedMotion } = useTheme();
  
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        animate: {
          transition: {
            staggerChildren: delay,
            delayChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
export const StaggerItem = ({ children, className = '' }) => {
  const { reducedMotion } = useTheme();
  
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={themeVariants.slideUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Theme toggle button component
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${isDark ? 'bg-primary-600' : 'bg-gray-200'}
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${isDark ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

export default ThemeProvider;
