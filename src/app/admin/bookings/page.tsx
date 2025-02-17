'use client';
import { useState, useEffect } from 'react';
import { BookingStatus } from '@prisma/client';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';

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
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin?model=booking');
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(`Failed to load bookings: ${Error}`);
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

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchBookings();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast.error(`Error updating status: ${Error}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin?model=booking&id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete booking');
      toast.success('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      toast.error(`Failed to delete booking: ${Error}`);
    }
    setDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-hidden">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <span className="text-blue-600">Antrian</span> Service
                </h1>
                <p className="mt-2 text-gray-600">
                  Kelola antrian service kendaraan
                </p>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Antrian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-semibold text-blue-600">#{booking.queue}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                        <div className="text-sm text-gray-500">{booking.message}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(booking.status)}`}
                        >
                          {Object.values(BookingStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setDeleteConfirm(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete this booking?</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
