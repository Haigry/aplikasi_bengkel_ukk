"use client";
import React, { useEffect, useState } from 'react';
import { styleConfig } from '@/styles/components';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { BookingStatus } from '@/types';
import { User, Kendaraan, Service, Sparepart, Karyawan } from '@prisma/client';
import Pagination from '@/components/common/Pagination';

interface Order {
  id: number;
  totalHarga: number;
  quantity: number;
  harga: number;
  userId: number;
  karyawanId: number;
  kendaraanId: string;
  serviceId?: number;
  sparepartId?: number;
  status: BookingStatus;  // Use BookingStatus from prisma
  user: { name: string };
  karyawan: { name: string };
  kendaraan: { id: string; merk: string };
  service?: { name: string };
  sparepart?: { name: string };
}

interface SelectedSparepart {
  id: number;
  quantity: number;
}

interface OrderFormData {
  userId: number;
  karyawanId: number;
  kendaraanId: string;
  serviceId?: number;
  spareParts: SelectedSparepart[];
  quantity: number;
  harga: number;
}

interface Booking {
  id: number;
  userId: number;
  date: string;
  message: string;
  status: BookingStatus;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Kendaraan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [newOrder, setNewOrder] = useState({
    userId: 0,
    karyawanId: 0,
    kendaraanId: '',
    totalHarga: 0,
    quantity: 1,
    harga: 0,
    status: 'PENDING' as Order['status']
  });
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    userId: 0,
    karyawanId: 0,
    kendaraanId: '',
    serviceId: undefined,
    spareParts: [],
    quantity: 1,
    harga: 0
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, usersRes, karyawanRes, vehiclesRes, servicesRes, sparepartsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin?model=riwayat'),
        fetch('/api/admin?model=users&role=CUSTOMER'),
        fetch('/api/admin?model=karyawan'),
        fetch('/api/admin?model=kendaraan'),
        fetch('/api/admin?model=service'),
        fetch('/api/admin?model=sparepart'),
        fetch('/api/admin?model=booking')
      ]);

      const [ordersData, usersData, karyawanData, vehiclesData, servicesData, sparepartsData, bookingsData] = await Promise.all([
        ordersRes.json(),
        usersRes.json(),
        karyawanRes.json(),
        vehiclesRes.json(),
        servicesRes.json(),
        sparepartsRes.json(),
        bookingsRes.json()
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsers(Array.isArray(usersData) ? usersData : []); // These will only be CUSTOMER users
      setKaryawan(Array.isArray(karyawanData) ? karyawanData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setSpareparts(Array.isArray(sparepartsData) ? sparepartsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      toast.error('Failed to fetch data');
      setOrders([]);
      setUsers([]);
      setKaryawan([]);
      setVehicles([]);
      setServices([]);
      setSpareparts([]);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalHarga = calculateTotal();
      
      // Validate required fields
      if (!formData.userId || !formData.karyawanId || !formData.kendaraanId) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'riwayat',
          data: {
            ...formData,
            totalHarga,
            status: 'PENDING'
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }
      
      toast.success('Order created successfully');
      setIsAddingOrder(false);
      setFormData({
        userId: 0,
        karyawanId: 0,
        kendaraanId: '',
        serviceId: undefined,
        spareParts: [],
        quantity: 1,
        harga: 0
      });
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
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

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      PENDING: 'yellow',
      CONFIRMED: 'green',
      CANCELLED: 'red'
    } as const;
    return colors[status] || 'gray';
  };

  const calculateTotal = () => {
    let total = formData.harga;
    
    if (formData.serviceId) {
      const service = services.find(s => s.id === formData.serviceId);
      if (service) total += service.harga;
    }
    
    formData.spareParts.forEach(selectedPart => {
      const part = spareparts.find(s => s.id === selectedPart.id);
      if (part) {
        total += part.harga * selectedPart.quantity;
      }
    });
    
    return total;
  };

  const handleAddPart = () => {
    setFormData(prev => ({
      ...prev,
      spareParts: [...prev.spareParts, { id: 0, quantity: 1 }]
    }));
  };

  const handleRemovePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      spareParts: prev.spareParts.filter((_, i) => i !== index)
    }));
  };

  const handlePartChange = (index: number, field: keyof SelectedSparepart, value: number) => {
    setFormData(prev => ({
      ...prev,
      spareParts: prev.spareParts.map((part, i) => 
        i === index ? { ...part, [field]: value } : part
      )
    }));
  };

  useEffect(() => {
    const fetchUserVehicles = async () => {
      if (!selectedUser) return;
      
      try {
        const response = await fetch(`/api/admin?model=kendaraan`);
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        
        const data = await response.json();
        const userVehicles = data.filter((v: Kendaraan) => v.userId === selectedUser);
        setVehicles(userVehicles);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
        toast.error('Failed to load vehicles');
        setVehicles([]);
      }
    };
  
    fetchUserVehicles();
  }, [selectedUser]);

  const createOrderFromBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedUser(booking.userId); // This will trigger vehicle fetch
    setFormData(prev => ({
      ...prev,
      userId: booking.userId,
      kendaraanId: '', // Reset vehicle selection
      serviceId: undefined,
      spareParts: [],
      quantity: 1,
      harga: 0
    }));
    setIsAddingOrder(true);
  };

  const stats = [
    { label: 'Total Orders', value: orders?.length || 0, color: 'blue' },
    { label: 'Pending', value: orders?.filter(o => o?.status === 'PENDING')?.length || 0, color: 'yellow' },
    { label: 'Confirmed', value: orders?.filter(o => o?.status === 'CONFIRMED')?.length || 0, color: 'green' },
    { label: 'Cancelled', value: orders?.filter(o => o?.status === 'CANCELLED')?.length || 0, color: 'red' },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

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
            {stats.map((stat, index) => (
              <div key={index} className={styleConfig.card + ' p-6'}>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Bookings Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pending Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bookings
                .filter(booking => booking.status === 'PENDING')
                .map(booking => (
                  <div key={booking.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{booking.user.name}</h3>
                        <p className="text-sm text-gray-500">{booking.user.email}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{booking.message}</p>
                    <div className="text-sm text-gray-500 mb-4">
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => createOrderFromBooking(booking)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Create Order
                    </button>
                  </div>
                ))}
            </div>
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
                    value={formData.userId || ''}
                    onChange={(e) => {
                      const userId = Number(e.target.value);
                      setSelectedUser(userId);
                      setFormData(prev => ({ ...prev, userId }));
                    }}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Customer</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    value={formData.karyawanId || ''}
                    onChange={(e) => {
                      const karyawanId = Number(e.target.value);
                      setFormData(prev => ({ ...prev, karyawanId }));
                    }}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {karyawan.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} - {k.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={formData.kendaraanId}
                    onChange={e => setFormData(prev => ({ ...prev, kendaraanId: e.target.value }))}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.merk} {vehicle.tipe} - {vehicle.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    className="w-full border rounded-md p-2"
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      serviceId: e.target.value ? Number(e.target.value) : undefined
                    }))}
                  >
                    <option value="">Select Service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - Rp {service.harga.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Spareparts</h3>
                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      + Add Part
                    </button>
                  </div>

                  {formData.spareParts.map((part, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sparepart
                        </label>
                        <select
                          className="w-full border rounded-md p-2"
                          value={part.id}
                          onChange={(e) => handlePartChange(index, 'id', Number(e.target.value))}
                          required
                        >
                          <option value="">Select Sparepart</option>
                          {spareparts.map(sp => (
                            <option 
                              key={sp.id} 
                              value={sp.id}
                              disabled={sp.stok <= 0 || formData.spareParts.some(p => p.id === sp.id && p.id !== part.id)}
                            >
                              {sp.name} - Rp {sp.harga.toLocaleString()} (Stock: {sp.stok})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md p-2"
                          value={part.quantity}
                          onChange={(e) => {
                            const sparepart = spareparts.find(s => s.id === part.id);
                            const maxQty = sparepart ? sparepart.stok : 1;
                            const value = Math.min(Number(e.target.value), maxQty);
                            handlePartChange(index, 'quantity', value);
                          }}
                          min={1}
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePart(index)}
                        className="text-red-600 hover:text-red-700 mb-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {formData.spareParts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium">Selected Parts Summary:</h4>
                      <ul className="mt-2 space-y-2">
                        {formData.spareParts.map((part, index) => {
                          const sparepart = spareparts.find(s => s.id === part.id);
                          if (!sparepart) return null;
                          
                          return (
                            <li key={index} className="text-sm text-gray-600">
                              {sparepart.name} x {part.quantity} = 
                              Rp {(sparepart.harga * part.quantity).toLocaleString()}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    className="w-full border rounded-md p-2"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      quantity: Number(e.target.value)
                    }))}
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Fee</label>
                  <input
                    type="number"
                    className="w-full border rounded-md p-2"
                    value={formData.harga}
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      harga: Number(e.target.value)
                    }))}
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  {formData.serviceId && (
                    <div className="flex justify-between text-sm">
                      <span>Service Fee:</span>
                      <span>Rp {services.find(s => s.id === formData.serviceId)?.harga.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.spareParts.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Parts Total:</span>
                      <span>
                        Rp {formData.spareParts.reduce((acc, part) => {
                          const sparepart = spareparts.find(s => s.id === part.id);
                          return acc + (sparepart ? sparepart.harga * part.quantity : 0);
                        }, 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>Rp {calculateTotal().toLocaleString()}</span>
                  </div>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                  {currentOrders.map((order) => (
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
  );
}
