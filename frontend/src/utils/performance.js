// Performance optimization utilities

// Lazy loading for images with intersection observer
export const createLazyImageObserver = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        if (srcset) {
          img.srcset = srcset;
          img.removeAttribute('data-srcset');
        }

        img.classList.remove('lazy');
        img.classList.add('loaded');
        
        // Stop observing this image
        this.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
};

// Debounce function for search and API calls
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Preload critical resources
export const preloadResource = (href, as, type = null, crossorigin = null) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  if (crossorigin) link.crossOrigin = crossorigin;
  
  document.head.appendChild(link);
};

// Preload images
export const preloadImages = (imageUrls) => {
  if (typeof window === 'undefined') return;

  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully:', registration);
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
};

// Cache API responses
class APICache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, data) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    return this.cache.delete(key);
  }
}

export const apiCache = new APICache();

// Enhanced fetch with caching and retry logic
export const cachedFetch = async (url, options = {}, useCache = true, retries = 3) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Try to get from cache first
  if (useCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }

  // Retry logic
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful GET requests
      if (useCache && (!options.method || options.method === 'GET')) {
        apiCache.set(cacheKey, data);
      }

      return { data, fromCache: false };
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Image optimization utilities
export const getOptimizedImageUrl = (originalUrl, width, height, quality = 80) => {
  if (!originalUrl) return '';
  
  // If it's already an optimized URL, return as is
  if (originalUrl.includes('w_') || originalUrl.includes('q_')) {
    return originalUrl;
  }

  // For Cloudinary URLs
  if (originalUrl.includes('cloudinary.com')) {
    const parts = originalUrl.split('/upload/');
    if (parts.length === 2) {
      const transforms = [];
      if (width) transforms.push(`w_${width}`);
      if (height) transforms.push(`h_${height}`);
      transforms.push(`q_${quality}`, 'f_auto');
      return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
    }
  }

  // For other image services, you can add similar logic
  return originalUrl;
};

// Generate responsive image srcset
export const generateSrcSet = (baseUrl, sizes = [320, 640, 768, 1024, 1280, 1920]) => {
  return sizes.map(size => 
    `${getOptimizedImageUrl(baseUrl, size)} ${size}w`
  ).join(', ');
};

// Measure and report performance metrics
export const measurePerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  // Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      switch (entry.entryType) {
        case 'largest-contentful-paint':
          console.log('LCP:', entry.startTime);
          break;
        case 'first-input':
          console.log('FID:', entry.processingStart - entry.startTime);
          break;
        case 'layout-shift':
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
          break;
      }
    });
  });

  // Observe different performance metrics
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (e) {
    // Fallback for browsers that don't support all metrics
    console.log('Some performance metrics not supported');
  }

  // Navigation timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
        console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        console.log('Time to First Byte:', navigation.responseStart - navigation.fetchStart);
      }
    }, 0);
  });
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;

  scripts.forEach(async (script) => {
    try {
      const response = await fetch(script.src);
      const size = parseInt(response.headers.get('content-length') || '0');
      totalSize += size;
      console.log(`Script: ${script.src.split('/').pop()} - ${(size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log(`Could not analyze: ${script.src}`);
    }
  });

  console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window === 'undefined' || !performance.memory) return;

  const logMemory = () => {
    const memory = performance.memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  };

  // Log memory usage every 30 seconds in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(logMemory, 30000);
  }

  return logMemory;
};

// Intersection Observer for analytics
export const createViewportObserver = (callback, options = {}) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    threshold: 0.5,
    rootMargin: '0px',
    ...options
  });
};

// Export all utilities
export default {
  createLazyImageObserver,
  debounce,
  throttle,
  preloadResource,
  preloadImages,
  registerServiceWorker,
  apiCache,
  cachedFetch,
  getOptimizedImageUrl,
  generateSrcSet,
  measurePerformance,
  analyzeBundleSize,
  monitorMemoryUsage,
  createViewportObserver
};
