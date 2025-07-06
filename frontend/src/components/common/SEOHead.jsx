import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = 'summary_large_image',
  schemaMarkup,
  noindex = false,
  nofollow = false,
  children
}) => {
  const siteTitle = 'Premium Tours';
  const siteDescription = 'Discover amazing destinations and create unforgettable memories with our curated travel experiences.';
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://premiumtours.com';
  const defaultImage = `${siteUrl}/images/og-default.jpg`;

  // Construct full title
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Use provided values or fallback to defaults
  const metaDescription = description || siteDescription;
  const metaKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;
  const canonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  
  // Open Graph
  const ogTitleFinal = ogTitle || title || siteTitle;
  const ogDescriptionFinal = ogDescription || metaDescription;
  const ogImageFinal = ogImage || defaultImage;
  
  // Twitter
  const twitterTitleFinal = twitterTitle || ogTitleFinal;
  const twitterDescriptionFinal = twitterDescription || ogDescriptionFinal;
  const twitterImageFinal = twitterImage || ogImageFinal;

  // Robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <meta name="robots" content={robotsContent.join(', ')} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitleFinal} />
      <meta property="og:description" content={ogDescriptionFinal} />
      <meta property="og:image" content={ogImageFinal} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitleFinal} />
      <meta name="twitter:description" content={twitterDescriptionFinal} />
      <meta name="twitter:image" content={twitterImageFinal} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content={siteTitle} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://picsum.photos" />
      
      {/* Schema.org JSON-LD */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {typeof schemaMarkup === 'string' ? schemaMarkup : JSON.stringify(schemaMarkup)}
        </script>
      )}
      
      {/* Default Schema.org for the site */}
      {!schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": siteTitle,
            "description": siteDescription,
            "url": siteUrl,
            "logo": `${siteUrl}/images/logo.png`,
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-555-123-4567",
              "contactType": "customer service",
              "availableLanguage": "English"
            },
            "sameAs": [
              "https://facebook.com/premiumtours",
              "https://twitter.com/premiumtours",
              "https://instagram.com/premiumtours"
            ]
          })}
        </script>
      )}
      
      {/* Additional custom head elements */}
      {children}
    </Helmet>
  );
};

// Helper function to generate trip schema
export const generateTripSchema = (trip) => {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": trip.title,
    "description": trip.description,
    "image": trip.main_image,
    "offers": {
      "@type": "Offer",
      "price": trip.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "provider": {
      "@type": "TravelAgency",
      "name": "Premium Tours"
    },
    "duration": `P${trip.duration_days}D`,
    "maximumAttendeeCapacity": trip.max_participants,
    "aggregateRating": trip.average_rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": trip.average_rating,
      "reviewCount": trip.review_count
    } : undefined
  };
};

// Helper function to generate hotel schema
export const generateHotelSchema = (hotel) => {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.name,
    "description": hotel.description,
    "image": hotel.main_image,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": hotel.city,
      "addressCountry": hotel.country || "Unknown"
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": hotel.star_rating
    },
    "priceRange": `$${hotel.price_per_night}`,
    "aggregateRating": hotel.average_rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": hotel.average_rating,
      "reviewCount": hotel.review_count
    } : undefined,
    "amenityFeature": hotel.amenities?.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity
    }))
  };
};

// Helper function to generate breadcrumb schema
export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

// Helper function to generate FAQ schema
export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export default SEOHead;
