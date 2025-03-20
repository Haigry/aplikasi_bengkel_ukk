'use client';
import { useEffect, useState } from 'react';
import { User, Booking, Riwayat, Sparepart } from '@prisma/client';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalBookings: number;
  totalRevenue: number;
  lowStock: number;
  activeBookings: number;
  monthlyRevenue: { month: string; revenue: number; }[];
  serviceStats: { name: string; count: number; }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    lowStock: 0,
    activeBookings: 0,
    monthlyRevenue: [],
    serviceStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, bookingsRes, riwayatRes, sparepartsRes] = await Promise.all([
        fetch('/api/admin?model=users').then(res => res.json()),
        fetch('/api/admin?model=booking').then(res => res.json()),
        fetch('/api/admin?model=riwayat').then(res => res.json()),
        fetch('/api/admin?model=sparepart').then(res => res.json())
      ]);

      // Ensure we have arrays from the API responses
      const users = Array.isArray(usersRes) ? usersRes : [];
      const bookings = Array.isArray(bookingsRes) ? bookingsRes : [];
      const riwayat = Array.isArray(riwayatRes) ? riwayatRes : [];
      const spareparts = Array.isArray(sparepartsRes) ? sparepartsRes : [];

      // Calculate stats with null checks
      const totalUsers = users.filter((u: User) => u?.role === 'CUSTOMER').length;
      const totalOrders = riwayat.length;
      const totalBookings = bookings.length;
      const totalRevenue = riwayat.reduce((acc: number, curr: Riwayat) => 
        acc + (typeof curr?.totalHarga === 'number' ? curr.totalHarga : 0), 0);
      const lowStock = spareparts.filter((s: Sparepart) => 
        typeof s?.stok === 'number' && s.stok < 10).length;
      const activeBookings = bookings.filter((b: Booking) => 
        b?.status === 'PENDING').length;

      // Calculate monthly revenue and service stats
      const monthlyRevenue = calculateMonthlyRevenue(riwayat);
      const serviceStats = calculateServiceStats(riwayat);

      setStats({
        totalUsers,
        totalOrders,
        totalBookings,
        totalRevenue,
        lowStock,
        activeBookings,
        monthlyRevenue,
        serviceStats
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (riwayat: Riwayat[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = new Array(12).fill(0);

    riwayat.forEach((transaction: Riwayat) => {
      const month = new Date(transaction.createdAt).getMonth();
      revenueByMonth[month] += transaction.totalHarga;
    });

    return monthNames.map((month, index) => ({
      month,
      revenue: revenueByMonth[index]
    }));
  };

  const calculateServiceStats = (riwayat: any[]) => {
    const serviceCount: { [key: string]: number } = {};
    riwayat.forEach(transaction => {
      if (transaction.service) {
        serviceCount[transaction.service.name] = (serviceCount[transaction.service.name] || 0) + 1;
      }
    });

    return Object.entries(serviceCount).map(([name, count]) => ({ name, count }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <div className="text-sm text-gray-600">
          Terakhir diupdate: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Customers" value={stats.totalUsers} trend="+5%" color="blue" />
        <StatsCard title="Active Bookings" value={stats.activeBookings} trend="+2%" color="green" />
        <StatsCard title="Low Stock Items" value={stats.lowStock} trend="-3%" color="red" />
        <StatsCard title="Total Orders" value={stats.totalOrders} trend="+8%" color="purple" />
        <StatsCard title="Total Revenue" value={`Rp ${stats.totalRevenue.toLocaleString()}`} trend="+12%" color="emerald" />
        <StatsCard title="Total Bookings" value={stats.totalBookings} trend="+15%" color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Pendapatan Bulanan</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Servis Populer</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.serviceStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="mt-2 flex items-baseline justify-between">
      <p className={`text-2xl font-semibold text-${color}-600`}>{value}</p>
      <span className={`text-sm font-medium text-${color}-600`}>{trend}</span>
    </div>
  </div>
);