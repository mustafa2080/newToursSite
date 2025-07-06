import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const HotelDataViewer = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHotelData();
  }, [hotelId]);

  const loadHotelData = async () => {
    try {
      setLoading(true);
      const hotelDoc = await getDoc(doc(db, 'hotels', hotelId || 'CYpHPacVjd8hJSZiKuDu'));
      
      if (hotelDoc.exists()) {
        const data = hotelDoc.data();
        setHotel({ id: hotelDoc.id, ...data });
      } else {
        setError('Hotel not found');
      }
    } catch (error) {
      console.error('Error loading hotel:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading hotel data...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!hotel) return <div className="p-4">No hotel data found</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🏨 Hotel Data Viewer</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Hotel ID: {hotel.id}</h3>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold mb-2">Raw Hotel Data:</h4>
        <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded border">
          {JSON.stringify(hotel, null, 2)}
        </pre>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-3">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {hotel.name || 'N/A'}</div>
            <div><strong>Slug:</strong> {hotel.slug || 'N/A'}</div>
            <div><strong>Description:</strong> {hotel.description ? hotel.description.substring(0, 100) + '...' : 'N/A'}</div>
            <div><strong>Short Description:</strong> {hotel.short_description || hotel.shortDescription || 'N/A'}</div>
            <div><strong>Price per Night:</strong> {hotel.price_per_night || hotel.pricePerNight || 'N/A'}</div>
            <div><strong>Star Rating:</strong> {hotel.star_rating || hotel.starRating || 'N/A'}</div>
            <div><strong>Status:</strong> {hotel.status || 'N/A'}</div>
            <div><strong>Featured:</strong> {hotel.featured ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-bold text-green-900 mb-3">Location Information</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Address:</strong> {hotel.address || 'N/A'}</div>
            <div><strong>Location:</strong> {hotel.location || 'N/A'}</div>
            <div><strong>City:</strong> {hotel.city || 'N/A'}</div>
            <div><strong>Country:</strong> {hotel.country || 'N/A'}</div>
            <div><strong>Coordinates:</strong> {hotel.coordinates ? `${hotel.coordinates.lat}, ${hotel.coordinates.lng}` : 'N/A'}</div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-bold text-purple-900 mb-3">Images</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Main Image:</strong> {hotel.main_image || hotel.mainImage || 'N/A'}</div>
            <div><strong>Gallery:</strong> {hotel.gallery ? `${hotel.gallery.length} images` : 'N/A'}</div>
            {hotel.main_image && (
              <img 
                src={hotel.main_image} 
                alt="Hotel" 
                className="w-full h-32 object-cover rounded mt-2"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>
        </div>

        {/* Room Types */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-bold text-yellow-900 mb-3">Room Types</h4>
          <div className="space-y-2 text-sm">
            {hotel.room_types || hotel.roomTypes ? (
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(hotel.room_types || hotel.roomTypes, null, 2)}
              </pre>
            ) : (
              <div>No room types defined</div>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-bold text-red-900 mb-3">Amenities</h4>
          <div className="space-y-2 text-sm">
            {hotel.amenities ? (
              <div className="flex flex-wrap gap-1">
                {hotel.amenities.map((amenity, index) => (
                  <span key={index} className="bg-red-200 px-2 py-1 rounded text-xs">
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <div>No amenities listed</div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-bold text-indigo-900 mb-3">Statistics</h4>
          <div className="space-y-2 text-sm">
            <div><strong>View Count:</strong> {hotel.viewCount || hotel.view_count || 0}</div>
            <div><strong>Booking Count:</strong> {hotel.bookingCount || hotel.booking_count || 0}</div>
            <div><strong>Average Rating:</strong> {hotel.averageRating || hotel.average_rating || 0}</div>
            <div><strong>Review Count:</strong> {hotel.reviewCount || hotel.review_count || 0}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-bold mb-2">All Available Fields:</h4>
        <div className="text-xs grid grid-cols-3 gap-2">
          {Object.keys(hotel).sort().map(key => (
            <div key={key} className="bg-white p-1 rounded">
              <strong>{key}:</strong> {typeof hotel[key]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelDataViewer;
