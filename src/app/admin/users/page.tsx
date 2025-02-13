'use client';
import { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import { styleConfig } from '@/styles/components';
import Modal from '@/components/common/Modal';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState('ALL');

  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    activeRole === 'ALL' ? true : user.role === activeRole
  ) : [];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin?model=user');
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
      await fetch(`/api/admin?model=user&id=${id}`, {
        method: 'DELETE',
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'user',
          data: newUser
        })
      });
      toast.success('User added successfully');
      setIsAddingUser(false);
      fetchUsers();
      setNewUser({ name: '', email: '', password: '', role: 'CUSTOMER' });
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">User</span> Management
              </h1>
              <p className="mt-2 text-gray-600">Manage user accounts and permissions</p>
            </div>
            <button
              onClick={() => setIsAddingUser(true)}
              className={styleConfig.button.primary}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          </div>

          <div className="flex space-x-4 mb-6">
            {['ALL', 'ADMIN', 'CUSTOMER', 'KARYAWAN'].map((role) => (
              <button
                key={role}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeRole === role 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            title="Add New User"
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
        </div>
      </div>
    </div>
  );
}
