'use client';
import { useState, useEffect } from 'react';
import { styleConfig } from '@/styles/components';
import Sidebar from '@/components/Sidebar';
import { toast } from 'react-hot-toast';

interface Karyawan {
  id: number;
  name: string;
  email: string;
  position: string;
  password: string;
  user?: {
    id: number;
    role: 'KARYAWAN';
  };
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin?model=karyawan');
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
      toast.success('Data loaded successfully');
    } catch (error) {
      toast.error('Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user with KARYAWAN role first
      const userResponse = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'user',
          data: {
            name: newEmployee.name,
            email: newEmployee.email,
            password: newEmployee.password,
            role: 'KARYAWAN'
          }
        })
      });

      const userData = await userResponse.json();

      // Then create karyawan record
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'karyawan',
          data: {
            name: newEmployee.name,
            email: newEmployee.email,
            password: newEmployee.password,
            position: newEmployee.position,
            userId: userData.id // Link to the created user
          }
        })
      });

      toast.success('Employee added successfully');
      setIsAddingEmployee(false);
      fetchEmployees();
      setNewEmployee({ name: '', email: '', position: '', password: '' });
    } catch (error) {
      toast.error('Failed to add employee');
      console.error(error);
    }
  };

  const handleEdit = async (data: Karyawan) => {
    try {
      // Update user first
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'user',
          id: data.user?.id,
          data: {
            name: data.name,
            email: data.email,
            ...(data.password ? { password: data.password } : {})
          }
        })
      });

      // Then update karyawan
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'karyawan',
          id: editingEmployee?.id,
          data: {
            name: data.name,
            email: data.email,
            position: data.position,
            ...(data.password ? { password: data.password } : {})
          }
        })
      });

      toast.success('Employee updated successfully');
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const employee = employees.find(emp => emp.id === id);
      
      // Delete karyawan record first
      await fetch(`/api/admin?model=karyawan&id=${id}`, {
        method: 'DELETE'
      });

      // Then delete user record
      if (employee?.user?.id) {
        await fetch(`/api/admin?model=user&id=${employee.user.id}`, {
          method: 'DELETE'
        });
      }

      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 max-w-7xl mx-auto">
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

          {/* Form Modal */}
          {(isAddingEmployee || editingEmployee) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {isAddingEmployee ? 'Add New Employee' : 'Edit Employee'}
                    </h2>
                    <button 
                      onClick={() => isAddingEmployee ? setIsAddingEmployee(false) : setEditingEmployee(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={isAddingEmployee ? handleSubmit : (e) => {
                    e.preventDefault();
                    handleEdit(editingEmployee!);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={isAddingEmployee ? newEmployee.name : editingEmployee?.name}
                          onChange={(e) => isAddingEmployee 
                            ? setNewEmployee({ ...newEmployee, name: e.target.value })
                            : setEditingEmployee({ ...editingEmployee!, name: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={isAddingEmployee ? newEmployee.email : editingEmployee?.email}
                          onChange={(e) => isAddingEmployee
                            ? setNewEmployee({ ...newEmployee, email: e.target.value })
                            : setEditingEmployee({ ...editingEmployee!, email: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={isAddingEmployee ? newEmployee.position : editingEmployee?.position}
                          onChange={(e) => isAddingEmployee
                            ? setNewEmployee({ ...newEmployee, position: e.target.value })
                            : setEditingEmployee({ ...editingEmployee!, position: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isAddingEmployee ? 'Password' : 'New Password (leave blank to keep current)'}
                        </label>
                        <input
                          type="password"
                          value={isAddingEmployee ? newEmployee.password : editingEmployee?.password || ''}
                          onChange={(e) => isAddingEmployee
                            ? setNewEmployee({ ...newEmployee, password: e.target.value })
                            : setEditingEmployee({ ...editingEmployee!, password: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                          required={isAddingEmployee}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => isAddingEmployee ? setIsAddingEmployee(false) : setEditingEmployee(null)}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {isAddingEmployee ? 'Add Employee' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

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

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p>Are you sure you want to delete this employee?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
