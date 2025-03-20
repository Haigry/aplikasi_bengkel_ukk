'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { BookingStatus } from '@/types';
import { User, Kendaraan, Service, Sparepart, Karyawan } from '@prisma/client';
import Pagination from '@/components/common/Pagination';
import { Order, OrderFormData, SelectedSparepart } from '@/types';

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
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

      if (!bookingsRes.ok) {
        throw new Error('Failed to fetch bookings');
      }

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
      
      // Ensure bookingsData is an array and has the correct shape
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData.map(booking => ({
          ...booking,
          status: booking.status || 'PENDING',
          user: booking.user || { id: 0, name: '', email: '' }
        })));
      } else {
        console.error('Bookings data is not an array:', bookingsData);
        setBookings([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
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
      const spareParts = formData.spareParts.map(part => {
        const sparepart = spareparts.find(s => s.id === part.id);
        return {
          id: part.id,
          quantity: part.quantity,
          harga: sparepart?.harga || 0 // Include the actual sparepart price
        };
      });

      const totalHarga = calculateTotal();
      
      if (!formData.userId || !formData.karyawanId) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create order
      const orderResponse = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'riwayat',
          data: {
            ...formData,
            spareParts,
            totalHarga,
            status: 'PENDING'
          }
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      // If there's a selected booking, update its status
      if (selectedBooking) {
        const bookingResponse = await fetch('/api/admin', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'booking',
            id: selectedBooking.id,
            data: {
              status: 'CONFIRMED'
            }
          })
        });

        if (!bookingResponse.ok) {
          console.error('Failed to update booking status');
        }
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
      setSelectedBooking(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const handleEdit = async (data: Order) => {
    try {
      const totalHarga = calculateEditTotal(data);
  
      // Map spare parts data
      const spareParts = data.spareParts.map(part => ({
        sparepartId: part.sparepart.id,
        quantity: part.quantity,
        harga: part.sparepart.harga
      }));
  
      const updateData = {
        status: data.status,
        totalHarga,
        serviceId: data.serviceId || null,
        notes: data.notes || '',
        spareParts
      };
  
      console.log('Sending update data:', updateData);
  
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'riwayat',
          id: data.id,
          data: updateData
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error response:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to update order');
      }
  
      await fetchData(); // Refresh data
      toast.success('Order updated successfully');
      setEditingOrder(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin?model=riwayat&id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      await fetchData(); // Refresh the list
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete order');
    }
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (order: Order, newStatus: BookingStatus) => {
    try {
      let updatedStatus = newStatus;
      
      // Auto-update to PROCESS when work starts
      if (newStatus === 'PROCESS' && order.status === 'PENDING') {
        updatedStatus = 'PROCESS';
      }

      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'riwayat',
          id: order.id,
          data: {
            ...order,
            status: updatedStatus
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Order ${updatedStatus.toLowerCase()}`);
      fetchData();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      PENDING: 'yellow',
      CONFIRMED: 'green',
      CANCELLED: 'red',
      COMPLETED: 'green',
      PROCESS: 'blue'
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

  const calculateEditTotal = (editingOrder: Order) => {
    let total = editingOrder.harga || 0;

    // Add service price if selected
    if (editingOrder.serviceId) {
      const service = services.find(s => s.id === editingOrder.serviceId);
      if (service) total += service.harga;
    }

    // Add spareparts total
    if (editingOrder.spareParts) {
      total += editingOrder.spareParts.reduce((sum, part) => {
        return sum + (part.quantity * part.harga);
      }, 0);
    }
    
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
  
  const fetchBookingVehicle = async (booking: Booking) => {
    try {
      const response = await fetch(`/api/admin?model=kendaraan`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      
      const data = await response.json();
      // Find the most recent vehicle for this booking's user
      const userVehicles = data.filter((v: Kendaraan) => v.userId === booking.userId);
      const latestVehicle = userVehicles[userVehicles.length - 1];
      
      if (latestVehicle) {
        return latestVehicle;
      }
    } catch (error) {
      console.error('Failed to fetch booking vehicle:', error);
      return null;
    }
  };

  const createOrderFromBooking = async (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedUser(booking.userId);
    
    // Fetch and set vehicle data
    const vehicle = await fetchBookingVehicle(booking);
    setFormData(prev => ({
      ...prev,
      userId: booking.userId,
      kendaraanId: vehicle ? vehicle.id : '', // Set vehicle ID if found
      serviceId: undefined,
      spareParts: [],
      quantity: 1,
      harga: 0
    }));

    // Update vehicles list for the dropdown
    if (vehicle) {
      setVehicles([vehicle]);
    }
    setIsAddingOrder(true);
  };

  const filteredOrders = orders.filter(order => {
    if (order.status === 'COMPLETED' && filterStatus !== 'COMPLETED') {
      return false;
    }
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      order.user.name.toLowerCase().includes(searchLower) ||
      order.karyawan.name.toLowerCase().includes(searchLower) ||
      order.kendaraan.id.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 relative"> 
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="max-w-[1600px] mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">Pesanan</span> Management
              </h1>
              <p className="mt-2 text-gray-600">Kelola dan pantau pesanan pelanggan</p>
            </div>

            {/* Bookings Section */}
            <div className="mb-8">
              <h2 className="text-xl text-gray-600 font-semibold mb-4">Reservasi Menunggu</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.isArray(bookings) && bookings
                  .filter(booking => booking?.status === 'PENDING')
                  .map((booking, index) => (
                    <div key={booking?.id || index} className="bg-white rounded-lg shadow p-4 relative">
                      {/* Queue Number Badge */}
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow">
                        {index + 1}
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{booking?.user?.name || 'Unknown'}</h3>
                          <p className="text-sm text-gray-500">{booking?.user?.email || 'No email'}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          {booking?.status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{booking?.message || 'No message'}</p>
                      <div className="text-sm text-gray-500 mb-4">
                        {new Date(booking?.date || Date.now()).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => createOrderFromBooking(booking)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Buat Pesanan
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Add Filter & Search Section */}
            <div className="mb-6 flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'ALL')}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="ALL">Semua Pesanan Aktif</option>
                <option value="PENDING">Menunggu</option>
                <option value="PROCESS">Dalam Proses</option>
                <option value="CANCELLED">Dibatalkan</option>
                <option value="COMPLETED">Tampilkan Selesai</option>
              </select>
              <input
                type="text"
                placeholder="Cari pelanggan, karyawan, atau nomor polisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
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
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value as BookingStatus)}
                            className={`rounded-md border px-2 py-1 text-sm font-semibold
                              ${getStatusColor(order.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                              ${getStatusColor(order.status) === 'green' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                              ${getStatusColor(order.status) === 'red' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                              ${getStatusColor(order.status) === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                            `}
                          >
                            <option value="PENDING">Menunggu</option>
                            <option value="PROCESS">Proses</option>
                            <option value="COMPLETED">Selesai</option>
                            <option value="CANCELLED">Dibatalkan</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(order, 'PROCESS')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Proses
                            </button>
                          )}
                          {order.status === 'PROCESS' && (
                            <button
                              onClick={() => handleStatusChange(order, 'COMPLETED')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Selesai
                            </button>
                          )}
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(order.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
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

      {/* Keep modals outside of scroll container */}
      {/* Add Order Modal */}
      <Modal
        isOpen={isAddingOrder}
        onClose={() => setIsAddingOrder(false)}
        title="Buat Pesanan Baru"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Customer Info - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pelanggan</label>
              <input
                type="text"
                value={users.find(u => u.id === formData.userId)?.name || ''}
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2.5"
                disabled
              />
            </div>
            {/* Vehicle Info - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kendaraan</label>
              <input
                type="text"
                value={vehicles.find(v => v.id === formData.kendaraanId)?.merk || ''}
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2.5"
                disabled
              />
            </div>
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
              <select
                value={formData.karyawanId || ''}
                onChange={(e) => {
                  const karyawanId = Number(e.target.value);
                  setFormData(prev => ({ ...prev, karyawanId }));
                }}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                required
              >
                <option value="">Pilih Karyawan</option>
                {karyawan.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} - {k.position}
                  </option>
                ))}
              </select>
            </div>
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Layanan</label>
              <select
                className="w-full border rounded-md p-2.5"
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  serviceId: e.target.value ? Number(e.target.value) : undefined
                }))}
              >
                <option value="">Pilih Layanan</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - Rp {service.harga.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            {/* Buttons */}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddingOrder(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700"
            >
              Buat Pesanan
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        title="Detail Pesanan"
      >
        {editingOrder && (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEdit(editingOrder);
          }}>
            <div className="space-y-4">
              {/* Status Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    status: e.target.value as BookingStatus
                  })}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                >
                  <option value="PENDING">Menunggu</option>
                  <option value="PROCESS">Proses</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>
              {/* Customer Info - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pelanggan</label>
                <input
                  type="text"
                  value={editingOrder.user.name}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 p-2.5"
                  disabled
                />
              </div>
              {/* Vehicle Info - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kendaraan</label>
                <input
                  type="text"
                  value={`${editingOrder.kendaraan.merk} - ${editingOrder.kendaraan.id}`}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 p-2.5"
                  disabled
                />
              </div>
              {/* Service Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Layanan</label>
                <select
                  value={editingOrder.serviceId || ''}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    serviceId: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                >
                  <option value="">No Service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - Rp {service.harga.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                  placeholder="Catatan tambahan tentang layanan..."
                />
              </div>
              {/* Spareparts Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Spareparts</h3>
                  <button
                    type="button"
                    onClick={() => setEditingOrder(prev => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        spareParts: [
                          ...(prev.spareParts || []),
                          {
                            id: 0,
                            riwayatId: prev.id,
                            sparepartId: 0,
                            quantity: 1,
                            harga: 0,
                            sparepart: {
                              id: 0,
                              name: '',
                              harga: 0,
                              stok: 0
                            }
                          }
                        ]
                      };
                    })}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Tambah Sparepart
                  </button>
                </div>
                {editingOrder?.spareParts?.map((part, index) => (
                  <div key={index} className="flex gap-2 items-end mb-2">
                    <div className="flex-1">
                      <select
                        value={part.sparepartId}
                        onChange={(e) => {
                          const selectedPart = spareparts.find(s => s.id === Number(e.target.value));
                          if (!selectedPart || !editingOrder) return;
                          
                          const newParts = [...editingOrder.spareParts];
                          newParts[index] = {
                            ...part,
                            sparepartId: selectedPart.id,
                            harga: selectedPart.harga,
                            sparepart: {
                              id: selectedPart.id,
                              name: selectedPart.name,
                              harga: selectedPart.harga,
                              stok: selectedPart.stok
                            }
                          };
                          setEditingOrder({ ...editingOrder, spareParts: newParts });
                        }}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      >
                        <option value="">Pilih Sparepart</option>
                        {spareparts.map(sp => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name} - Rp {sp.harga.toLocaleString()} (Stok: {sp.stok})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={part.quantity}
                        onChange={(e) => {
                          const newParts = [...editingOrder.spareParts];
                          newParts[index] = {
                            ...part,
                            quantity: Math.min(Number(e.target.value), part.sparepart.stok)
                          };
                          setEditingOrder({ ...editingOrder, spareParts: newParts });
                        }}
                        min={1}
                        max={part.sparepart.stok}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newParts = editingOrder.spareParts.filter((_, i) => i !== index);
                        setEditingOrder({ ...editingOrder, spareParts: newParts });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
              {/* Total Price Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Harga</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="text"
                    value={calculateEditTotal(editingOrder).toLocaleString()}
                    readOnly
                    className="w-full rounded-md border border-gray-300 pl-12 p-2.5 bg-gray-50"
                  />
                </div>
              </div>
            </div>
            {/* Add completion button if status is PROCESS */}
            <div className="mt-6 flex justify-end gap-3">
              {editingOrder.status === 'PROCESS' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(editingOrder, 'COMPLETED')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Tandai Selesai
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Konfirmasi Hapus"
      >
        <p className="mb-4">Anda yakin ingin menghapus pesanan ini?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleDelete(deleteConfirm!)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Hapus
          </button>
          <button
            onClick={() => setDeleteConfirm(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Batal
          </button>
        </div>
      </Modal>
    </div>
  );
}
