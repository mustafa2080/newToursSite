/**
 * Search utilities for generating keywords and improving search functionality
 */

/**
 * Generate search keywords from text content
 */
export const generateSearchKeywords = (text) => {
  if (!text) return [];
  
  const keywords = new Set();
  
  // Split by common delimiters and clean
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  words.forEach(word => {
    keywords.add(word);
    
    // Add partial matches for longer words
    if (word.length > 4) {
      for (let i = 3; i <= word.length; i++) {
        keywords.add(word.substring(0, i));
      }
    }
  });
  
  return Array.from(keywords);
};

/**
 * Generate comprehensive search keywords for a trip
 */
export const generateTripSearchKeywords = (trip) => {
  const keywords = new Set();
  
  // Basic fields
  if (trip.title) keywords.add(...generateSearchKeywords(trip.title));
  if (trip.description) keywords.add(...generateSearchKeywords(trip.description));
  if (trip.short_description) keywords.add(...generateSearchKeywords(trip.short_description));
  if (trip.location) keywords.add(...generateSearchKeywords(trip.location));
  if (trip.destination) keywords.add(...generateSearchKeywords(trip.destination));
  
  // Category and difficulty
  if (trip.category_name) keywords.add(...generateSearchKeywords(trip.category_name));
  if (trip.difficulty_level) keywords.add(trip.difficulty_level.toLowerCase());
  
  // Highlights and included services
  if (trip.highlights) {
    trip.highlights.forEach(highlight => {
      keywords.add(...generateSearchKeywords(highlight));
    });
  }
  
  if (trip.included) {
    trip.included.forEach(service => {
      keywords.add(...generateSearchKeywords(service));
    });
  }
  
  // Itinerary
  if (trip.itinerary) {
    trip.itinerary.forEach(day => {
      if (day.title) keywords.add(...generateSearchKeywords(day.title));
      if (day.description) keywords.add(...generateSearchKeywords(day.description));
      if (day.activities) {
        day.activities.forEach(activity => {
          keywords.add(...generateSearchKeywords(activity));
        });
      }
    });
  }
  
  // Common travel terms
  keywords.add('trip', 'travel', 'tour', 'vacation', 'holiday', 'adventure');
  
  return Array.from(keywords);
};

/**
 * Generate comprehensive search keywords for a hotel
 */
export const generateHotelSearchKeywords = (hotel) => {
  const keywords = new Set();
  
  // Basic fields
  if (hotel.name) keywords.add(...generateSearchKeywords(hotel.name));
  if (hotel.description) keywords.add(...generateSearchKeywords(hotel.description));
  if (hotel.short_description) keywords.add(...generateSearchKeywords(hotel.short_description));
  if (hotel.location) keywords.add(...generateSearchKeywords(hotel.location));
  if (hotel.address) keywords.add(...generateSearchKeywords(hotel.address));
  if (hotel.full_address) keywords.add(...generateSearchKeywords(hotel.full_address));
  
  // Amenities and facilities
  if (hotel.amenities) {
    hotel.amenities.forEach(amenity => {
      keywords.add(...generateSearchKeywords(amenity));
    });
  }
  
  if (hotel.facilities) {
    hotel.facilities.forEach(facility => {
      keywords.add(...generateSearchKeywords(facility));
    });
  }
  
  // Room types
  if (hotel.room_types) {
    hotel.room_types.forEach(roomType => {
      keywords.add(...generateSearchKeywords(roomType));
    });
  }
  
  // Star rating
  if (hotel.star_rating) {
    keywords.add(`${hotel.star_rating}star`, `${hotel.star_rating} star`);
  }
  
  // Common hotel terms
  keywords.add('hotel', 'accommodation', 'stay', 'room', 'booking', 'resort');
  
  return Array.from(keywords);
};

/**
 * Update search keywords for existing documents
 */
export const updateDocumentSearchKeywords = async (db, collection, docId, data, type) => {
  try {
    let searchKeywords = [];
    
    if (type === 'trip') {
      searchKeywords = generateTripSearchKeywords(data);
    } else if (type === 'hotel') {
      searchKeywords = generateHotelSearchKeywords(data);
    } else {
      // Generic keyword generation
      const textFields = [data.title, data.name, data.description, data.content].filter(Boolean);
      textFields.forEach(text => {
        searchKeywords.push(...generateSearchKeywords(text));
      });
    }
    
    // Update document with search keywords
    const docRef = doc(db, collection, docId);
    await updateDoc(docRef, {
      searchKeywords: [...new Set(searchKeywords)], // Remove duplicates
      searchText: searchKeywords.join(' '), // For full-text search
      lastSearchUpdate: new Date()
    });
    
    console.log(`✅ Updated search keywords for ${type} ${docId}:`, searchKeywords.length, 'keywords');
    return searchKeywords;
    
  } catch (error) {
    console.error(`❌ Error updating search keywords for ${type} ${docId}:`, error);
    return [];
  }
};

/**
 * Batch update search keywords for all documents in a collection
 */
export const batchUpdateSearchKeywords = async (db, collectionName, type) => {
  try {
    console.log(`🔄 Starting batch update for ${collectionName}...`);
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    const batch = writeBatch(db);
    let updateCount = 0;
    
    snapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      let searchKeywords = [];
      
      if (type === 'trip') {
        searchKeywords = generateTripSearchKeywords(data);
      } else if (type === 'hotel') {
        searchKeywords = generateHotelSearchKeywords(data);
      } else {
        const textFields = [data.title, data.name, data.description, data.content].filter(Boolean);
        textFields.forEach(text => {
          searchKeywords.push(...generateSearchKeywords(text));
        });
      }
      
      if (searchKeywords.length > 0) {
        batch.update(docSnapshot.ref, {
          searchKeywords: [...new Set(searchKeywords)],
          searchText: searchKeywords.join(' '),
          lastSearchUpdate: new Date()
        });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Updated search keywords for ${updateCount} documents in ${collectionName}`);
    } else {
      console.log(`ℹ️ No documents to update in ${collectionName}`);
    }
    
    return updateCount;
    
  } catch (error) {
    console.error(`❌ Error in batch update for ${collectionName}:`, error);
    return 0;
  }
};

/**
 * Search query preprocessing
 */
export const preprocessSearchQuery = (query) => {
  if (!query) return '';
  
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 100);
};

/**
 * Highlight search terms in text
 */
export const highlightSearchTerms = (text, searchTerms) => {
  if (!text || !searchTerms || searchTerms.length === 0) return text;
  
  let highlightedText = text;
  
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
};

export default {
  generateSearchKeywords,
  generateTripSearchKeywords,
  generateHotelSearchKeywords,
  updateDocumentSearchKeywords,
  batchUpdateSearchKeywords,
  preprocessSearchQuery,
  highlightSearchTerms
};
