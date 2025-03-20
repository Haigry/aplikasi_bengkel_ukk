'use client';
import { useState, useEffect } from 'react';
import { User, Role } from '@prisma/client';
import { UserFormData } from '@/types';
import { styleConfig } from '@/styles/components';
import Modal from '@/components/common/Modal';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';

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
  const [activeRole, setActiveRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    noTelp: '',
    alamat: '',
    NoKTP: '',
  });

  const filteredUsers = users.filter(user => 
    activeRole === 'ALL' ? true : user.role === activeRole
  );

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
      await fetch(`/api/admin?model=users&id=${id}`, {
        method: 'DELETE',
      });
      toast.success('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const validateForm = (data: Partial<UserFormData>) => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      noTelp: '',
      alamat: '',
      NoKTP: '',
    };

    if (data.name && data.name.length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
      isValid = false;
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        newErrors.email = 'Format email tidak valid';
        isValid = false;
      }
    }

    if (data.password && data.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
      isValid = false;
    }

    if (data.noTelp) {
      const phoneRegex = /^[0-9]{10,13}$/;
      if (!phoneRegex.test(data.noTelp)) {
        newErrors.noTelp = 'Nomor telepon harus 10-13 digit';
        isValid = false;
      }
    }

    if (data.NoKTP) {
      const ktpRegex = /^[0-9]{16}$/;
      if (!ktpRegex.test(data.NoKTP)) {
        newErrors.NoKTP = 'Nomor KTP harus 16 digit';
        isValid = false;
      }
    }

    if (data.alamat && data.alamat.length < 10) {
      newErrors.alamat = 'Alamat minimal 10 karakter';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(newUser)) {
      toast.error('Mohon periksa kembali data');
      return;
    }
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'user', // Changed from 'users' to 'user'
          data: newUser
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
    const formData: Partial<UserFormData> = {
      ...data,
      name: data.name || '',
      noTelp: data.noTelp || '',
      alamat: data.alamat || '',
      NoKTP: data.NoKTP || ''
    };
    if (!validateForm(formData)) {
      toast.error('Mohon periksa kembali data');
      return;
    }
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'user',
          id: editingUser?.id,
          data
        })
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleKTPInput = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const value = e.target.value.replace(/\D/g, '');
    if (isEdit && editingUser) {
      setEditingUser({ ...editingUser, NoKTP: value });
    } else {
      setNewUser({ ...newUser, NoKTP: value });
    }
    setErrors({ ...errors, NoKTP: '' });
  };

  const handleNoTelpInput = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const value = e.target.value.replace(/\D/g, '');
    if (isEdit && editingUser) {
      setEditingUser({ ...editingUser, noTelp: value });
    } else {
      setNewUser({ ...newUser, noTelp: value });
    }
    setErrors({ ...errors, noTelp: '' });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1">
        <div className="p-6 flex flex-col flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">User</span> Management
              </h1>
            </div>
            <button
              onClick={() => setIsAddingUser(true)}
              className={styleConfig.button.primary}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah User
            </button>
          </div>

          <div className="flex space-x-4 mb-6">
            {['ALL', 'ADMIN', 'CUSTOMER', 'KARYAWAN'].map((role) => (
              <button
                key={role}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeRole === role 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => setActiveRole(role)}
              >
                {role}
              </button>
            ))}
          </div>

          <Modal
            isOpen={isAddingUser}
            onClose={() => setIsAddingUser(false)}
            title="Tambah User Baru"
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => {
                        setNewUser({ ...newUser, name: e.target.value });
                        setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full rounded-md border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => {
                        setNewUser({ ...newUser, email: e.target.value });
                        setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full rounded-md border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <input
                      type="tel"
                      maxLength={13}
                      value={newUser.noTelp}
                      onChange={(e) => handleNoTelpInput(e)}
                      className={`w-full rounded-md border ${
                        errors.noTelp ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                    />
                    {errors.noTelp && (
                      <p className="mt-1 text-xs text-red-500">{errors.noTelp}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor KTP</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={newUser.NoKTP}
                      onChange={(e) => handleKTPInput(e)}
                      className={`w-full rounded-md border ${
                        errors.NoKTP ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                    />
                    {errors.NoKTP && (
                      <p className="mt-1 text-xs text-red-500">{errors.NoKTP}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea
                    value={newUser.alamat}
                    onChange={(e) => {
                      setNewUser({ ...newUser, alamat: e.target.value });
                      setErrors({ ...errors, alamat: '' });
                    }}
                    className={`w-full rounded-md border ${
                      errors.alamat ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm p-2.5`}
                    rows={3}
                  />
                  {errors.alamat && (
                    <p className="mt-1 text-xs text-red-500">{errors.alamat}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    minLength={6}
                    value={newUser.password}
                    onChange={(e) => {
                      setNewUser({ ...newUser, password: e.target.value });
                      setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full rounded-md border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm p-2.5`}
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="KARYAWAN">Karyawan</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            title="Edit User"
          >
            {editingUser && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEdit(editingUser);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Nama</label>
                    <input
                      type="text"
                      value={editingUser?.name || ''}
                      onChange={(e) => {
                        setEditingUser(editingUser ? {
                          ...editingUser,
                          name: e.target.value
                        } : null);
                        setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full rounded-md border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingUser?.email || ''}
                      onChange={(e) => {
                        setEditingUser(editingUser ? {
                          ...editingUser,
                          email: e.target.value
                        } : null);
                        setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full rounded-md border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <input
                      type="tel"
                      maxLength={13}
                      value={editingUser?.noTelp || ''}
                      onChange={(e) => handleNoTelpInput(e, true)}
                      className={`w-full rounded-md border ${
                        errors.noTelp ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                    />
                    {errors.noTelp && (
                      <p className="mt-1 text-xs text-red-500">{errors.noTelp}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor KTP</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={editingUser?.NoKTP || ''}
                      onChange={(e) => handleKTPInput(e, true)}
                      className={`w-full rounded-md border ${
                        errors.NoKTP ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                    />
                    {errors.NoKTP && (
                      <p className="mt-1 text-xs text-red-500">{errors.NoKTP}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea
                      value={editingUser?.alamat || ''}
                      minLength={10}
                      onChange={(e) => {
                        setEditingUser(editingUser ? {
                          ...editingUser,
                          alamat: e.target.value
                        } : null);
                        setErrors({ ...errors, alamat: '' });
                      }}
                      className={`w-full rounded-md border ${
                        errors.alamat ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2.5`}
                      rows={3}
                    />
                    {errors.alamat && (
                      <p className="mt-1 text-xs text-red-500">{errors.alamat}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({
                        ...editingUser,
                        role: e.target.value as any
                      })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                      <option value="KARYAWAN">Karyawan</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
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

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
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
                      <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
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
                          Delete
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
            title="Confirm Delete"
          >
            <div className="p-6">
              <p className="mb-4">Yakin ingin Menghapus Data?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
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
