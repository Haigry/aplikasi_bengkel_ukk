'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { BookingStatus } from '@/types';

interface DashboardStats {
  totalServices: number;
  pendingBookings: number;
  completedOrders: number;
  todayAppointments: number;
  recentBookings: Array<{
    id: number;
    date: string;
    status: BookingStatus;
    user: { name: string };
    kendaraan?: { merk: string; id: string };
  }>;
  recentVehicles: Array<{
    id: string;
    merk: string;
    model: string;
    tahun: string;
    nopol: string;
    lastService: string;
  }>;
}

export default function KaryawanDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    pendingBookings: 0,
    completedOrders: 0,
    todayAppointments: 0,
    recentBookings: [],
    recentVehicles: []
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/karyawan');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Selamat Datang Kembali, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">{session?.user?.name}</span>
          </h1>
          <p className="mt-2 text-gray-600">Berikut ringkasan aktivitas hari ini</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Total Layanan */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Layanan</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalServices}</h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pesanan Tertunda */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pesanan Tertunda</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pesanan Selesai */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pesanan Selesai</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.completedOrders}</h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-full">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Janji Temu Hari Ini */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pesanan Hari ini</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <a href="/karyawan/booking" className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <h3 className="font-semibold mb-2 group-hover:text-blue-600">Kelola Pesanan</h3>
            <p className="text-sm text-gray-600">Lihat dan kelola pesanan servis</p>
          </a>
          
          <a href="/karyawan/orders" className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <h3 className="font-semibold mb-2 group-hover:text-blue-600">Pesanan Servis</h3>
            <p className="text-sm text-gray-600">Pantau servis yang sedang berlangsung</p>
          </a>
          
          <a href="/karyawan/users" className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <h3 className="font-semibold mb-2 group-hover:text-blue-600">Database Pelanggan</h3>
            <p className="text-sm text-gray-600">Kelola informasi pelanggan</p>
          </a>
          
          <a href="/karyawan/riwayat" className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <h3 className="font-semibold mb-2 group-hover:text-blue-600">Riwayat Servis</h3>
            <p className="text-sm text-gray-600">Lihat riwayat servis pelanggan</p>
          </a>
        </div>

        {/* Vehicle Summary Section - Add this after Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Kendaraan Terdaftar Terbaru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.recentVehicles?.slice(0, 3).map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{vehicle.merk} {vehicle.model}</h3>
                    <p className="text-sm text-gray-600">Tahun {vehicle.tahun}</p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {vehicle.nopol}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Terakhir Servis: {new Date(vehicle.lastService).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Pesanan Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Kendaraan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">No. Polisi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentBookings?.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.kendaraan?.merk || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.kendaraan?.id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : booking.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'PENDING' ? 'Menunggu' :
                         booking.status === 'CONFIRMED' ? 'Dikonfirmasi' : 'Dibatalkan'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
