'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { styleConfig } from '@/styles/components';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { handleError } from '@/utils/errorHandler';
import Pagination from '@/components/common/Pagination';

interface Karyawan {
  password: any;
  id: number;
  name: string;
  email: string;
  position: string;
  noTelp?: string;
  alamat?: string;
  NoKTP?: string;
  userId?: number;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

interface UserWithRole {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface KaryawanFormData {
  name: string;
  email: string;
  position: string;
  noTelp?: string;
  alamat?: string;
  NoKTP?: string;
  password: string;
  errors: {
    name: string;
    email: string;
    password: string;
    noTelp: string;
    alamat: string;
    NoKTP: string;
  };
}

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Karyawan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserWithRole[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [useExistingUser, setUseExistingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  const [formData, setFormData] = useState<KaryawanFormData>({
    name: '',
    email: '',
    position: '',
    noTelp: '',
    alamat: '',
    NoKTP: '',
    password: '',
    errors: {
      name: '',
      email: '',
      password: '',
      noTelp: '',
      alamat: '',
      NoKTP: '',
    }
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    noTelp: '',
    alamat: '',
    NoKTP: '',
  });

  const validateForm = (data: Partial<KaryawanFormData>) => {
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

    if (!useExistingUser && data.password && data.password.length < 6) {
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

  const handleKTPInput = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const value = e.target.value.replace(/\D/g, '');
    if (isEdit && editingEmployee) {
      setEditingEmployee({ ...editingEmployee, NoKTP: value });
    } else {
      setFormData({ ...formData, NoKTP: value });
    }
    setErrors({ ...errors, NoKTP: '' });
  };

  const handleNoTelpInput = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const value = e.target.value.replace(/\D/g, '');
    if (isEdit && editingEmployee) {
      setEditingEmployee({ ...editingEmployee, noTelp: value });
    } else {
      setFormData({ ...formData, noTelp: value });
    }
    setErrors({ ...errors, noTelp: '' });
  };

  // Add mounted ref to prevent fetch after unmount
  const isMounted = useRef(true);

  // Fix fetchEmployees to handle response better
  const fetchEmployees = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin?model=karyawan');
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const data = await response.json();
      console.log('Fetched employees data:', data); // Debug log
      
      if (isMounted.current) {
        if (Array.isArray(data.data)) {
          setEmployees(data.data);
        } else if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          console.warn('Unexpected data format:', data);
          setEmployees([]);
        }
      }
    } catch (error) {
      console.error('Error in fetchEmployees:', error);
      if (isMounted.current) {
        handleError(error, 'Failed to load employees');
        setEmployees([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fix fetchAvailableUsers to better handle filtering
  const fetchAvailableUsers = useCallback(async () => {
    if (!isMounted.current || loading) return;
    
    try {
      const response = await fetch('/api/admin?model=users&role=KARYAWAN');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched available users:', data);
      
      if (isMounted.current) {
        let usersData = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        
        // Improved filtering to check both id and email
        const availableUsers = usersData.filter((user: UserWithRole) => 
          !employees.some(emp => 
            emp.userId === user.id || 
            emp.email === user.email
          )
        );
          
        console.log('Filtered available users:', availableUsers); // Debug log
        setAvailableUsers(availableUsers);
      }
    } catch (error) {
      console.error('Error in fetchAvailableUsers:', error);
      if (isMounted.current) {
        handleError(error, 'Failed to load available users');
        setAvailableUsers([]);
      }
    }
  }, [employees, loading]);

  // Modified useEffect
  useEffect(() => {
    isMounted.current = true;
    fetchEmployees();
    return () => {
      isMounted.current = false;
    };
  }, [fetchEmployees]); // Add fetchEmployees back to dependency array

  // Separate useEffect for fetchAvailableUsers
  useEffect(() => {
    if (!loading) {
      fetchAvailableUsers();
    }
  }, [loading, fetchAvailableUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      toast.error('Mohon periksa kembali data');
      return;
    }

    try {
      if (useExistingUser && selectedUser) {
        // Create employee profile for existing user
        const karyawanResponse = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'karyawan',
            data: {
              name: selectedUser.name,
              email: selectedUser.email,
              position: formData.position,
              userId: selectedUser.id
            }
          })
        });

        if (!karyawanResponse.ok) {
          throw new Error('Failed to create employee profile');
        }
      } else {
        // First create user with KARYAWAN role
        const userResponse = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'user',
            data: {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              noTelp: formData.noTelp,
              alamat: formData.alamat,
              NoKTP: formData.NoKTP,
              role: 'KARYAWAN'
            }
          })
        });

        if (!userResponse.ok) {
          throw new Error('Failed to create user account');
        }

        const userData = await userResponse.json();

