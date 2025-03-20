'use client';
import { useState, useEffect } from 'react';
import { Booking, Riwayat } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';
import { generateCustomerInvoice } from '@/utils/invoiceGenerator';

interface BookingWithDetails extends Booking {
  riwayatId?: number; // Add this field
  user: {
    name: string;
    email: string;
    noTelp: string;
  };
}

interface RiwayatWithDetails extends Riwayat {
  message?: string;
  user: {
    name: string;
    noTelp: string;
    alamat?: string;
  };
  karyawan?: {
    name: string;
  };
  kendaraan?: {
    id: string;
    merk: string;
    tipe: string;
  };
  service?: {
    name: string;
    harga: number;
  };
  spareParts?: Array<{
    sparepart: {
      name: string;
      harga: number;
    };
    quantity: number;
    harga: number;
  }>;
}

export default function BookingHistoryPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading,] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [riwayatList, setRiwayatList] = useState<RiwayatWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'HISTORY'>('BOOKINGS');

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
      fetchRiwayat();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/booking/history?userId=${session?.user?.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (error) {
      toast.error('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const fetchRiwayat = async () => {
    try {
      const res = await fetch(`/api/customer/riwayat?userId=${session?.user?.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRiwayatList(data);
      }
    } catch (error) {
      toast.error('Failed to load service history');
    }
  };

  const handleDownloadInvoice = async (booking: BookingWithDetails) => {
    try {
      if (!booking.riwayatId) {
        toast.error('No invoice available for this booking');
        return;
      }

      const res = await fetch(`/api/orders/${booking.riwayatId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch order details');
      }

      const orderData = await res.json();
      if (!orderData) {
        throw new Error('Order data not found');
      }

      const doc = generateCustomerInvoice(orderData);
      doc.save(`invoice-${booking.id}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const filteredBookings = activeStatus === 'ALL'
    ? bookings
    : bookings.filter(booking => booking.status === activeStatus);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Service History</h1>
          <p className="mt-1 text-sm text-gray-600">
            View your bookings and service history
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`py-2 px-4 ${
              activeTab === 'BOOKINGS'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Current Bookings
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-2 px-4 ${
              activeTab === 'HISTORY'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Service History
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'BOOKINGS' ? (
          // Existing booking table
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No Antrian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.queue}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs overflow-hidden text-ellipsis">
                          {booking.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.status === 'CONFIRMED' && booking.riwayatId && (
                          <button
                            onClick={() => handleDownloadInvoice(booking)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Download Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                limit={itemsPerPage}
                onPageChange={setCurrentPage}
                onLimitChange={setItemsPerPage}
              />
            </div>
          </div>
        ) : (
          // Service History (Riwayat) Table
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kendaraan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teknisi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {riwayatList.map((riwayat) => (
                    <tr key={riwayat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(riwayat.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {riwayat.kendaraan?.merk} {riwayat.kendaraan?.tipe}
                        <br />
                        <span className="text-gray-500">{riwayat.kendaraan?.id}</span>
                      </td>
                      <td>
                        <div className="px-6 py-4 text-sm">
                          {riwayat.karyawan?.name}
                          <br />
                          <span className="text-gray-500">{riwayat.user.noTelp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {riwayat.service?.name}
                        <br />
                        <span className="text-gray-500">{formatCurrency(riwayat.service?.harga || 0)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {riwayat.spareParts?.map(item => (
                          <div key={item.sparepart.name} className="mb-1">
                            {item.sparepart.name} x{item.quantity}
                            <br />
                            <span className="text-gray-500">{formatCurrency(item.harga)}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {formatCurrency(riwayat.totalHarga)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          riwayat.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {riwayat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 w-32 text-center">
          <a href="/">Back</a>
        </button>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No bookings found</h3>
            <p className="mt-2 text-sm text-gray-500">
              You haven't made any service bookings yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
