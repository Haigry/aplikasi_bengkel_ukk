'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Role, User } from '@prisma/client'
import Pagination from '@/components/common/Pagination'
import axios from 'axios'

interface Customer {
  id: number
  name: string
  email: string
  noTelp: string
  alamat?: string
  NoKTP?: string
  role: Role
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchCustomers()
  }, [])

  // ... rest of implementation similar to admin users page ...
  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/admin?model=users&role=CUSTOMER')
      setCustomers(response.data)
    } catch (error) {
      toast.error('Failed to fetch customers')
    }
  }

  // Rest of the code similar to admin implementation including customer management
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Pelanggan</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Telp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. KTP</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.noTelp}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.alamat}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.NoKTP}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(customers.length / itemsPerPage)}
          limit={itemsPerPage}
          onPageChange={setCurrentPage}
          onLimitChange={setItemsPerPage}
        />
      </div>
    </div>
  )
}
