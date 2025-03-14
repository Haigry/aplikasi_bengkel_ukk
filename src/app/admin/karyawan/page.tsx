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

  const [formData, setFormData] = useState<KaryawanFormData>({
    name: '',
    email: '',
    position: '',
    noTelp: '',
    alamat: '',
    NoKTP: '',
    password: ''
  });

  // Add mounted ref to prevent fetch after unmount
  const isMounted = useRef(true);

  // Modified fetchEmployees
  const fetchEmployees = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin?model=karyawan');
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const data = await response.json();
      if (isMounted.current) {
        setEmployees(Array.isArray(data) ? data : []);
      }
    } catch (error) {
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

  // Modified fetchAvailableUsers
  const fetchAvailableUsers = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const response = await fetch('/api/admin?model=users&role=KARYAWAN');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (isMounted.current && Array.isArray(data)) {
        // Filter out users that are already employees
        const availableUsers = data.filter(user => 
          !employees.some(emp => emp.userId === user.id)
        );
        setAvailableUsers(availableUsers);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Failed to fetch available users:', error);
        handleError(error, 'Failed to load available users');
        setAvailableUsers([]);
      }
    }
  }, [employees]);

  // Modified useEffect
  useEffect(() => {
    // Initial fetch
    fetchEmployees();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []); // Remove fetchEmployees from dependency array

  // Separate useEffect for fetchAvailableUsers
  useEffect(() => {
    if (!loading && employees.length > 0) {
      fetchAvailableUsers();
    }
  }, [loading, employees, fetchAvailableUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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

      // Then create karyawan profile
      const karyawanResponse = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'karyawan',
          data: {
            name: formData.name,
            position: formData.position,
            userId: userData.id
          }
        })
      });

      if (!karyawanResponse.ok) {
        throw new Error('Failed to create employee profile');
      }

      toast.success('Employee added successfully');
      setIsAddingEmployee(false);
      fetchEmployees();
      setFormData({
        name: '',
        email: '',
        position: '',
        noTelp: '',
        alamat: '',
        NoKTP: '',
        password: ''
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add employee');
    }
  };

  const handleEdit = async (data: Karyawan) => {
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
    if (!confirm('Are you sure? This will delete both employee and user accounts.')) return;

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

      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfFirstItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-blue-600">Employee</span> Management
          </h1>
          <button
            onClick={() => setIsAddingEmployee(true)}
            className={styleConfig.button.primary}
          >
            Add Employee
          </button>
        </div>

        {/* Add Employee Modal */}
        <Modal
          isOpen={isAddingEmployee}
          onClose={() => setIsAddingEmployee(false)}
          title="Add New Employee"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded p-2"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full border rounded p-2"
                  value={formData.noTelp}
                  onChange={(e) => setFormData({ ...formData, noTelp: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">KTP Number</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.NoKTP}
                  onChange={(e) => setFormData({ ...formData, NoKTP: e.target.value })}
                />
              </div>
            </div>

            {/* Position and Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                >
                  <option value="">Select Position</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="Service Advisor">Service Advisor</option>
                  <option value="Parts Specialist">Parts Specialist</option>
                  <option value="Electrical Specialist">Electrical Specialist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border rounded p-2"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddingEmployee(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Employee
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Employee Modal */}
        <Modal
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          title="Edit Employee"
        >
          {editingEmployee && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEdit(editingEmployee);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
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
          <p className="mb-4">Are you sure you want to delete this employee?</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                        Delete
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
        )}
      </div>
    </div>
  );
}
