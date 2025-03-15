'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Modal from '@/components/common/Modal'
import Pagination from '@/components/common/Pagination'
import axios from 'axios'

interface Vehicle {
  id: string
  merk: string
  tipe: string
  transmisi: string
  tahun: number
  CC: number
  userId: number
  user?: {
    name: string
  }
}

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '', // No. Polisi
    merk: '',
    tipe: '',
    transmisi: '',
    tahun: new Date().getFullYear(),
    CC: 0,
    userId: 0
  })
  const [users, setUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    fetchVehicles()
    fetchUsers()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/admin?model=kendaraan')
      setVehicles(response.data)
    } catch (error) {
      toast.error('Failed to fetch vehicles')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin?model=users&role=CUSTOMER')
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to fetch customers')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editId) {
        await axios.put(`/api/admin`, {
          model: 'kendaraan',
          id: editId,
          data: formData
        })
        toast.success('Kendaraan berhasil diupdate')
      } else {
        await axios.post('/api/admin', {
          model: 'kendaraan',
          data: formData
        })
        toast.success('Kendaraan berhasil ditambahkan')
      }
      setIsOpen(false)
      fetchVehicles()
      resetForm()
    } catch (error) {
      toast.error('Gagal menyimpan kendaraan')
    }
  }

  const resetForm = () => {
    setFormData({
      id: '',
      merk: '',
      tipe: '',
      transmisi: '',
      tahun: new Date().getFullYear(),
      CC: 0,
      userId: 0
    })
    setEditId(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Kendaraan</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tambah Kendaraan
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Polisi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Merk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transmisi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pemilik</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.merk}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.tipe}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.transmisi}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.tahun}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.CC}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.user?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(vehicles.length / itemsPerPage)}
          limit={itemsPerPage}
          onPageChange={setCurrentPage}
          onLimitChange={setItemsPerPage}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          resetForm()
        }}
        title={editId ? "Edit Kendaraan" : "Tambah Kendaraan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">No. Polisi</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="mt-1 w-full rounded-md border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Merk</label>
              <input
                type="text"
                value={formData.merk}
                onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                className="mt-1 w-full rounded-md border p-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipe</label>
              <input
                type="text"
                value={formData.tipe}
                onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                className="mt-1 w-full rounded-md border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Transmisi</label>
              <select
                value={formData.transmisi}
                onChange={(e) => setFormData({ ...formData, transmisi: e.target.value })}
                className="mt-1 w-full rounded-md border p-2"
                required
              >
                <option value="">Pilih Transmisi</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tahun</label>
              <input
                type="number"
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-md border p-2"
                min={1900}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CC</label>
              <input
                type="number"
                value={formData.CC}
                onChange={(e) => setFormData({ ...formData, CC: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-md border p-2"
                min={0}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pemilik</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
              className="mt-1 w-full rounded-md border p-2"
              required
            >
              <option value="">Pilih Pemilik</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.noTelp}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                resetForm()
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editId ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

