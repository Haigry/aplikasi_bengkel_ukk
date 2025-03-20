'use client';
import { useState, useEffect } from 'react';
import { styleConfig } from '@/styles/components';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';

interface Kendaraan {
  id: string;
  merk: string;
  tipe: string;
  transmisi: string;
  tahun: number;
  CC: number;
  userId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function KendaraanPage() {
  const [vehicles, setVehicles] = useState<Kendaraan[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVehicle, setNewVehicle] = useState({
    id: '',
    merk: '',
    tipe: '',
    transmisi: '',
    tahun: new Date().getFullYear(),
    CC: 0,
    userId: 0
  });
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Kendaraan | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchVehicles();
    fetchUsers();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin?model=kendaraan');
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
      toast.success('Data loaded successfully');
    } catch (error) {
      toast.error('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin?model=users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.userId) {
      toast.error('Please select a user');
      return;
    }

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'kendaraan',
          data: {
            id: String(newVehicle.id).trim(), // Ensure clean string
            merk: newVehicle.merk.trim(),
            tipe: newVehicle.tipe?.trim() || null,
            transmisi: newVehicle.transmisi?.trim() || null,
            tahun: newVehicle.tahun ? Number(newVehicle.tahun) : null,
            CC: newVehicle.CC ? Number(newVehicle.CC) : null,
            userId: Number(newVehicle.userId)
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add vehicle');
      }

      toast.success('Vehicle added successfully');
      setIsAddingVehicle(false);
      fetchVehicles();
      setNewVehicle({
        id: '',
        merk: '',
        tipe: '',
        transmisi: '',
        tahun: new Date().getFullYear(),
        CC: 0,
        userId: 0
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add vehicle');
      console.error('Error:', error);
    }
  };

  const handleEdit = async (data: Kendaraan) => {
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'kendaraan',
          id: editingVehicle?.id,
          data
        })
      });
      toast.success('Vehicle updated successfully');
      setEditingVehicle(null);
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to update vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin?model=kendaraan&id=${id}`, {
        method: 'DELETE'
      });
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 w-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-blue-600">Vehicles</span> Management
            </h1>
            <button
              onClick={() => setIsAddingVehicle(true)}
              className={styleConfig.button.primary}
            >
              Add Vehicle
            </button>
          </div>

          {/* Add Vehicle Modal */}
          <Modal
            isOpen={isAddingVehicle}
            onClose={() => setIsAddingVehicle(false)}
            title="Add New Vehicle"
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pemilik Kendaraan</label>
                  <select
                    value={newVehicle.userId}
                    onChange={(e) => setNewVehicle({ ...newVehicle, userId: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  >
                    <option value="">Pilih Pemilik...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                  <input
                    type="text"
                    value={newVehicle.id}
                    onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merk</label>
                  <input
                    type="text"
                    value={newVehicle.merk}
                    onChange={(e) => setNewVehicle({ ...newVehicle, merk: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <input
                    type="text"
                    value={newVehicle.tipe}
                    onChange={(e) => setNewVehicle({ ...newVehicle, tipe: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmisi</label>
                  <input
                    type="text"
                    value={newVehicle.transmisi}
                    onChange={(e) => setNewVehicle({ ...newVehicle, transmisi: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={newVehicle.tahun}
                    onChange={(e) => setNewVehicle({ ...newVehicle, tahun: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Mesin</label>
                  <input
                    type="number"
                    value={newVehicle.CC}
                    onChange={(e) => setNewVehicle({ ...newVehicle, CC: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingVehicle(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Tambah Kendaraan
                </button>
              </div>
            </form>
          </Modal>

          {/* Edit Vehicle Modal */}
          <Modal
            isOpen={!!editingVehicle}
            onClose={() => setEditingVehicle(null)}
            title="Edit Kendaraan"
          >
            {editingVehicle && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEdit(editingVehicle);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                    <input
                      type="text"
                      value={editingVehicle.id}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, id: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merk</label>
                    <input
                      type="text"
                      value={editingVehicle.merk}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, merk: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <input
                      type="text"
                      value={editingVehicle.tipe}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, tipe: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transmisi</label>
                    <input
                      type="text"
                      value={editingVehicle.transmisi}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, transmisi: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                    <input
                      type="number"
                      value={editingVehicle.tahun}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, tahun: Number(e.target.value) })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Mesin</label>
                    <input
                      type="number"
                      value={editingVehicle.CC}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, CC: Number(e.target.value) })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingVehicle(null)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
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
            <p className="mb-4">Are you sure you want to delete this vehicle?</p>
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

          {/* Vehicles Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand/Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehicle.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehicle.merk}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => setEditingVehicle(vehicle)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(vehicle.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
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
