'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Kendaraan } from '@prisma/client';

export default function CustomerBookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    message: '',
    kendaraan: {
      id: '',
      merk: '',
      tipe: '',
      transmisi: '',
      tahun: new Date().getFullYear(),
      CC: 0
    }
  });
  const [userVehicles, setUserVehicles] = useState<Kendaraan[]>([]);
  const [isNewVehicle, setIsNewVehicle] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Kendaraan | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserVehicles();
    }
  }, [session]);

  const fetchUserVehicles = async () => {
    try {
      const res = await fetch(`/api/customer/vehicles?userId=${session?.user?.id}`);
      const data = await res.json();
      
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setUserVehicles(data);
      } else {
        // If data is not an array, initialize as empty array
        setUserVehicles([]);
        console.error('Received invalid vehicles data:', data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
      setUserVehicles([]); // Set empty array on error
    }
  };

  const checkDuplicateBooking = async (vehicleId: string, date: string) => {
    try {
      const bookingDate = new Date(date).toISOString().split('T')[0];
      const res = await fetch(`/api/booking/check?vehicleId=${vehicleId}&date=${bookingDate}`);
      const data = await res.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking duplicate booking:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationError(null);

    try {
      let vehicleId = selectedVehicle?.id;

      if (!formData.date) {
        setValidationError('Pilih tanggal booking terlebih dahulu');
        return;
      }

      if (isNewVehicle) {
        // Check if the new vehicle ID already exists
        const duplicateVehicle = userVehicles.find(v => v.id === formData.kendaraan.id);
        if (duplicateVehicle) {
          setValidationError('Plat nomor kendaraan sudah terdaftar');
          return;
        }
      }

      // Check for duplicate booking
      const isDuplicate = await checkDuplicateBooking(
        isNewVehicle ? formData.kendaraan.id : selectedVehicle!.id,
        formData.date
      );

      if (isDuplicate) {
        setValidationError('Kendaraan ini sudah memiliki jadwal service untuk tanggal yang dipilih');
        setLoading(false);
        return;
      }

      // Create new vehicle if needed
      if (isNewVehicle) {
        const vehicleRes = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'kendaraan',
            data: {
              ...formData.kendaraan,
              userId: session?.user?.id
            }
          })
        });

        if (!vehicleRes.ok) {
          throw new Error('Failed to register vehicle');
        }

        const vehicleData = await vehicleRes.json();
        vehicleId = vehicleData.id;
      }

      // Create booking with vehicle and date
      const bookingRes = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          kendaraanId: isNewVehicle ? formData.kendaraan.id : selectedVehicle!.id,
          date: formData.date,
          message: formData.message
        })
      });

      if (!bookingRes.ok) {
        throw new Error('Failed to create booking');
      }

      const bookingData = await bookingRes.json();
      setBooking(bookingData);

      toast.success('Booking created successfully!');
      router.push('/customer/booking/history');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const formatQueueNumber = (queue: number) => {
    // Format to 3 digits with leading zeros
    return `${new Date().toISOString().split('T')[0]}-${queue.toString().padStart(3, '0')}`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Harap Login terlabih dahulu</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pesan Antrian</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {validationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{validationError}</p>
              </div>
            )}
            {/* Vehicle Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Kendaraan</h3>
              
              {/* Vehicle Selection Tabs */}
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setIsNewVehicle(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isNewVehicle 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Kendaraan Baru
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewVehicle(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !isNewVehicle 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                  disabled={userVehicles.length === 0}
                >
                  Kendaraan Lama
                </button>
              </div>

              {isNewVehicle ? (
                // New Vehicle Form
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plat Nomor*</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.kendaraan.id}
                      onChange={(e) => setFormData({
                        ...formData,
                        kendaraan: { ...formData.kendaraan, id: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Merek Kendaraan*</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.kendaraan.merk}
                      onChange={(e) => setFormData({
                        ...formData,
                        kendaraan: { ...formData.kendaraan, merk: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipe Kendaraan*</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.kendaraan.tipe}
                      onChange={(e) => setFormData({
                        ...formData,
                        kendaraan: { ...formData.kendaraan, tipe: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transmisi Kendaraan*</label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.kendaraan.transmisi}
                      onChange={(e) => setFormData({
                        ...formData,
                        kendaraan: { ...formData.kendaraan, transmisi: e.target.value }
                      })}
                    >
                      <option value="">Pilih Transmisi</option>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Matic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CC*</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.kendaraan.CC}
                      onChange={(e) => setFormData({
                        ...formData,
                        kendaraan: { ...formData.kendaraan, CC: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tahun Pembuatan*</label>
                    <input
                      type="number"
                      required
                      min={1900}
                      max={new Date().getFullYear()}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.kendaraan.tahun}
                      onChange={(e) => setFormData({
                        ...formData,
                        kendaraan: { ...formData.kendaraan, tahun: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              ) : (
                // Existing Vehicle Selection
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pilih Kendaraan</label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={selectedVehicle?.id || ''}
                      onChange={(e) => {
                        const vehicle = userVehicles?.find(v => v.id === e.target.value);
                        setSelectedVehicle(vehicle || null);
                      }}
                    >
                      <option value="">Choose a vehicle</option>
                      {userVehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.merk} {vehicle.tipe} - {vehicle.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedVehicle && (
                    <div className="bg-gray-100 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Detail Kendaraan</h4>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-gray-700">Plat Nomor</dt>
                          <dd className="font-medium text-gray-400">{selectedVehicle.id}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-700">Merek & Tipe kendaraan</dt>
                          <dd className="font-medium text-gray-400">{selectedVehicle.merk} {selectedVehicle.tipe}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-700">CC</dt>
                          <dd className="font-medium text-gray-400">{selectedVehicle.CC}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-700">Tahun Rilis</dt>
                          <dd className="font-medium text-gray-400">{selectedVehicle.tahun}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-700">Transmisi Kendaraan</dt>
                          <dd className="font-medium text-gray-400">{selectedVehicle.transmisi}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Pemesanan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hari & Tanggal Pemesanan*</label>
                  <input
                    type="datetime-local"
                    required
                    min={getCurrentDateTime()}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Detail Masalah*</label>
                  <textarea
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Deskripsikan permasalahan kendaraan anda"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => router.back()}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : 'Book Service'}
              </button>
            </div>

            {booking && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">Pesanan Dibuat</h3>
                <p className="text-green-700">Nomor Antrianmu: {formatQueueNumber(booking.queue)}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}