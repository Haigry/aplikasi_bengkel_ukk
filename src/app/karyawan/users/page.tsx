'use client';
import { useState, useEffect } from 'react';
import { User, Role } from '@prisma/client';
import { styleConfig } from '@/styles/components';
import Modal from '@/components/common/Modal';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';

// Update User type to match schema
interface UserFormData {
  name?: string;
  email: string;
  password?: string;
  noTelp?: string;
  alamat?: string;
  NoKTP?: string;
  role: Role;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    noTelp: '',
    alamat: '',
    NoKTP: '',
    role: 'CUSTOMER'
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filteredUsers = users.filter(user => user.role === 'CUSTOMER');

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin?model=users');  // Changed from 'user' to 'users'
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      toast.success('Data loaded successfully');
    } catch (error) {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin?model=users&id=${id}`, {  // Changed from 'user' to 'users'
        method: 'DELETE',
      });
      toast.success('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'user',
          data: {
            ...newUser,
            role: 'CUSTOMER' // Force CUSTOMER role
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      toast.success('User added successfully');
      setIsAddingUser(false);
      fetchUsers();
      setNewUser({
        name: '',
        email: '',
        password: '',
        noTelp: '',
        alamat: '',
        NoKTP: '',
        role: 'CUSTOMER'
      });
    } catch (error) {
      toast.error('Failed to add user');
    }
  };

  const handleEdit = async (data: Partial<User>) => {
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'user',
          id: editingUser?.id,
          data: {
            ...data,
            role: 'CUSTOMER' // Force CUSTOMER role on edit
          }
        })
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1">
        <div className="p-6 flex flex-col flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">Karyawan</span> Management
              </h1>
              <p className="mt-2 text-gray-600">Kelola akun karyawan</p>
            </div>
            <button
              onClick={() => setIsAddingUser(true)}
              className={styleConfig.button.primary}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Karyawan
            </button>
          </div>

          <Modal
            isOpen={isAddingUser}
            onClose={() => setIsAddingUser(false)}
            title="Tambah Karyawan Baru"
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                      required
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={newUser.noTelp}
                      onChange={(e) => setNewUser({ ...newUser, noTelp: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor KTP</label>
                    <input
                      type="text"
                      value={newUser.NoKTP}
                      onChange={(e) => setNewUser({ ...newUser, NoKTP: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea
                    value={newUser.alamat}
                    onChange={(e) => setNewUser({ ...newUser, alamat: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <input type="hidden" value="CUSTOMER" />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Tambah Pelanggan
                </button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            title="Edit Karyawan"
          >
            {editingUser && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEdit({
                  ...editingUser,
                  role: 'CUSTOMER' // Force CUSTOMER role on edit
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Nama</label>
                    <input
                      type="text"
                      value={editingUser?.name || ''}
                      onChange={(e) => setEditingUser(editingUser ? {
                        ...editingUser,
                        name: e.target.value
                      } : null)}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingUser?.email || ''}
                      onChange={(e) => setEditingUser(editingUser ? {
                        ...editingUser,
                        email: e.target.value
                      } : null)}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                      required
                    />
                  </div>

                  <input type="hidden" value="CUSTOMER" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}
          </Modal>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KTP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.noTelp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.NoKTP}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                limit={itemsPerPage}
                onPageChange={setCurrentPage}
                onLimitChange={setItemsPerPage}
              />
            </div>
          </div>

          {/* Add Delete Confirmation Modal */}
          <Modal
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            title="Konfirmasi Hapus"
          >
            <div className="p-6">
              <p className="mb-4">Apakah Anda yakin ingin menghapus karyawan ini?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </Modal>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
