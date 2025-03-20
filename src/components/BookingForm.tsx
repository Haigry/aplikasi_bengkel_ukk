'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, type BookingInput } from '@/app/lib/validations/booking';

export default function BookingForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingInput) => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      reset();
      alert(`Booking berhasil dibuat!\nNomor Antrian Anda: ${result.data.queue}\nTanggal Service: ${new Date(result.data.date).toLocaleDateString('id-ID')}`);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Gagal membuat booking. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Tanggal Service
          </label>
          <input
            type="date"
            {...register('date')}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.date && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Keterangan Service
        </label>
        <textarea
          {...register('message')}
          rows={4}
          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Jelaskan keluhan kendaraan Anda..."
        />
        {errors.message && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Processing...
          </span>
        ) : (
          'Submit Booking'
        )}
      </button>
    </form>
  );
}
