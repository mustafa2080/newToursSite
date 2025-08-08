// Premium Tours Design System
// White and Blue Theme with comprehensive color palette and design tokens

export const colors = {
  // Primary Blue Palette
  primary: {
    50: '#eff6ff',   // Very light blue for backgrounds
    100: '#dbeafe',  // Light blue for hover states
    200: '#bfdbfe',  // Soft blue for borders
    300: '#93c5fd',  // Medium light blue
    400: '#60a5fa',  // Medium blue
    500: '#3b82f6',  // Main brand blue
    600: '#2563eb',  // Darker blue for buttons
    700: '#1d4ed8',  // Dark blue for text
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Darkest blue
  },

  // Secondary Colors
  secondary: {
    50: '#f8fafc',   // Almost white
    100: '#f1f5f9',  // Very light gray
    200: '#e2e8f0',  // Light gray
    300: '#cbd5e1',  // Medium light gray
    400: '#94a3b8',  // Medium gray
    500: '#64748b',  // Main gray
    600: '#475569',  // Dark gray
    700: '#334155',  // Very dark gray
    800: '#1e293b',  // Almost black
    900: '#0f172a',  // Black
  },

  // Accent Colors
  accent: {
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#f0f9ff',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
    }
  },

  // Semantic Colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text Colors
  text: {
    primary: '#1e293b',
    secondary: '#475569',
    tertiary: '#64748b',
    inverse: '#ffffff',
    muted: '#94a3b8',
  },

  // Border Colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
  }
};

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    serif: ['Playfair Display', 'Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  }
};

// Spacing Scale (based on 4px grid)
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
};

// Border Radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

// Animation & Transitions
export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Framer Motion variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    
    slideLeft: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    
    stagger: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
  },
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Component Variants
export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary[600],
      color: colors.white,
      borderColor: colors.primary[600],
      '&:hover': {
        backgroundColor: colors.primary[700],
        borderColor: colors.primary[700],
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${colors.primary[200]}`,
      },
    },
    
    secondary: {
      backgroundColor: colors.white,
      color: colors.primary[600],
      borderColor: colors.primary[600],
      '&:hover': {
        backgroundColor: colors.primary[50],
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${colors.primary[200]}`,
      },
    },
    
    outline: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
      borderColor: colors.border.medium,
      '&:hover': {
        backgroundColor: colors.background.secondary,
        borderColor: colors.border.dark,
      },
    },
    
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
      borderColor: 'transparent',
      '&:hover': {
        backgroundColor: colors.background.secondary,
      },
    },
  },
  
  card: {
    default: {
      backgroundColor: colors.white,
      borderColor: colors.border.light,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.sm,
      '&:hover': {
        boxShadow: shadows.md,
      },
    },
    
    elevated: {
      backgroundColor: colors.white,
      borderColor: 'transparent',
      borderRadius: borderRadius.xl,
      boxShadow: shadows.lg,
      '&:hover': {
        boxShadow: shadows.xl,
      },
    },
  },
};

// Accessibility
export const accessibility = {
  focusRing: {
    width: '2px',
    style: 'solid',
    color: colors.primary[500],
    offset: '2px',
  },
  
  minTouchTarget: '44px',
  
  colorContrast: {
    // WCAG AA compliant ratios
    normal: 4.5,
    large: 3,
    enhanced: 7, // AAA
  },
};

// Export the complete design system
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  components,
  accessibility,
};
