'use client';
import { useState, useEffect } from 'react';
import { User, Kendaraan, Service, Role } from '@prisma/client';
import { BookingFormData, BookingWithDetails } from '@/types';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';

export default function BookingPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    user: {
      name: '',
      email: '',
      noTelp: '',
      password: '',
      role: 'CUSTOMER'
    },
    kendaraan: {
      id: '',
      merk: '',
      tipe: '',
      transmisi: '',
      tahun: new Date().getFullYear(),
      CC: 0
    },
    booking: {
      date: new Date().toISOString().slice(0, 16), // Set default to current date and time
      message: ''
    }
  });
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'cancelled' | 'ALL'>('pending');
  const [vehicles, setVehicles] = useState<Kendaraan[]>([]);
  const [userVehicles, setUserVehicles] = useState<Kendaraan[]>([]);
  const [isNewVehicle, setIsNewVehicle] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Kendaraan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchServices();
    fetchVehicles();
  }, []);

  const fetchBookings = async () => {
    const res = await fetch('/api/admin?model=booking');
    const data = await res.json();
    setBookings(data);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin?model=users');
      const data = await res.json();
      if (Array.isArray(data)) {
        const customerUsers = data.filter(user => user.role === Role.CUSTOMER);
        setExistingUsers(customerUsers);
      } else {
        console.error('Expected array of users but got:', data);
        setExistingUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setExistingUsers([]);
    }
  };

  const fetchServices = async () => {
    const res = await fetch('/api/admin?model=service');
    const data = await res.json();
    setServices(data);
  };

  const fetchVehicles = async () => {
    const res = await fetch('/api/admin?model=kendaraan');
    const data = await res.json();
    setVehicles(data);
  };

  const fetchUserVehicles = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin?model=kendaraan&userId=${userId}`);
      const data = await res.json();
      setUserVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setUserVehicles([]);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = existingUsers.find(u => u.id === Number(userId));
    setSelectedUser(user || null);
    if (user) {
      fetchUserVehicles(user.id);
    } else {
      setUserVehicles([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add validation for booking date
    const bookingDate = new Date(formData.booking.date);
    const now = new Date();
    
    if (bookingDate < now) {
      toast.error("Tidak dapat membuat booking untuk tanggal yang sudah lewat");
      return;
    }

    try {
      let userId = selectedUser?.id;

      // Create new user if none selected
      if (!userId) {
        const userRes = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'user',
            data: formData.user
          })
        });
        const userData = await userRes.json();
        userId = userData.id;
      }

      // Create vehicle
      const vehicleRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'kendaraan',
          data: {
            ...formData.kendaraan,
            userId
          }
        })
      });

      // Create booking
      const bookingRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'booking',
          data: {
            ...formData.booking,
            userId
          }
        })
      });

      toast.success('Booking created successfully');
      setIsAddingBooking(false);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const filteredBookings = activeTab === 'ALL' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab.toUpperCase());

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'booking',
          id,
          data: { status }
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 w-full">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">Reservasi</span> Management
              </h1>
              <p className="mt-2 text-gray-600">Kelola reservasi dan jadwal layanan</p>
            </div>
            <button
              onClick={() => setIsAddingBooking(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Reservasi Baru
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex space-x-4 mb-6">
            {(['pending', 'confirmed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'pending' ? 'Menunggu' :
                 status === 'confirmed' ? 'Dikonfirmasi' :
                 'Dibatalkan'}
              </button>
            ))}
          </div>

          {/* Modified Modal */}
          <Modal 
            isOpen={isAddingBooking} 
            onClose={() => setIsAddingBooking(false)} 
            title="Reservasi Baru"
            size="max-w-7xl" // Make modal wider
          >
            <form onSubmit={handleSubmit} className="bg-white">
              <div className="grid grid-cols-3 gap-8 p-6">
                {/* Customer Info Column */}
                <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Informasi Pelanggan
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Pelanggan
                    </label>
                    <select
                      className="w-full border rounded-md p-2 bg-white"
                      onChange={(e) => handleUserSelect(e.target.value)}
                    >
                      <option value="">Pelanggan Baru</option>
                      {existingUsers && existingUsers.length > 0 ? (
                        existingUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} - {user.noTelp}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Tidak ada pelanggan</option>
                      )}
                    </select>
                  </div>

                  {!selectedUser && (
                    <div className="space-y-3">
                      {/* Required Fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nama*</label>
                          <input
                            type="text"
                            className="mt-1 w-full border rounded-md p-2"
                            value={formData.user.name}
                            onChange={e => setFormData({
                              ...formData,
                              user: { ...formData.user, name: e.target.value }
                            })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">No. Telepon*</label>
                          <input
                            type="tel"
                            className="mt-1 w-full border rounded-md p-2"
                            value={formData.user.noTelp}
                            onChange={e => setFormData({
                              ...formData,
                              user: { ...formData.user, noTelp: e.target.value }
                            })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email*</label>
                        <input
                          type="email"
                          className="mt-1 w-full border rounded-md p-2"
                          value={formData.user.email}
                          onChange={e => setFormData({
                            ...formData,
                            user: { ...formData.user, email: e.target.value }
                          })}
                          required
                        />
                      </div>
                      
                      {/* Additional Fields */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat</label>
                        <textarea
                          className="mt-1 w-full border rounded-md p-2"
                          rows={2}
                          value={formData.user.alamat || ''}
                          onChange={e => setFormData({
                            ...formData,
                            user: { ...formData.user, alamat: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">No. KTP</label>
                        <input
                          type="text"
                          className="mt-1 w-full border rounded-md p-2"
                          value={formData.user.NoKTP || ''}
                          onChange={e => setFormData({
                            ...formData,
                            user: { ...formData.user, NoKTP: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Vehicle Info Column */}
                <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Informasi Kendaraan
                  </h3>

                  {selectedUser && (
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setIsNewVehicle(true)}
                        className={`flex-1 py-2 px-4 rounded-md ${
                          isNewVehicle 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                      >
                        Kendaraan Baru
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNewVehicle(false)}
                        className={`flex-1 py-2 px-4 rounded-md ${
                          !isNewVehicle 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                      >
                        Kendaraan Terdaftar
                      </button>
                    </div>
                  )}

                  {!isNewVehicle && selectedUser ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pilih Kendaraan</label>
                      <select
                        className="mt-1 w-full border rounded-md p-2 bg-white"
                        onChange={(e) => {
                          const vehicle = userVehicles.find(v => v.id === e.target.value);
                          setSelectedVehicle(vehicle || null);
                        }}
                      >
                        <option value="">Pilih kendaraan</option>
                        {userVehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.merk} {vehicle.tipe} - {vehicle.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">No. Polisi*</label>
                        <input
                          type="text"
                          className="mt-1 w-full border rounded-md p-2"
                          value={formData.kendaraan.id}
                          onChange={e => setFormData({
                            ...formData,
                            kendaraan: { ...formData.kendaraan, id: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Merek*</label>
                        <input
                          type="text"
                          className="mt-1 w-full border rounded-md p-2"
                          value={formData.kendaraan.merk}
                          onChange={e => setFormData({
                            ...formData,
                            kendaraan: { ...formData.kendaraan, merk: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipe*</label>
                        <input
                          type="text"
                          className="mt-1 w-full border rounded-md p-2"
                          value={formData.kendaraan.tipe}
                          onChange={e => setFormData({
                            ...formData,
                            kendaraan: { ...formData.kendaraan, tipe: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tahun*</label>
                          <input
                            type="number"
                            className="mt-1 w-full border rounded-md p-2"
                            value={formData.kendaraan.tahun}
                            min={1900}
                            max={new Date().getFullYear() + 1}
                            onChange={e => setFormData({
                              ...formData,
                              kendaraan: { ...formData.kendaraan, tahun: Number(e.target.value) }
                            })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">CC*</label>
                          <input
                            type="number"
                            className="mt-1 w-full border rounded-md p-2"
                            value={formData.kendaraan.CC}
                            min={0}
                            onChange={e => setFormData({
                              ...formData,
                              kendaraan: { ...formData.kendaraan, CC: Number(e.target.value) }
                            })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Transmisi*</label>
                        <select
                          className="mt-1 w-full border rounded-md p-2"
                          value={formData.kendaraan.transmisi}
                          onChange={e => setFormData({
                            ...formData,
                            kendaraan: { ...formData.kendaraan, transmisi: e.target.value }
                          })}
                          required
                        >
                          <option value="">Pilih transmisi</option>
                          <option value="Manual">Manual</option>
                          <option value="Automatic">Otomatis</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Info Column */}
                <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Detail Reservasi
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal & Waktu*</label>
                    <input
                      type="datetime-local"
                      className="mt-1 w-full border rounded-md p-2"
                      value={formData.booking.date}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={e => setFormData({
                        ...formData,
                        booking: { ...formData.booking, date: e.target.value }
                      })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Detail Layanan*</label>
                    <textarea
                      className="mt-1 w-full border rounded-md p-2"
                      rows={3}
                      placeholder="Jelaskan layanan yang dibutuhkan atau masalah pada kendaraan"
                      value={formData.booking.message}
                      onChange={e => setFormData({
                        ...formData,
                        booking: { ...formData.booking, message: e.target.value }
                      })}
                      required
                    />
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Catatan Reservasi:</h4>
                    <ul className="text-sm text-blue-700 list-disc list-inside">
                      <li>Harap datang 15 menit sebelum waktu yang ditentukan</li>
                      <li>Bawa dokumen kendaraan yang diperlukan</li>
                      <li>Pembatalan harus dilakukan minimal 24 jam sebelumnya</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingBooking(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Buat Reservasi
                </button>
              </div>
            </form>
          </Modal>

          {/*Booking Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Antrian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal & Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail Pelanggan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail Kendaraan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permintaan Layanan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{booking.queue}</td>
                    <td className="px-6 py-4">
                      {new Date(booking.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{booking.user.name}</div>
                        <div className="text-sm text-gray-500">{booking.user.noTelp}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.kendaraan && (
                        <div>
                          <div>{booking.kendaraan.merk} {booking.kendaraan.tipe}</div>
                          <div className="text-sm text-gray-500">{booking.kendaraan.id}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Konfirmasi
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Batalkan
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
        </div>
      </div>
    </div>
  );
}
