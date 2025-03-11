'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { styleConfig } from '@/styles/components';
import { toast } from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import { handleError } from '@/utils/errorHandler';

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

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: '',
    password: ''
  });
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Karyawan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserWithRole[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

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
      const response = await fetch('/api/admin?model=user&role=KARYAWAN');
      if (!response.ok) throw new Error('Failed to fetch users');

      const users = await response.json();
      if (isMounted.current) {
        const availableUsers = users.filter((user: UserWithRole) => 
          !employees.some(emp => emp.userId === user.id)
        );
        setAvailableUsers(availableUsers);
      }
    } catch (error) {
      if (isMounted.current) {
        handleError(error, 'Failed to load available users');
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
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      // Simplified data structure
      const karyawanData = {
        model: 'karyawan',
        data: {
          name: newEmployee.name,
          email: newEmployee.email,
          position: newEmployee.position,
          userId: selectedUserId
        }
      };

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(karyawanData)
      });

      if (!response.ok) {
        throw new Error( 'Failed to create employee profile');
      }

      toast.success('Karyawan berhasil ditambahkan');
      setIsAddingEmployee(false);
      fetchEmployees();
      fetchAvailableUsers();
      setNewEmployee({ name: '', email: '', position: '', password: '' });
      setSelectedUserId(null);
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan karyawan');
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

  const handleDelete = async (id: number) => {
    try {
      const employee = employees.find(emp => emp.id === id);
      
      // Delete karyawan first
      await fetch(`/api/admin?model=karyawan&id=${id}`, {
        method: 'DELETE'
      });

      // Then delete associated user account
      if (employee?.userId) {
        await fetch(`/api/admin?model=user&id=${employee.userId}`, {
          method: 'DELETE'
        });
      }

      toast.success('Karyawan berhasil dihapus');
      fetchEmployees();
    } catch (error) {
      toast.error('Gagal menghapus karyawan');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 w-full">
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
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User
                  </label>
                  <select
                    value={selectedUserId || ''}
                    onChange={(e) => {
                      const userId = Number(e.target.value);
                      setSelectedUserId(userId);
                      const user = availableUsers.find(u => u.id === userId);
                      if (user) {
                        setNewEmployee({
                          ...newEmployee,
                          name: user.name || '',
                          email: user.email
                        });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  >
                    <option value="">Select a user</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email} ({user.name || 'No name'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEmployee(false);
                    setSelectedUserId(null);
                    setNewEmployee({ name: '', email: '', position: '', password: '' });
                  }}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
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
            maxWidth="max-w-md"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
