'use client';
import { useState, useEffect } from 'react';
import { styleConfig } from '@/styles/components';
import Pagination from '@/components/common/Pagination';
import { toast } from 'react-hot-toast';

// Update interface to match Prisma schema
interface ServiceHistory {
  id: number;
  totalHarga: number;
  quantity: number;
  harga: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  karyawan: {
    name: string;
  };
  kendaraan: {
    merk: string;
    tipe: string;
    noPolisi: string;
  };
  service?: {
    name: string;
    description: string;
  };
  spareParts: {
    sparepart: {
      name: string;
    };
    quantity: number;
    harga: number;
  }[];
}

export default function RiwayatPage() {
  const [history, setHistory] = useState<ServiceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredHistory = history.filter(item => {
    if (!startDate && !endDate) return true;
    
    const itemDate = new Date(item.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && end) {
      return itemDate >= start && itemDate <= end;
    } else if (start) {
      return itemDate >= start;
    } else if (end) {
      return itemDate <= end;
    }
    
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin?model=riwayat');
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
      toast.success('History loaded successfully');
    } catch (error) {
      toast.error('Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Service <span className="text-blue-600">History</span>
        </h1>
        <p className="mt-2 text-gray-600">View service and transaction history</p>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-gray-300 p-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-gray-300 p-2"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spareparts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.kendaraan.merk} {item.kendaraan.tipe} ({item.kendaraan.noPolisi})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.service?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <ul className="list-disc list-inside">
                      {item.spareParts.map((part, idx) => (
                        <li key={idx}>
                          {part.sparepart.name} x{part.quantity} (Rp {part.harga.toLocaleString()})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.karyawan.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {item.totalHarga.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={setItemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
