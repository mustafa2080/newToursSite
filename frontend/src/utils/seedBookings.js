// Seed Firebase with sample bookings for testing
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const sampleBookings = [
  {
    // Trip Booking 1
    type: 'trip',
    tripId: 'trip-1',
    tripTitle: 'Amazing Beach Adventure',
    tripSlug: 'amazing-beach-adventure',
    location: 'Maldives',
    
    // Customer Info
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    
    // Booking Details
    numberOfParticipants: 2,
    participants: 2,
    selectedDate: new Date('2024-03-15'),
    travelDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-22'),
    duration: 7,
    
    // Pricing
    pricePerPerson: 599,
    totalPrice: 1198,
    totalAmount: 1198,
    
    // Status
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    
    // Dates
    bookingDate: new Date('2024-02-10'),
    
    // Additional Info
    specialRequests: 'Vegetarian meals for both participants',
    emergencyContact: {
      name: 'Jane Smith',
      phone: '+1-555-0124',
      relationship: 'Spouse'
    }
  },
  {
    // Hotel Booking 1
    type: 'hotel',
    hotelId: 'hotel-1',
    hotelName: 'Luxury Beach Resort',
    hotelSlug: 'luxury-beach-resort',
    location: 'Maldives',
    
    // Customer Info
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0234',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    
    // Booking Details
    numberOfGuests: 2,
    numberOfRooms: 1,
    roomType: 'deluxe',
    checkInDate: new Date('2024-04-10'),
    checkOutDate: new Date('2024-04-15'),
    numberOfNights: 5,
    nights: 5,
    
    // Pricing
    pricePerNight: 450,
    totalPrice: 2250,
    totalAmount: 2250,
    
    // Status
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'bank_transfer',
    
    // Dates
    bookingDate: new Date('2024-03-01'),
    
    // Additional Info
    specialRequests: 'Ocean view room preferred, late check-in',
    guestDetails: [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        age: 32,
        passportNumber: 'US123456789'
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        age: 35,
        passportNumber: 'US987654321'
      }
    ]
  },
  {
    // Trip Booking 2
    type: 'trip',
    tripId: 'trip-2',
    tripTitle: 'Mountain Hiking Expedition',
    tripSlug: 'mountain-hiking-expedition',
    location: 'Swiss Alps',
    
    // Customer Info
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '+1-555-0345',
    customerName: 'David Wilson',
    customerEmail: 'david.wilson@email.com',
    
    // Booking Details
    numberOfParticipants: 1,
    participants: 1,
    selectedDate: new Date('2024-05-20'),
    travelDate: new Date('2024-05-20'),
    endDate: new Date('2024-05-25'),
    duration: 5,
    
    // Pricing
    pricePerPerson: 899,
    totalPrice: 899,
    totalAmount: 899,
    
    // Status
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'paypal',
    
    // Dates
    bookingDate: new Date('2024-03-05'),
    
    // Additional Info
    specialRequests: 'Experienced hiker, no dietary restrictions',
    emergencyContact: {
      name: 'Lisa Wilson',
      phone: '+1-555-0346',
      relationship: 'Sister'
    }
  },
  {
    // Hotel Booking 2
    type: 'hotel',
    hotelId: 'hotel-2',
    hotelName: 'City Center Business Hotel',
    hotelSlug: 'city-center-business-hotel',
    location: 'New York City',
    
    // Customer Info
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@email.com',
    phone: '+1-555-0456',
    customerName: 'Emily Brown',
    customerEmail: 'emily.brown@email.com',
    
    // Booking Details
    numberOfGuests: 1,
    numberOfRooms: 1,
    roomType: 'executive',
    checkInDate: new Date('2024-03-25'),
    checkOutDate: new Date('2024-03-28'),
    numberOfNights: 3,
    nights: 3,
    
    // Pricing
    pricePerNight: 320,
    totalPrice: 960,
    totalAmount: 960,
    
    // Status
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'credit_card',
    
    // Dates
    bookingDate: new Date('2024-02-15'),
    
    // Additional Info
    specialRequests: 'Business center access required',
    cancellationReason: 'Travel plans changed',
    cancellationDate: new Date('2024-03-20')
  },
  {
    // Trip Booking 3
    type: 'trip',
    tripId: 'trip-3',
    tripTitle: 'Cultural City Tour',
    tripSlug: 'cultural-city-tour',
    location: 'Rome, Italy',
    
    // Customer Info
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@email.com',
    phone: '+1-555-0567',
    customerName: 'Michael Davis',
    customerEmail: 'michael.davis@email.com',
    
    // Booking Details
    numberOfParticipants: 4,
    participants: 4,
    selectedDate: new Date('2024-06-01'),
    travelDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-05'),
    duration: 4,
    
    // Pricing
    pricePerPerson: 399,
    totalPrice: 1596,
    totalAmount: 1596,
    
    // Status
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    
    // Dates
    bookingDate: new Date('2024-03-10'),
    
    // Additional Info
    specialRequests: 'Family with 2 children (ages 8 and 12), need child-friendly activities',
    emergencyContact: {
      name: 'Jennifer Davis',
      phone: '+1-555-0568',
      relationship: 'Spouse'
    }
  }
];

export const seedBookings = async () => {
  try {
    console.log('🌱 Starting to seed bookings...');
    
    const bookingsCollection = collection(db, 'bookings');
    const results = [];
    
    for (const bookingData of sampleBookings) {
      const bookingWithTimestamp = {
        ...bookingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Convert dates to proper format
        selectedDate: bookingData.selectedDate,
        travelDate: bookingData.travelDate,
        endDate: bookingData.endDate,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        bookingDate: bookingData.bookingDate,
        cancellationDate: bookingData.cancellationDate
      };
      
      const docRef = await addDoc(bookingsCollection, bookingWithTimestamp);
      results.push({
        id: docRef.id,
        type: bookingData.type,
        customerName: bookingData.customerName,
        itemName: bookingData.tripTitle || bookingData.hotelName,
        status: bookingData.status,
        amount: bookingData.totalAmount
      });
      
      console.log(`✅ Added ${bookingData.type} booking: ${bookingData.customerName} - ${bookingData.tripTitle || bookingData.hotelName} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Successfully seeded all bookings!');
    console.log('📋 Created bookings:', results);
    
    return {
      success: true,
      bookings: results
    };
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to run seeding from browser console
window.seedBookings = seedBookings;
