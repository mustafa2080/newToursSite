// Seed Firebase with sample trips for testing
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const sampleTrips = [
  {
    title: 'Amazing Beach Adventure',
    slug: 'amazing-beach-adventure',
    description: 'Experience the most beautiful beaches with crystal clear waters and white sand. This 7-day adventure takes you through pristine coastlines, hidden coves, and vibrant coral reefs. Perfect for beach lovers and water sports enthusiasts.',
    shortDescription: 'Beautiful beaches with crystal clear waters and exciting water activities',
    price: 599,
    durationDays: 7,
    duration_days: 7,
    maxParticipants: 20,
    max_participants: 20,
    difficultyLevel: 'easy',
    difficulty_level: 'easy',
    status: 'active',
    featured: true,
    mainImage: 'https://picsum.photos/800/500?random=1',
    main_image: 'https://picsum.photos/800/500?random=1',
    images: [
      'https://picsum.photos/800/500?random=1',
      'https://picsum.photos/800/500?random=2',
      'https://picsum.photos/800/500?random=3'
    ],
    gallery: [
      'https://picsum.photos/800/500?random=1',
      'https://picsum.photos/800/500?random=2',
      'https://picsum.photos/800/500?random=3'
    ],
    location: 'Maldives',
    categoryName: 'Beach',
    category_name: 'Beach',
    included_services: [
      'Round-trip flights',
      'Beachfront accommodation',
      'Daily breakfast',
      'Snorkeling equipment',
      'Professional guide',
      'Airport transfers'
    ],
    excluded_services: [
      'Lunch and dinner',
      'Personal expenses',
      'Travel insurance',
      'Alcoholic beverages'
    ],
    itinerary: [
      {
        title: 'Arrival and Beach Welcome',
        description: 'Arrive at the resort, check-in, and enjoy a welcome drink on the beach.',
        activities: ['Airport pickup', 'Resort check-in', 'Welcome orientation', 'Sunset beach walk']
      },
      {
        title: 'Snorkeling Adventure',
        description: 'Explore the vibrant coral reefs and marine life.',
        activities: ['Snorkeling lesson', 'Coral reef exploration', 'Marine life photography', 'Beach lunch']
      },
      {
        title: 'Island Hopping',
        description: 'Visit nearby islands and discover hidden beaches.',
        activities: ['Boat trip', 'Island exploration', 'Local culture experience', 'Beach picnic']
      }
    ]
  },
  {
    title: 'Mountain Hiking Expedition',
    slug: 'mountain-hiking-expedition',
    description: 'Challenge yourself with this thrilling mountain hiking expedition. Trek through scenic trails, camp under the stars, and reach breathtaking summits with panoramic views.',
    shortDescription: 'Challenging mountain hikes with stunning summit views',
    price: 899,
    durationDays: 5,
    duration_days: 5,
    maxParticipants: 12,
    max_participants: 12,
    difficultyLevel: 'challenging',
    difficulty_level: 'challenging',
    status: 'active',
    featured: false,
    mainImage: 'https://picsum.photos/800/500?random=10',
    main_image: 'https://picsum.photos/800/500?random=10',
    images: [
      'https://picsum.photos/800/500?random=10',
      'https://picsum.photos/800/500?random=11',
      'https://picsum.photos/800/500?random=12'
    ],
    gallery: [
      'https://picsum.photos/800/500?random=10',
      'https://picsum.photos/800/500?random=11',
      'https://picsum.photos/800/500?random=12'
    ],
    location: 'Swiss Alps',
    categoryName: 'Adventure',
    category_name: 'Adventure',
    included_services: [
      'Professional mountain guide',
      'Camping equipment',
      'All meals during trek',
      'Safety equipment',
      'Transportation to trailhead',
      'Emergency support'
    ],
    excluded_services: [
      'Personal hiking gear',
      'Travel insurance',
      'Accommodation before/after trek',
      'Personal expenses'
    ],
    itinerary: [
      {
        title: 'Base Camp Setup',
        description: 'Meet the team, gear check, and set up base camp.',
        activities: ['Team introduction', 'Equipment check', 'Base camp setup', 'Safety briefing']
      },
      {
        title: 'Summit Attempt',
        description: 'Early morning start for the summit push.',
        activities: ['Pre-dawn departure', 'Summit climb', 'Peak celebration', 'Descent to camp']
      }
    ]
  },
  {
    title: 'Cultural City Tour',
    slug: 'cultural-city-tour',
    description: 'Immerse yourself in the rich history and vibrant culture of ancient cities. Visit museums, historical sites, local markets, and experience authentic cuisine.',
    shortDescription: 'Explore rich history and vibrant local culture',
    price: 399,
    durationDays: 4,
    duration_days: 4,
    maxParticipants: 25,
    max_participants: 25,
    difficultyLevel: 'easy',
    difficulty_level: 'easy',
    status: 'active',
    featured: true,
    mainImage: 'https://picsum.photos/800/500?random=20',
    main_image: 'https://picsum.photos/800/500?random=20',
    images: [
      'https://picsum.photos/800/500?random=20',
      'https://picsum.photos/800/500?random=21',
      'https://picsum.photos/800/500?random=22'
    ],
    gallery: [
      'https://picsum.photos/800/500?random=20',
      'https://picsum.photos/800/500?random=21',
      'https://picsum.photos/800/500?random=22'
    ],
    location: 'Rome, Italy',
    categoryName: 'Cultural',
    category_name: 'Cultural',
    included_services: [
      'Expert local guide',
      'Museum entrance fees',
      'Walking tours',
      'Traditional lunch',
      'Transportation',
      'Cultural workshops'
    ],
    excluded_services: [
      'Accommodation',
      'Dinner meals',
      'Personal shopping',
      'Optional activities'
    ],
    itinerary: [
      {
        title: 'Historical Center Tour',
        description: 'Explore the ancient heart of the city.',
        activities: ['Colosseum visit', 'Roman Forum tour', 'Pantheon exploration', 'Traditional lunch']
      },
      {
        title: 'Art and Culture Day',
        description: 'Discover world-class art and local traditions.',
        activities: ['Vatican Museums', 'Sistine Chapel', 'Local artisan workshop', 'Cooking class']
      }
    ]
  }
];

export const seedTrips = async () => {
  try {
    console.log('🌱 Starting to seed trips...');
    
    const tripsCollection = collection(db, 'trips');
    const results = [];
    
    for (const tripData of sampleTrips) {
      const tripWithTimestamp = {
        ...tripData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        averageRating: 0,
        reviewCount: 0,
        bookingCount: 0,
        viewCount: 0
      };
      
      const docRef = await addDoc(tripsCollection, tripWithTimestamp);
      results.push({
        id: docRef.id,
        title: tripData.title,
        slug: tripData.slug
      });
      
      console.log(`✅ Added trip: ${tripData.title} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Successfully seeded all trips!');
    console.log('📋 Created trips:', results);
    
    return {
      success: true,
      trips: results
    };
  } catch (error) {
    console.error('❌ Error seeding trips:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to run seeding from browser console
window.seedTrips = seedTrips;
