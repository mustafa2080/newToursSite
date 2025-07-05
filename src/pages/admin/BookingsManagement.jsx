import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookmarkIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { bookingsAPI } from '../../utils/firebaseApi';
import { seedBookings } from '../../utils/seedBookings';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    revenue: 0,
    paid: 0,
    unpaid: 0,
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);

      console.log('🚀 Loading bookings for admin...');

      // First, let's check what's actually in the database
      const bookingsCollection = collection(db, 'bookings');
      const rawSnapshot = await getDocs(bookingsCollection);
      console.log('🔍 Raw Firebase data:');
      console.log('📊 Total documents in bookings collection:', rawSnapshot.size);

      let allBookings = [];
      rawSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const booking = { id: doc.id, ...data };
        allBookings.push(booking);


      });

      if (allBookings.length > 0) {
        console.log('✅ Using direct Firebase result:', allBookings.length);



        setBookings(allBookings);
        calculateStats(allBookings);
        return;
      }

      // Fallback to API
      const response = await bookingsAPI.getAll();
      console.log('Admin bookings response:', response);

      // Handle different response structures
      let bookingsData = [];
      if (response.success && response.data) {
        if (response.data.data) {
          bookingsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          bookingsData = response.data;
        }
      }

      setBookings(bookingsData);
      calculateStats(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const stats = {
      total: bookingsData.length,
      confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
      pending: bookingsData.filter(b => b.status === 'pending').length,
      cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
      paid: bookingsData.filter(b => (b.paymentStatus || 'pending') === 'paid').length,
      unpaid: bookingsData.filter(b => (b.paymentStatus || 'pending') !== 'paid').length,
      revenue: bookingsData
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0),
    };
    setStats(stats);
  };

  const filteredBookings = bookings.filter(booking => {
    const searchFields = [
      booking.id,
      booking.tripTitle || booking.hotelName || booking.itemName,
      booking.bookingReference,
      // mainBooker fields
      booking.mainBooker?.firstName,
      booking.mainBooker?.lastName,
      booking.mainBooker?.email,
      // participants fields
      ...(Array.isArray(booking.participants) ? booking.participants.map(p => [p.firstName, p.lastName, p.email]).flat() : []),
      // standard fields
      booking.firstName,
      booking.lastName,
      booking.email,
      booking.guestName,
      booking.guestEmail,
      booking.customerName,
      booking.customerEmail,
      // combined names
      booking.mainBooker ? `${booking.mainBooker.firstName || ''} ${booking.mainBooker.lastName || ''}`.trim() : '',
      Array.isArray(booking.participants) && booking.participants.length > 0 ? `${booking.participants[0].firstName || ''} ${booking.participants[0].lastName || ''}`.trim() : '',
      `${booking.firstName || ''} ${booking.lastName || ''}`.trim(),
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = searchTerm === '' || searchFields.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesType = filterType === 'all' || (booking.type || 'trip') === filterType;
    const matchesPayment = filterPayment === 'all' || (booking.paymentStatus || 'pending') === filterPayment;



    return matchesSearch && matchesStatus && matchesType && matchesPayment;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed', icon: CheckCircleIcon },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', icon: ClockIcon },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled', icon: XCircleIcon },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      refunded: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Refunded' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
    };

    const config = paymentConfig[paymentStatus] || paymentConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      trip: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Trip' },
      hotel: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Hotel' },
    };

    const config = typeConfig[type] || typeConfig.trip;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.update(bookingId, { status: newStatus });
      await loadBookings(); // Reload bookings
      console.log('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['ID', 'Type', 'Customer', 'Email', 'Item', 'Date', 'Status', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredBookings.map(booking => [
        booking.id,
        booking.type || 'trip',
        `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || booking.guestName || booking.customerName || 'Unknown',
        booking.email,
        booking.tripTitle || booking.hotelName,
        new Date(booking.selectedDate || booking.checkInDate || booking.bookingDate).toLocaleDateString(),
        booking.status,
        booking.totalPrice || booking.totalAmount || 0
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  const handleSeedBookings = async () => {
    if (window.confirm('This will add sample bookings to the database. Continue?')) {
      try {
        setSeeding(true);
        console.log('🌱 Starting to seed bookings...');

        const result = await seedBookings();
        console.log('🌱 Seed result:', result);

        if (result.success) {
          alert(`Successfully added ${result.bookings.length} sample bookings!`);
          await loadBookings(); // Reload the bookings list
        } else {
          alert(`Error adding bookings: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ Error seeding bookings:', error);
        alert('Error adding sample bookings. Check console for details.');
      } finally {
        setSeeding(false);
      }
    }
  };

  // Add a single test booking for quick testing
  const addTestBooking = async () => {
    try {
      setSeeding(true);
      console.log('🧪 Adding test booking...');

      const { createBooking } = await import('../../services/firebase/bookings');

      const testBooking = {
        userId: 'test-user-123',
        type: 'trip',
        tripTitle: 'Test Trip to Paris',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        selectedDate: new Date().toISOString(),
        numberOfParticipants: 2,
        totalPrice: 1500,
        status: 'pending',
        paymentStatus: 'pending',
        location: 'Paris, France',
        specialRequests: 'Test booking for payment management'
      };

      const result = await createBooking(testBooking);
      console.log('🧪 Test booking result:', result);

      if (result.success) {
        alert('Test booking added successfully!');
        await loadBookings();
      } else {
        alert(`Error adding test booking: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error adding test booking:', error);
      alert('Error adding test booking. Check console for details.');
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdatePaymentStatus = async (bookingId, newPaymentStatus, skipConfirm = false) => {
    console.log('🔄 Updating payment status:', { bookingId, newPaymentStatus, skipConfirm });

    if (!skipConfirm) {
      // Create a more user-friendly confirmation message
      const statusMessages = {
        'paid': 'PAID ✅ (Customer has completed payment)',
        'pending': 'PENDING ⏳ (Waiting for payment)',
        'refunded': 'REFUNDED 💰 (Money returned to customer)',
        'failed': 'FAILED ❌ (Payment unsuccessful)'
      };

      const confirmMessage = `Update Payment Status to: ${statusMessages[newPaymentStatus] || newPaymentStatus.toUpperCase()}

Booking ID: ${bookingId}

Click OK to confirm this change.`;

      if (!window.confirm(confirmMessage)) {
        console.log('❌ User cancelled payment status update');
        return;
      }
    }

    try {
      setUpdatingPayment(true);
      console.log('⏳ Starting payment status update...');

      // Import the updateBooking function
      const { updateBooking } = await import('../../services/firebase/bookings');
      console.log('✅ updateBooking function imported successfully');

      const updateData = {
        paymentStatus: newPaymentStatus,
        paymentUpdatedAt: new Date(),
        paymentUpdatedBy: 'admin'
      };

      console.log('📝 Update data:', updateData);

      const result = await updateBooking(bookingId, updateData);
      console.log('📊 Update result:', result);

      if (result.success) {
        console.log('✅ Payment status updated successfully');

        // Show success message with emoji
        const successMessages = {
          'paid': '✅ Payment marked as PAID! Customer has completed payment.',
          'pending': '⏳ Payment marked as PENDING. Waiting for customer payment.',
          'refunded': '💰 Payment marked as REFUNDED. Money returned to customer.',
          'failed': '❌ Payment marked as FAILED. Payment was unsuccessful.'
        };

        alert(successMessages[newPaymentStatus] || `Payment status updated to ${newPaymentStatus} successfully!`);
        await loadBookings(); // Reload the bookings list
        if (showBookingModal) {
          setShowBookingModal(false); // Close modal if open
        }
      } else {
        console.error('❌ Update failed:', result.error);
        alert(`Error updating payment status: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      alert(`Error updating payment status: ${error.message}`);
    } finally {
      setUpdatingPayment(false);
      console.log('🏁 Payment status update completed');
    }
  };

  // Quick payment status update without confirmation (for table buttons)
  const quickUpdatePaymentStatus = async (bookingId, newPaymentStatus) => {
    console.log('⚡ Quick payment status update:', { bookingId, newPaymentStatus });
    return handleUpdatePaymentStatus(bookingId, newPaymentStatus, true);
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    console.log('🔄 Updating booking status:', { bookingId, newStatus });

    if (!window.confirm(`Are you sure you want to change the booking status to ${newStatus}?`)) {
      console.log('❌ User cancelled booking status update');
      return;
    }

    try {
      setUpdatingPayment(true);
      console.log('⏳ Starting booking status update...');

      // Import the updateBooking function
      const { updateBooking } = await import('../../services/firebase/bookings');
      console.log('✅ updateBooking function imported successfully');

      const updateData = {
        status: newStatus,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: 'admin'
      };

      console.log('📝 Update data:', updateData);

      const result = await updateBooking(bookingId, updateData);
      console.log('📊 Update result:', result);

      if (result.success) {
        console.log('✅ Booking status updated successfully');
        alert(`Booking status updated to ${newStatus} successfully!`);
        await loadBookings(); // Reload the bookings list
        if (showBookingModal) {
          setShowBookingModal(false); // Close modal if open
        }
      } else {
        console.error('❌ Update failed:', result.error);
        alert(`Error updating booking status: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      alert(`Error updating booking status: ${error.message}`);
    } finally {
      setUpdatingPayment(false);
      console.log('🏁 Booking status update completed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600">Manage customer bookings and reservations</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            loading={seeding}
            onClick={addTestBooking}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            {seeding ? 'Adding...' : 'Add Test Booking'}
          </Button>
          <Button
            variant="outline"
            loading={seeding}
            onClick={handleSeedBookings}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            {seeding ? 'Adding Sample Bookings...' : 'Add Sample Bookings'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => loadBookings()}
            className="flex items-center"
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Bookings',
            value: stats.total,
            color: 'blue',
            icon: BookmarkIcon
          },
          {
            label: 'Confirmed',
            value: stats.confirmed,
            color: 'green',
            icon: CheckCircleIcon
          },
          {
            label: 'Pending',
            value: stats.pending,
            color: 'yellow',
            icon: ClockIcon
          },
          {
            label: 'Paid',
            value: stats.paid,
            color: 'green',
            icon: CurrencyDollarIcon
          },
          {
            label: 'Unpaid',
            value: stats.unpaid,
            color: 'red',
            icon: XCircleIcon
          },
          {
            label: 'Revenue',
            value: `$${stats.revenue.toLocaleString()}`,
            color: 'purple',
            icon: CurrencyDollarIcon
          },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <IconComponent className={`h-8 w-8 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                  <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Bookings</h3>
          <div className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by booking ID, customer, or item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="sm:w-32">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="trip">Trips</option>
              <option value="hotel">Hotels</option>
            </select>
          </div>
          <div className="sm:w-32">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="sm:w-32">
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="sm:w-auto">
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterType('all');
                setFilterPayment('all');
              }}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>



      {/* Bookings Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.id}
                      </div>
                      <div className="mt-1">
                        {getTypeBadge(booking.type || 'trip')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {(() => {
                          // Extract name from Firebase booking structure
                          const extractName = (booking) => {
                            // Try mainBooker first (most common)
                            if (booking.mainBooker) {
                              const name = `${booking.mainBooker.firstName || ''} ${booking.mainBooker.lastName || ''}`.trim();
                              if (name) return name;
                            }

                            // Try first participant
                            if (Array.isArray(booking.participants) && booking.participants.length > 0) {
                              const participant = booking.participants[0];
                              const name = `${participant.firstName || ''} ${participant.lastName || ''}`.trim();
                              if (name) return name;
                            }

                            // Try standard fields
                            const fullName = `${booking.firstName || ''} ${booking.lastName || ''}`.trim();
                            if (fullName) return fullName;

                            // Try other name fields
                            if (booking.guestName) return booking.guestName;
                            if (booking.customerName) return booking.customerName;
                            if (booking.name) return booking.name;

                            return `Customer #${booking.id?.substring(0, 8) || 'Unknown'}`;
                          };

                          return extractName(booking);
                        })()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(() => {
                          // Extract email from Firebase booking structure
                          const extractEmail = (booking) => {
                            // Try mainBooker first (most common)
                            if (booking.mainBooker?.email) {
                              return booking.mainBooker.email;
                            }

                            // Try first participant
                            if (Array.isArray(booking.participants) && booking.participants.length > 0) {
                              const participant = booking.participants[0];
                              if (participant.email) return participant.email;
                            }

                            // Try standard email fields
                            if (booking.email) return booking.email;
                            if (booking.guestEmail) return booking.guestEmail;
                            if (booking.customerEmail) return booking.customerEmail;

                            return 'No email';
                          };

                          return extractEmail(booking);
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.tripTitle || booking.hotelName || booking.itemName || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {booking.location || 'Location not specified'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        Travel: {new Date(booking.selectedDate || booking.checkInDate || booking.travelDate || booking.bookingDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Booked: {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-between">
                      <div>
                        {getPaymentBadge(booking.paymentStatus || 'pending')}
                      </div>
                      <div className="ml-2">
                        {booking.paymentStatus !== 'paid' ? (
                          <button
                            onClick={() => quickUpdatePaymentStatus(booking.id, 'paid')}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="Mark as Paid (Quick Update)"
                            disabled={updatingPayment}
                          >
                            {updatingPayment ? '⏳' : '💰 Paid'}
                          </button>
                        ) : (
                          <button
                            onClick={() => quickUpdatePaymentStatus(booking.id, 'pending')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="Mark as Pending (Quick Update)"
                            disabled={updatingPayment}
                          >
                            {updatingPayment ? '⏳' : '⏳ Unpaid'}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ${(booking.totalPrice || booking.totalAmount || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.numberOfParticipants || booking.numberOfGuests || booking.participants || 1} {(booking.numberOfParticipants || booking.numberOfGuests || booking.participants || 1) === 1 ? 'person' : 'people'}
                        {(booking.numberOfNights || booking.nights) && ` • ${booking.numberOfNights || booking.nights} nights`}
                        {booking.numberOfRooms && ` • ${booking.numberOfRooms} rooms`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => handleView(booking)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                        title="View Full Details & Manage"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>

                      {/* Booking Status Buttons */}
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50 transition-colors"
                            title="Confirm Booking"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                            title="Cancel Booking"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No bookings have been made yet. Add sample bookings to get started.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
            <div className="mt-6 space-x-3">
              <Button
                variant="outline"
                loading={seeding}
                onClick={addTestBooking}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                {seeding ? 'Adding...' : 'Add Test Booking'}
              </Button>
              <Button
                variant="outline"
                loading={seeding}
                onClick={handleSeedBookings}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {seeding ? 'Adding Sample Bookings...' : 'Add Sample Bookings'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <Modal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          title="Booking Details"
          size="large"
        >
          <div className="space-y-6">
            {/* Booking Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking ID</label>
                    <p className="text-sm text-gray-900">{selectedBooking.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-sm text-gray-900">{selectedBooking.type || 'trip'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Item</label>
                    <p className="text-sm text-gray-900">{selectedBooking.tripTitle || selectedBooking.hotelName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <div className="mt-1">{getPaymentBadge(selectedBooking.paymentStatus || 'pending')}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900">
                      {
                        selectedBooking.mainBooker
                          ? `${selectedBooking.mainBooker.firstName || ''} ${selectedBooking.mainBooker.lastName || ''}`.trim()
                          : Array.isArray(selectedBooking.participants) && selectedBooking.participants.length > 0
                          ? `${selectedBooking.participants[0].firstName || ''} ${selectedBooking.participants[0].lastName || ''}`.trim()
                          : `${selectedBooking.firstName || ''} ${selectedBooking.lastName || ''}`.trim() ||
                            selectedBooking.guestName ||
                            selectedBooking.customerName ||
                            'Unknown Customer'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">
                      {
                        selectedBooking.mainBooker?.email ||
                        (Array.isArray(selectedBooking.participants) && selectedBooking.participants.length > 0
                          ? selectedBooking.participants[0].email
                          : null) ||
                        selectedBooking.email ||
                        selectedBooking.guestEmail ||
                        selectedBooking.customerEmail ||
                        'No email provided'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{selectedBooking.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-sm text-gray-900">{selectedBooking.dateOfBirth || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {selectedBooking.type === 'hotel' ? 'Check-in Date' : 'Departure Date'}
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedBooking.selectedDate || selectedBooking.checkInDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedBooking.checkOutDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-out Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {selectedBooking.type === 'hotel' ? 'Guests' : 'Participants'}
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedBooking.numberOfParticipants || selectedBooking.numberOfGuests || 1}
                  </p>
                </div>
                {selectedBooking.numberOfRooms && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rooms</label>
                    <p className="text-sm text-gray-900">{selectedBooking.numberOfRooms}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
            {selectedBooking.specialRequests && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Special Requests</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {selectedBooking.specialRequests}
                </p>
              </div>
            )}

            {/* Emergency Contact */}
            {(selectedBooking.emergencyContactName || selectedBooking.emergencyContactPhone) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900">{selectedBooking.emergencyContactName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{selectedBooking.emergencyContactPhone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${(selectedBooking.totalPrice || selectedBooking.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Management */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Management</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Current Payment Status:</span>
                    <div className="mt-1">{getPaymentBadge(selectedBooking.paymentStatus || 'pending')}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <div className="text-xl font-bold text-blue-600">
                      ${(selectedBooking.totalPrice || selectedBooking.totalAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Payment Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.paymentStatus !== 'paid' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdatePaymentStatus(selectedBooking.id, 'paid')}
                      disabled={updatingPayment}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updatingPayment ? 'Updating...' : 'Mark as Paid'}
                    </Button>
                  )}

                  {selectedBooking.paymentStatus !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdatePaymentStatus(selectedBooking.id, 'pending')}
                      disabled={updatingPayment}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    >
                      Mark as Pending
                    </Button>
                  )}

                  {selectedBooking.paymentStatus === 'paid' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdatePaymentStatus(selectedBooking.id, 'refunded')}
                      disabled={updatingPayment}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Mark as Refunded
                    </Button>
                  )}

                  {selectedBooking.paymentStatus !== 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdatePaymentStatus(selectedBooking.id, 'failed')}
                      disabled={updatingPayment}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Mark as Failed
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Status Management */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status Management</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Current Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'confirmed')}
                        disabled={updatingPayment}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirm Booking
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'cancelled')}
                        disabled={updatingPayment}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Cancel Booking
                      </Button>
                    </>
                  )}

                  {selectedBooking.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'completed')}
                        disabled={updatingPayment}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'cancelled')}
                        disabled={updatingPayment}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Cancel Booking
                      </Button>
                    </>
                  )}

                  {(selectedBooking.status === 'cancelled' || selectedBooking.status === 'completed') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'confirmed')}
                      disabled={updatingPayment}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Reactivate Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BookingsManagement;
