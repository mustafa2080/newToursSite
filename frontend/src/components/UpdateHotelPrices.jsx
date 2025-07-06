import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useParams } from 'react-router-dom';

const UpdateHotelPrices = () => {
  const { hotelId } = useParams();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const updatePrices = async () => {
    try {
      setUpdating(true);
      setMessage('');

      const hotelRef = doc(db, 'hotels', hotelId || 'CYpHPacVjd8hJSZiKuDu');
      
      // Update with realistic prices
      const updateData = {
        price_per_night: 250,
        room_types: {
          standard: {
            name: 'Standard Room',
            description: 'Comfortable room with essential amenities',
            price: 200,
            capacity: 2,
            features: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'TV']
          },
          deluxe: {
            name: 'Deluxe Room',
            description: 'Spacious room with premium amenities',
            price: 300,
            capacity: 3,
            features: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'TV', 'Mini Bar', 'City View']
          },
          suite: {
            name: 'Executive Suite',
            description: 'Luxurious suite with separate living area',
            price: 500,
            capacity: 4,
            features: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'TV', 'Mini Bar', 'Ocean View', 'Balcony', 'Room Service']
          },
          family: {
            name: 'Family Room',
            description: 'Large room perfect for families',
            price: 350,
            capacity: 6,
            features: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'TV', 'Kitchenette', 'Extra Beds']
          }
        },
        amenities: [
          'Free WiFi',
          'Swimming Pool',
          'Fitness Center',
          'Restaurant',
          'Bar',
          'Room Service',
          'Concierge',
          'Parking',
          'Spa',
          'Business Center',
          'Airport Shuttle',
          'Pet Friendly'
        ],
        policies: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          cancellation: 'Free cancellation up to 24 hours before check-in',
          pets: 'Pets allowed with additional fee',
          smoking: 'Non-smoking property'
        },
        phone: '+1 (555) 123-4567',
        email: 'info@hotel.com',
        website: 'https://hotel.com',
        discount: 15,
        special_offer: 'Book 3 nights and get 1 night free!',
        early_bird_discount: 20,
        taxes: '12% + service charge',
        service_charge: '$25 per night',
        additional_fees: 'Resort fee: $30 per night'
      };

      await updateDoc(hotelRef, updateData);
      
      setMessage('✅ Hotel prices and details updated successfully!');
      
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error updating hotel:', error);
      setMessage('❌ Error updating hotel: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🏨 Update Hotel Prices & Details</h2>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-4">
          This tool will update the hotel with realistic prices and complete details including:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-4">
          <li>• Base price: $250/night</li>
          <li>• Standard Room: $200/night</li>
          <li>• Deluxe Room: $300/night</li>
          <li>• Executive Suite: $500/night</li>
          <li>• Family Room: $350/night</li>
          <li>• Complete amenities list</li>
          <li>• Hotel policies</li>
          <li>• Contact information</li>
          <li>• Special offers and discounts</li>
        </ul>
      </div>

      <button
        onClick={updatePrices}
        disabled={updating}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          updating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {updating ? 'Updating...' : 'Update Hotel Prices & Details'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-bold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• This will overwrite existing room types and pricing</li>
          <li>• The page will automatically refresh after update</li>
          <li>• Make sure you're updating the correct hotel</li>
          <li>• Hotel ID: {hotelId || 'CYpHPacVjd8hJSZiKuDu'}</li>
        </ul>
      </div>
    </div>
  );
};

export default UpdateHotelPrices;
