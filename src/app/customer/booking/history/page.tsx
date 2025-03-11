"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { BookingStatus } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface BookingHistory {
  id: number;
  date: string;
  queue: number;
  message: string;
  status: BookingStatus;
}

export default function BookingHistoryPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/customer/booking/history/${session.user.id}`);
          const data = await response.json();
          setBookings(data);
        } catch (error) {
          console.error('Failed to fetch bookings:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      PENDING: "yellow",
      CONFIRMED: "green",
      CANCELLED: "red"
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          <span className="text-blue-600">Riwayat</span> Booking
        </h1>
        <p className="mt-2 text-gray-600">
          Daftar riwayat booking service Anda
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Antrian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-semibold text-blue-600">#{booking.queue}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {format(new Date(booking.date), "PPP", { locale: id })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{booking.message}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(booking.status)}-100 text-${getStatusColor(booking.status)}-800`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
