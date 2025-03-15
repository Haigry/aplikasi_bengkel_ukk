"use client"
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import VehicleManagement from '@/components/karyawan/VehicleManagement'
import CustomerManagement from '@/components/karyawan/CustomerManagement'
import OrderManagement from '@/components/karyawan/OrderManagement'
import InvoiceManagement from '@/components/karyawan/InvoiceManagement'
import HistoryManagement from '@/components/karyawan/HistoryManagement'

export default function KaryawanDashboard() {
  const [activeTab, setActiveTab] = useState('vehicles')

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'vehicles':
        return <VehicleManagement />
      case 'customers':
        return <CustomerManagement />
      case 'orders':
        return <OrderManagement />
      case 'invoices':
        return <InvoiceManagement />
      case 'history':
        return <HistoryManagement />
      default:
        return <VehicleManagement />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Bengkel Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-64 bg-white shadow-md p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`w-full p-2 text-left rounded ${
                activeTab === 'vehicles' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Data Kendaraan
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full p-2 text-left rounded ${
                activeTab === 'customers' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Data Pelanggan
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full p-2 text-left rounded ${
                activeTab === 'orders' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Order
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-full p-2 text-left rounded ${
                activeTab === 'invoices' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Invoice
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full p-2 text-left rounded ${
                activeTab === 'history' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Riwayat
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
