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

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserVehicles();
    }
  }, [session]);

  const fetchUserVehicles = async () => {
    try {
      const res = await fetch(`/api/customer/vehicles?userId=${session?.user?.id}`);
      const data = await res.json();
      setUserVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let vehicleId = selectedVehicle?.id;

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

      // Create booking with selected/new vehicle
      const bookingRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'booking',
          data: {
            date: formData.date,
            message: formData.message,
            userId: session?.user?.id,
            kendaraanId: vehicleId
          }
        })
      });

      if (!bookingRes.ok) {
        throw new Error('Failed to create booking');
      }

      toast.success('Booking created successfully!');
      router.push('/customer/booking/history');
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to make a booking</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Service</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
              
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
                  New Vehicle
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
                  Existing Vehicle
                </button>
              </div>

              {isNewVehicle ? (
                // New Vehicle Form
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Plate*</label>
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
                    <label className="block text-sm font-medium text-gray-700">Brand*</label>
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
                    <label className="block text-sm font-medium text-gray-700">Type*</label>
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
                    <label className="block text-sm font-medium text-gray-700">Transmission*</label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.kendaraan.transmisi}
                      onChange={(e) => setFormData({
                        ...formData,
                        kendaraan: { ...formData.kendaraan, transmisi: e.target.value }
                      })}
                    >
                      <option value="">Select transmission</option>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Existing Vehicle Selection
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Vehicle</label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={selectedVehicle?.id || ''}
                      onChange={(e) => {
                        const vehicle = userVehicles.find(v => v.id === e.target.value);
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
                      <h4 className="font-medium text-gray-900 mb-2">Vehicle Details</h4>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-gray-700">License Plate</dt>
                          <dd className="font-medium text-gray-400">{selectedVehicle.id}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-700">Brand & Type</dt>
                          <dd className="font-medium text-gray-400">{selectedVehicle.merk} {selectedVehicle.tipe}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-700">Year</dt>
                          <dd className="font-medium text-gray-400">{selectedVehicle.tahun}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-700">Transmission</dt>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Date & Time*</label>
                  <input
                    type="datetime-local"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Details*</label>
                  <textarea
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Describe the service needed or issues with your vehicle"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
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
          </form>
        </div>
      </div>
    </div>
  );
}