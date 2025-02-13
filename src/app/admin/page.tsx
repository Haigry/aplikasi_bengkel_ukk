import AuthGuard from '@/components/auth/AuthGuard';
import DashboardAdmin from '@/components/admin/DashboardAdmin';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dashboard cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        {/* Add more dashboard cards as needed */}
      </div>
    </div>
  );
}