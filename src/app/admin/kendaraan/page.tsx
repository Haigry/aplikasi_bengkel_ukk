'use client';
import { useState, useEffect } from 'react';
import { styleConfig } from '@/styles/components';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';

interface Kendaraan {
  noPolisi: string;
  merk: string;
}

export default function KendaraanPage() {
  const [vehicles, setVehicles] = useState<Kendaraan[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVehicle, setNewVehicle] = useState({
    noPolisi: '',
    merk: ''
  });
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Kendaraan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin?model=kendaraan');
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
      toast.success('Data loaded successfully');
    } catch (error: any) {
      toast.error(`Failed to load vehicles: ${error.message}`);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'kendaraan',
          data: newVehicle
        })
      });
      toast.success('Vehicle added successfully');
      setIsAddingVehicle(false);
      fetchVehicles();
      setNewVehicle({ noPolisi: '', merk: '' });
    } catch (error: any) {
      toast.error(`Failed to add vehicle: ${error.message}`);
    }
  };

  const handleEdit = async (data: Kendaraan) => {
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'kendaraan',
          id: editingVehicle?.noPolisi,
          data
        })
      });
      toast.success('Vehicle updated successfully');
      setEditingVehicle(null);
      fetchVehicles();
    } catch (error: any) {
      toast.error(`Failed to update vehicle: ${error.message}`);
    }
  };

  const handleDelete = async (noPolisi: string) => {
    try {
      await fetch(`/api/admin?model=kendaraan&id=${noPolisi}`, {
        method: 'DELETE'
      });
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error: any) {
      toast.error(`Failed to delete vehicle: ${error.message}`);
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                  <input
                    type="text"
                    value={newVehicle.noPolisi}
                    onChange={(e) => setNewVehicle({ ...newVehicle, noPolisi: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand/Model</label>
                  <input
                    type="text"
                    value={newVehicle.merk}
                    onChange={(e) => setNewVehicle({ ...newVehicle, merk: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingVehicle(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </Modal>

          {/* Edit Vehicle Modal */}
          <Modal
            isOpen={!!editingVehicle}
            onClose={() => setEditingVehicle(null)}
            title="Edit Vehicle"
          >
            {editingVehicle && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEdit(editingVehicle);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                    <input
                      type="text"
                      value={editingVehicle.noPolisi}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, noPolisi: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand/Model</label>
                    <input
                      type="text"
                      value={editingVehicle.merk}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, merk: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                      required
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
            maxWidth="max-w-md"
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
                    <tr key={vehicle.noPolisi} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehicle.noPolisi}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehicle.merk}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => setEditingVehicle(vehicle)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(vehicle.noPolisi)}
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
