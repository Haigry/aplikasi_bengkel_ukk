'use client';
import { useState, useEffect } from 'react';
import { BookingStatus, StatusTransaksi } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaUserCircle, FaCar } from 'react-icons/fa';
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

interface CreateRiwayatForm {
  karyawanId: number;
  kendaraanId: string;
  totalHarga: number;
  status: StatusTransaksi;
  items: {
    sparepartId?: number;
    serviceId?: number;
    quantity: number;
    harga: number;
  }[];
}

export default function RiwayatPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRiwayatForm>({
    karyawanId: 0,
    kendaraanId: '',
    totalHarga: 0,
    status: 'PENDING',
    items: []
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin?model=booking');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      toast.error('Gagal memuat data riwayat');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRiwayat = async (bookingId: number) => {
    try {
      const response = await fetch('/api/admin/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          ...createForm
        })
      });

      if (!response.ok) {
        throw new Error('Gagal membuat riwayat');
      }

      toast.success('Riwayat berhasil dibuat');
      setShowCreateModal(false);
      fetchBookings();
    } catch (error) {
      toast.error('Gagal membuat riwayat');
    }
  };

  // ...rest of the UI code similar to previous antrian page...
  // Add modal for creating riwayat
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Daftar <span className="text-blue-600">Riwayat Service</span>
        </h1>
        <p className="mt-2 text-gray-600">Kelola riwayat service pelanggan</p>
      </div>

      {/* Similar booking cards layout but with additional button to create riwayat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* ...existing booking card content... */}
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowCreateModal(true);
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Buat Riwayat Service
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Riwayat Modal */}
      <Modal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              title="Buat Riwayat Service" children={undefined}      >
        {/* Add your riwayat creation form here */}
      </Modal>
    </div>
  );
}
