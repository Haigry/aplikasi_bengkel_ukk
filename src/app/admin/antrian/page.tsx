'use client';
import { useState, useEffect } from 'react';
import { BookingStatus } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaUserCircle } from 'react-icons/fa';

interface Booking {
  id: number;
  queue: number;
  date: string;
  message: string;
  status: BookingStatus;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AntrianPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<BookingStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin?model=booking');
      const data = await response.json();
      setBookings(data);
    } catch (error: any) {
      toast.error(`Gagal memuat data antrian: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: BookingStatus) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'booking',
          id: bookingId,
          data: { status: newStatus }
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success('Status berhasil diupdate');
      fetchBookings();
    } catch (error: any) {
      toast.error(`Gagal mengubah status: ${error.message}`);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status: BookingStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status];
  };

  const filteredBookings = activeStatus === 'ALL' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Daftar <span className="text-blue-600">Antrian Service</span>
        </h1>
        <p className="mt-2 text-gray-600">Kelola antrian service pelanggan</p>
      </div>

      {/* Filter Status */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setActiveStatus('ALL')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeStatus === 'ALL' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Semua
        </button>
        {Object.values(BookingStatus).map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeStatus === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <div 
            key={booking.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  #{booking.queue}
                </span>
                <select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(booking.status)}`}
                >
                  {Object.values(BookingStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <span className="text-gray-900">{formatDate(booking.date)}</span>
                </div>

                <div className="flex items-start space-x-2">
                  <FaClock className="text-gray-400 mt-1" />
                  <p className="text-gray-600 line-clamp-2">{booking.message}</p>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t">
                  <FaUserCircle className="text-gray-400" />
                  <div>
                    <p className="text-gray-900 font-medium">{booking.user.name}</p>
                    <p className="text-gray-500 text-sm">{booking.user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Tidak ada antrian {activeStatus !== 'ALL' ? `dengan status ${activeStatus}` : ''}</p>
        </div>
      )}
    </div>
  );
}
