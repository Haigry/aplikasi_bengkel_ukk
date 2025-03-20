'use client';
import { useState, useEffect } from 'react';
import { Service } from '@prisma/client';
import Modal from '@/components/common/Modal';
import { toast } from 'react-hot-toast';
import { styleConfig } from '@/styles/components';
import Pagination from '@/components/common/Pagination';

interface ServiceFormData {
  name: string;
  description?: string;
  harga: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    harga: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin?model=service');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch services');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'service',
          data: formData
        })
      });

      if (!response.ok) throw new Error('Failed to create service');
      
      toast.success('Service created successfully');
      setIsAddingService(false);
      fetchServices();
      setFormData({ name: '', description: '', harga: 0 });
    } catch (error) {
      toast.error('Failed to create service');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'service',
          id: editingService.id,
          data: editingService
        })
      });

      if (!response.ok) throw new Error('Failed to update service');

      toast.success('Service updated successfully');
      setEditingService(null);
      fetchServices();
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/admin?model=service&id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete service');

      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(services.length / itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">Layanan</span> Management
              </h1>
              <p className="mt-2 text-gray-600">Kelola layanan dan harga</p>
            </div>
            <button
              onClick={() => setIsAddingService(true)}
              className={styleConfig.button.primary}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Layanan
            </button>
          </div>

          {/* Service Form Modal */}
          <Modal
            isOpen={isAddingService || !!editingService}
            onClose={() => {
              setIsAddingService(false);
              setEditingService(null);
            }}
            title={editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          >
            <form onSubmit={editingService ? handleEdit : handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan</label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-2"
                    value={editingService ? editingService.name : formData.name}
                    onChange={e => editingService ? 
                      setEditingService({ ...editingService, name: e.target.value }) :
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    className="w-full border rounded-md p-2"
                    rows={3}
                    value={editingService ? editingService.description || '' : formData.description}
                    onChange={e => editingService ?
                      setEditingService({ ...editingService, description: e.target.value }) :
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    className="w-full border rounded-md p-2"
                    value={editingService ? editingService.harga : formData.harga}
                    onChange={e => editingService ?
                      setEditingService({ ...editingService, harga: Number(e.target.value) }) :
                      setFormData({ ...formData, harga: Number(e.target.value) })
                    }
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingService(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingService ? 'Perbarui' : 'Buat'} Layanan
                </button>
              </div>
            </form>
          </Modal>

          {/* Services Table */}
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-gray-100 divide-y divide-gray-200 text-gray-800">
                {currentServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{service.name}</td>
                    <td className="px-6 py-4">{service.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {service.harga.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setEditingService(service)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
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
          </div>
        </div>
      </div>
    </div>
  );
}
