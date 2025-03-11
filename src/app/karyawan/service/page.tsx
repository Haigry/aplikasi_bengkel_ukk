"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { StatusTransaksi } from "@prisma/client";

interface ServiceOrder {
  id: number;
  status: StatusTransaksi;
  totalHarga: number;
  createdAt: string;
  user: { name: string };
  kendaraan: { noPolisi: string; merk: string };
}

export default function KaryawanServicePage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/service/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error("Gagal memuat data service");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: StatusTransaksi) => {
    try {
      const response = await fetch(`/api/service/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success("Status berhasil diubah");
        fetchOrders();
      }
    } catch (error) {
      toast.error("Gagal mengubah status");
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Daftar <span className="text-blue-600">Service</span>
        </h1>
        <p className="mt-2 text-gray-600">Kelola service kendaraan pelanggan</p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kendaraan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{order.user.name}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.kendaraan.merk}</div>
                  <div className="text-sm text-gray-500">{order.kendaraan.noPolisi}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Rp {order.totalHarga.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as StatusTransaksi)}
                    className={`rounded-full px-3 py-1 text-xs font-medium bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}
                  >
                    {Object.values(StatusTransaksi).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
