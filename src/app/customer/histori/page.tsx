'use client';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { StatusTransaksi } from "@prisma/client";

interface HistoryItem {
  id: number;
  createdAt: string;
  totalHarga: number;
  status: StatusTransaksi;
  kendaraan: {
    noPolisi: string;
    merk: string;
  };
  karyawan: {
    name: string;
  };
  items: Array<{
    quantity: number;
    subtotal: number;
    sparepart?: {
      name: string;
      harga: number;
    };
    service?: {
      name: string;
      harga: number;
    };
  }>;
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/customer/history/${session.user.id}`);
          const data = await response.json();
          setHistory(data);
        } catch (error) {
          console.error('Failed to fetch history:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHistory();
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: StatusTransaksi) => {
    const colors = {
      PENDING: "yellow",
      PROCESS: "blue",
      COMPLETED: "green",
      CANCELLED: "red"
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          <span className="text-blue-600">Riwayat</span> Service
        </h1>
        <p className="mt-2 text-gray-600">
          Daftar riwayat service kendaraan Anda
        </p>
      </div>

      <div className="shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kendaraan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mekanik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Biaya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{formatDate(item.createdAt)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.kendaraan.merk}</div>
                  <div className="text-sm text-gray-500">{item.kendaraan.noPolisi}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{item.karyawan.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    Rp {item.totalHarga.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(item.status)}-100 text-${getStatusColor(item.status)}-800`}>
                    {item.status}
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
