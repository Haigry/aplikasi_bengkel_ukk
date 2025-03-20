'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { BookingStatus, Order } from '@/types';
import Pagination from '@/components/common/Pagination';
import { generateCustomerInvoice } from '@/utils/invoiceGenerator';

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin?model=riwayat&status=COMPLETED');
      const data = await response.json();
      setRiwayat(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Gagal memuat data riwayat');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRiwayat = riwayat.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.kendaraan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.karyawan.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!dateRange.start && !dateRange.end) return matchesSearch;

    const orderDate = new Date(order.createdAt);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    return matchesSearch && 
      (!startDate || orderDate >= startDate) &&
      (!endDate || orderDate <= endDate);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRiwayat = filteredRiwayat.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage);

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900">
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">Riwayat</span> Pesanan
              </h1>
              <p className="mt-2 text-gray-600">Lihat riwayat pesanan yang telah selesai</p>
            </div>

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Cari nama pelanggan, no. polisi, atau karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-md border border-gray-300 px-4 py-2"
              />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="rounded-md border border-gray-300 px-4 py-2"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="rounded-md border border-gray-300 px-4 py-2"
              />
            </div>

            {/* Riwayat Table */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kendaraan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRiwayat.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.kendaraan.merk} - {order.kendaraan.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.karyawan.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.service?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          Rp {order.totalHarga.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onLimitChange={setItemsPerPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Detail Pesanan"
      >
        {selectedOrder && (
          <div className="space-y-4 text-gray-900">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Informasi Pelanggan</h3>
                <p className="text-sm text-gray-600">Nama: {selectedOrder.user.name}</p>
                <p className="text-sm text-gray-600">No. Telp: {selectedOrder.user.noTelp}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Informasi Kendaraan</h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.kendaraan.merk} {selectedOrder.kendaraan.tipe}
                </p>
                <p className="text-sm text-gray-600">No. Polisi: {selectedOrder.kendaraan.id}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Layanan</h3>
              {selectedOrder.service ? (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{selectedOrder.service.name}</p>
                  <p className="text-sm text-gray-600">
                    Rp {selectedOrder.service.harga.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada layanan</p>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Spareparts</h3>
              {selectedOrder.spareParts && selectedOrder.spareParts.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.spareParts.map((part, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">{part.sparepart.name}</p>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{part.quantity} x Rp {part.sparepart.harga.toLocaleString()}</span>
                        <span>Rp {(part.quantity * part.sparepart.harga).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada sparepart yang digunakan</p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  Rp {selectedOrder.totalHarga.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-700 mb-2">Catatan</h3>
              <p className="text-sm text-gray-600">
                {selectedOrder.notes || 'Tidak ada catatan'}
              </p>
            </div>

            <div className="flex justify-end pt-4 space-x-4">
              <button
                onClick={() => {
                  const doc = generateCustomerInvoice(selectedOrder);
                  doc.save(`invoice-${selectedOrder.id}.pdf`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download Invoice
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
