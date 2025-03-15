'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Modal from '@/components/common/Modal'
import Receipt from '@/components/Receipt'
import Pagination from '@/components/common/Pagination'
import axios from 'axios'

interface Invoice {
  id: number
  totalHarga: number
  quantity: number
  harga: number
  bookingId: number | null
  userId: number
  karyawanId: number
  kendaraanId: string
  sparepartId: number | null
  serviceId: number | null
  createdAt: Date
  updatedAt: Date
  user: {
    name: string
  }
  service?: {
    name: string
    harga: number
  } | null
  sparepart?: {
    name: string
    harga: number
  } | null
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchInvoices()
  }, [])

  // ... rest of implementation similar to admin transactions page ...
  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/api/admin?model=riwayat')
      setInvoices(response.data)
    } catch (error) {
      toast.error('Failed to fetch invoices')
    }
  }

  // Rest of the code similar to admin implementation including invoice viewing and printing
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Invoice</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">#{invoice.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.service?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.sparepart?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Rp {invoice.totalHarga.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedInvoice(invoice)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(invoices.length / itemsPerPage)}
          limit={itemsPerPage}
          onPageChange={setCurrentPage}
          onLimitChange={setItemsPerPage}
        />
      </div>

      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Invoice Receipt"
      >
        {selectedInvoice && <Receipt transaction={selectedInvoice} />}
      </Modal>
    </div>
  )
}