        // Then create employee profile
        const karyawanResponse = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'karyawan',
            data: {
              name: formData.name,
              email: formData.email,
              position: formData.position,
              userId: userData.id
            }
          })
        });

        if (!karyawanResponse.ok) {
          throw new Error('Failed to create employee profile');
        }
      }

      toast.success('Karyawan berhasil ditambahkan');
      setIsAddingEmployee(false);
      setSelectedUser(null);
      setUseExistingUser(false);
      setFormData({
        name: '',
        email: '',
        position: '',
        noTelp: '',
        alamat: '',
        NoKTP: '',
        password: '',
        errors: {
          name: '',
          email: '',
          password: '',
          noTelp: '',
          alamat: '',
          NoKTP: '',
        }
      });
      fetchEmployees();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan karyawan');
    }
  };

  const handleEdit = async (data: Karyawan) => {
    if (!validateForm(data)) {
      toast.error('Mohon periksa kembali data');
      return;
    }

    try {
      // Update user data first
      if (data.userId) {
        await fetch('/api/admin', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'user',
            id: data.userId,
            data: {
              name: data.name,
              email: data.email,
              ...(data.password ? { password: data.password } : {})
            }
          })
        });
      }

      // Then update karyawan data
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'karyawan',
          id: data.id,
          data: {
            name: data.name,
            email: data.email,
            position: data.position
          }
        })
      });

      toast.success('Data karyawan berhasil diperbarui');
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Gagal memperbarui data karyawan');
    }
  };

  const handleDelete = async (id: number, userId?: number) => {
    if (!confirm('Anda yakin? Ini akan menghapus akun karyawan dan akun pengguna terkait.')) return;

    try {
      // Delete karyawan first (due to foreign key constraint)
      await fetch(`/api/admin?model=karyawan&id=${id}`, {
        method: 'DELETE'
      });

      // Then delete associated user if exists
      if (userId) {
        await fetch(`/api/admin?model=user&id=${userId}`, {
          method: 'DELETE'
        });
      }

      toast.success('Data karyawan berhasil dihapus');
      fetchEmployees();
    } catch (error) {
      toast.error('Gagal menghapus karyawan');
    }
  };

  // Fix pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem); // Fixed slice
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6 text-gray-700">
        <div className="flex items-center justify-between mb-8 ">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-blue-600">Karyawan</span> Management
          </h1>
          <button
            onClick={() => setIsAddingEmployee(true)}
            className={styleConfig.button.primary}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            Tambah Karywan
          </button>
        </div>

        {/* Add Employee Modal */}
        <Modal
          isOpen={isAddingEmployee}
          onClose={() => {
            setIsAddingEmployee(false);
            setUseExistingUser(false);
            setSelectedUser(null);
          }}
          title="Tambah Karyawan"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection Method */}
            <div className="mb-6 border-b pb-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setUseExistingUser(false)}
                  className={`px-4 py-2 rounded-lg ${
                    !useExistingUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Pengguna Baru
                </button>
                <button
                  type="button"
                  onClick={() => setUseExistingUser(true)}
                  className={`px-4 py-2 rounded-lg ${
                    useExistingUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Pengguna Sudah Ada
                </button>
              </div>
            </div>

            {useExistingUser ? (
              <div>
                <label className="block text-sm font-medium mb-2">Pilih User</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const user = availableUsers.find(u => u.id === Number(e.target.value));
                    setSelectedUser(user || null);
                    if (user) {
                      setFormData(prev => ({
                        ...prev,
                        name: user.name,
                        email: user.email
                      }));
                    }
                  }}
                  required
                >
                  <option value="">Pilih User...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              // New User Form Fields
              <>
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama</label>
                    <input
                      type="text"
                      className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    <label className="block text-sm font-medium mb-1">Telepon</label>
                    <input
                      type="tel"
                      maxLength={13}
                      value={formData.noTelp}
                      onChange={handleNoTelpInput}
                      className={`w-full border ${errors.noTelp ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    />
                    {errors.noTelp && (
                      <p className="mt-1 text-xs text-red-500">{errors.noTelp}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nomor KTP</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={formData.NoKTP}
                      onChange={handleKTPInput}
                      className={`w-full border ${errors.NoKTP ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    />
                    {errors.NoKTP && (
                      <p className="mt-1 text-xs text-red-500">{errors.NoKTP}</p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>
              </>
            )}

            {/* Position (shown for both cases) */}
            <div>
              <label className="block text-sm font-medium mb-2">Posisi</label>
              <select
                className="w-full border rounded-lg p-2"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                required
              >
                <option value="">Pilih posisi...</option>
                <option value="Mechanic">Mekanik</option>
                <option value="Service Advisor">Penasihat Servis</option>
                <option value="Parts Specialist">Spesialis Suku Cadang</option>
                <option value="Electrical Specialist">Spesialis Kelistrikan</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsAddingEmployee(false);
                  setUseExistingUser(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tambah Karyawan
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Employee Modal */}
        <Modal
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          title="Edit Karyawan"
        >
          {editingEmployee && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEdit(editingEmployee);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posisi</label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru (Kosongi untuk tidak mengubah password)</label>
                  <input
                    type="password"
                    value={editingEmployee.password || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, password: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete"
        >
          <p className="mb-4">Apakah Kamu yakin ingin menghapus data Keryawan?</p>
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

        {/* Employees Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.position}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.email}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.position}</td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => setEditingEmployee(employee)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(employee.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Add Pagination Component */}
            {employees.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  onLimitChange={(limit) => {
                    setItemsPerPage(limit);
                    setCurrentPage(1); // Reset to first page when changing limit
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}