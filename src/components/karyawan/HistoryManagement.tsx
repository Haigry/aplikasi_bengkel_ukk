'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Pagination from '@/components/common/Pagination'
import axios from 'axios'

interface History {
  id: number
  totalHarga: number
  createdAt: string
  user: {
    name: string
  }
  service?: {
    name: string
  }
  sparepart?: {
    name: string
  }
  status: string
}

export default function HistoryManagement() {
  const [history, setHistory] = useState<History[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/admin?model=riwayat')
      setHistory(response.data)
    } catch (error) {
      toast.error('Failed to fetch history')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Riwayat Service</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parts Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">#{record.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.service?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.sparepart?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Rp {record.totalHarga.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    record.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800'
                      : record.status === 'PROCESS'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(record.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(history.length / itemsPerPage)}
          limit={itemsPerPage}
          onPageChange={setCurrentPage}
          onLimitChange={setItemsPerPage}
        />
      </div>
    </div>
  )
}
