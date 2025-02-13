"use client";
import React, { useEffect, useState } from 'react';
import { styleConfig } from '@/styles/components';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';

interface Order {
  id: number;
  status: 'PENDING' | 'PROCESS' | 'COMPLETED' | 'CANCELLED';
  totalHarga: number;
  userId: number;
  karyawanId: number;
  user: { name: string };
  karyawan: { name: string };
}

interface User {
  id: number;
  name: string;
}

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [karyawan, setKaryawan] = useState<User[]>([]);
  const [newOrder, setNewOrder] = useState({
    userId: '',
    karyawanId: '',
    totalHarga: 0,
    status: 'PENDING' as Order['status']
  });
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, usersRes, karyawanRes] = await Promise.all([
        fetch('/api/admin?model=transaksi'),
        fetch('/api/admin?model=user&role=CUSTOMER'), // Filter users by CUSTOMER role
        fetch('/api/admin?model=karyawan')
      ]);

      const [ordersData, usersData, karyawanData] = await Promise.all([
        ordersRes.json(),
        usersRes.json(),
        karyawanRes.json()
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsers(Array.isArray(usersData) ? usersData : []); // These will only be CUSTOMER users
      setKaryawan(Array.isArray(karyawanData) ? karyawanData : []);
    } catch (error) {
      toast.error('Failed to fetch data');
      setOrders([]);
      setUsers([]);
      setKaryawan([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'transaksi',
          data: {
            ...newOrder,
            userId: parseInt(newOrder.userId),
            karyawanId: parseInt(newOrder.karyawanId)
          }
        })
      });
      toast.success('Order created successfully');
      setIsAddingOrder(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const handleEdit = async (data: Order) => {
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'transaksi',
          id: data.id,
          data: {
            userId: parseInt(String(data.userId)),
            karyawanId: parseInt(String(data.karyawanId)),
            totalHarga: data.totalHarga,
            status: data.status
          }
        })
      });
      toast.success('Order updated successfully');
      setEditingOrder(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'transaksi',
          id
        })
      });
      toast.success('Order deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete order');
    }
    setDeleteConfirm(null);
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      PENDING: 'yellow',
      PROCESS: 'blue',
      COMPLETED: 'green',
      CANCELLED: 'red'
    };
    return colors[status];
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900"> 
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">Orders</span> Management
              </h1>
              <p className="mt-2 text-gray-600">Manage and track customer orders</p>
            </div>
            <button
              onClick={() => setIsAddingOrder(true)}
              className={styleConfig.button.primary}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Order
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Orders', value: orders?.length || 0, color: 'blue' },
              { label: 'Pending', value: orders?.filter(o => o?.status === 'PENDING')?.length || 0, color: 'yellow' },
              { label: 'Processing', value: orders?.filter(o => o?.status === 'PROCESS')?.length || 0, color: 'purple' },
              { label: 'Completed', value: orders?.filter(o => o?.status === 'COMPLETED')?.length || 0, color: 'green' },
            ].map((stat, index) => (
              <div key={index} className={styleConfig.card + ' p-6'}>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Add Order Modal */}
          <Modal
            isOpen={isAddingOrder}
            onClose={() => setIsAddingOrder(false)}
            title="Create New Order"
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select
                    value={newOrder.userId}
                    onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Customer</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    value={newOrder.karyawanId}
                    onChange={(e) => setNewOrder({ ...newOrder, karyawanId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {karyawan.map((k) => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                  <input
                    type="number"
                    placeholder="Enter total price"
                    value={newOrder.totalHarga}
                    onChange={(e) => setNewOrder({ ...newOrder, totalHarga: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as Order['status'] })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESS">Process</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingOrder(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Order
                </button>
              </div>
            </form>
          </Modal>

          {/* Edit Order Modal */}
          <Modal
            isOpen={!!editingOrder}
            onClose={() => setEditingOrder(null)}
            title="Edit Order"
          >
            {editingOrder && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEdit(editingOrder);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select
                      value={editingOrder.userId}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        userId: parseInt(e.target.value)
                      })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <select
                      value={editingOrder.karyawanId}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        karyawanId: parseInt(e.target.value)
                      })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {karyawan.map((k) => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                    <input
                      type="number"
                      value={editingOrder.totalHarga}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        totalHarga: Number(e.target.value)
                      })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editingOrder.status}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        status: e.target.value as Order['status']
                      })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESS">Process</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            title="Confirm Delete"
            maxWidth="max-w-md"
          >
            <p className="mb-4">Are you sure you want to delete this order?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm!)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </Modal>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.user.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.karyawan.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Rp {order.totalHarga.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
