'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Modal from '@/components/common/Modal'
import { BookingStatus } from '@/types'
import { User, Kendaraan, Service, Sparepart, Karyawan } from '@prisma/client'
import axios from 'axios'

interface Order {
  id: number
  totalHarga: number
  quantity: number
  userId: number
  karyawanId: number
  status: BookingStatus
  user: {
    name: string
  }
  karyawan: {
    name: string
  }
}

interface OrderFormData {
  userId: number;
  karyawanId: number;
  kendaraanId: string;
  serviceId?: number;
  spareParts: { id: number; quantity: number; }[];
  quantity: number;
  harga: number;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [services, setServices] = useState<Service[]>([]);
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Kendaraan[]>([]);
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [ordersRes, usersRes, servicesRes, sparepartsRes] = await Promise.all([
        axios.get('/api/admin?model=riwayat'),
        axios.get('/api/admin?model=users&role=CUSTOMER'),
        axios.get('/api/admin?model=service'),
        axios.get('/api/admin?model=sparepart')
      ]);

      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setServices(servicesRes.data);
      setSpareparts(sparepartsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const fetchUserVehicles = async (userId: number) => {
    try {
      const response = await axios.get(`/api/admin?model=kendaraan`);
      const userVehicles = response.data.filter((v: Kendaraan) => v.userId === userId);
      setVehicles(userVehicles);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    }
  };

  const handleUserChange = (userId: number) => {
    setSelectedUser(userId);
    setFormData(prev => ({ ...prev, userId }));
    fetchUserVehicles(userId);
  };

  const calculateTotal = () => {
    let total = formData.harga;
    
    if (formData.serviceId) {
      const service = services.find(s => s.id === formData.serviceId);
      if (service) total += service.harga;
    }
    
    formData.spareParts.forEach(part => {
      const sparepart = spareparts.find(s => s.id === part.id);
      if (sparepart) {
        total += sparepart.harga * part.quantity;
      }
    });
    
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin', {
        model: 'riwayat',
        data: {
          ...formData,
          totalHarga: calculateTotal(),
          status: 'PENDING'
        }
      });

      toast.success('Order created successfully');
      setIsOpen(false);
      fetchInitialData();
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Order</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Buat Order Baru
        </button>
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* ...existing table JSX... */}
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Buat Order Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <select
              value={formData.userId || ''}
              onChange={(e) => handleUserChange(Number(e.target.value))}
              className="mt-1 w-full rounded-md border p-2"
              required
            >
              <option value="">Pilih Customer</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Kendaraan</label>
              <select
                value={formData.kendaraanId}
                onChange={(e) => setFormData(prev => ({ ...prev, kendaraanId: e.target.value }))}
                className="mt-1 w-full rounded-md border p-2"
                required
              >
                <option value="">Pilih Kendaraan</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.merk} {vehicle.tipe} - {vehicle.id}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Service</label>
            <select
              value={formData.serviceId || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                serviceId: e.target.value ? Number(e.target.value) : undefined
              }))}
              className="mt-1 w-full rounded-md border p-2"
            >
              <option value="">Pilih Service</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - Rp {service.harga.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Service Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Biaya Service</label>
            <input
              type="number"
              value={formData.harga}
              onChange={(e) => setFormData(prev => ({ ...prev, harga: Number(e.target.value) }))}
              className="mt-1 w-full rounded-md border p-2"
              min={0}
              required
            />
          </div>

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="text-lg font-bold flex justify-between">
              <span>Total:</span>
              <span>Rp {calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Buat Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
