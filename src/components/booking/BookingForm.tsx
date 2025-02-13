'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, type BookingInput } from '@/lib/validations/booking';
import { toast } from 'react-hot-toast';

export default function BookingForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: getTodayString(),
      message: ''
    }
  });

  const onSubmit = async (data: BookingInput) => {
    if (!session?.user?.email) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      
      // Format date correctly
      const formattedDate = new Date(data.date);
      formattedDate.setHours(0, 0, 0, 0);

      const formData = {
        date: formattedDate.toISOString(),
        message: data.message.trim()
      };

      console.log('Submitting data:', formData); // Debug log

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('Response:', result); // Debug log

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat booking');
      }
      
      toast.success(`Booking berhasil! Nomor antrian Anda: ${result.data.queue}`);
      reset({ 
        date: getTodayString(),
        message: ''
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Booking Service
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={session?.user?.email ?? ''}
            disabled={true}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Service
          </label>
          <input
            type="date"
            {...register('date')}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keluhan / Pesan
          </label>
          <textarea
            {...register('message')}
            rows={4}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Jelaskan keluhan kendaraan Anda..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Memproses...' : 'Submit Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
