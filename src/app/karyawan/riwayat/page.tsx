'use client';
import { useState, useEffect, useCallback } from 'react';
import { BookingStatus } from '@/types';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { handleError } from '@/utils/errorHandler';
import { useDebounce } from '@/hooks/useDebounce';

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

interface Riwayat {
  id: number;
  totalHarga: number;
  quantity: number;
  harga: number;
  userId: number;
  karyawanId: number;
  kendaraanId: string;
  serviceId?: number;
  sparepartId?: number;
  user: { name: string };
  karyawan: { name: string };
  kendaraan: { id: string; merk: string };
  service?: { name: string };
  sparepart?: { name: string };
}

interface CreateRiwayatForm {
  karyawanId: number;
  kendaraanId: string;
  totalHarga: number;
  quantity: number;
  harga: number;
  serviceId?: number;
  sparepartId?: number;
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
    quantity: 1,
    harga: 0
  });

  const fetchBookings = useCallback(async () => {
    if (loading) return; // Prevent multiple fetches while loading
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin?model=booking');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      handleError(error, 'Gagal memuat data riwayat');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Use debounce hook for fetch
  useDebounce(() => {
    fetchBookings();
  }, 1000);

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
        const error = await response.json();
        throw new Error(error.message || 'Gagal membuat riwayat');
      }

      toast.success('Riwayat berhasil dibuat');
      setShowCreateModal(false);
      fetchBookings();
    } catch (error) {
      handleError(error, 'Gagal membuat riwayat');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Daftar <span className="text-blue-600">Riwayat Service</span>
        </h1>
        <p className="mt-2 text-gray-600">Kelola riwayat service pelanggan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200">
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

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Buat Riwayat Service" children={undefined}      >
      </Modal>
    </div>
  );
}
