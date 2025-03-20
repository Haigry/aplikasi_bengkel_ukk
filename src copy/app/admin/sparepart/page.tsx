'use client';
import { useState, useEffect } from 'react';
import { Sparepart } from '@prisma/client';
import { styleConfig } from '@/styles/components';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';

export default function ProductsPage() {
  const [products, setProducts] = useState<Sparepart[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    harga: 0,
    stok: 0
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Sparepart | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin?model=sparepart');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sparepart',
          data: {
            name: newProduct.name,
            harga: parseInt(String(newProduct.harga)),
            stok: parseInt(String(newProduct.stok))
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal menambahkan produk');
      }

      toast.success('Produk berhasil ditambahkan');
      setIsAddingProduct(false);
      fetchProducts();
      setNewProduct({ name: '', harga: 0, stok: 0 });
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan produk');
      console.error('Error:', error);
    }
  };

  const handleEdit = async (data: Partial<Sparepart>) => {
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sparepart',
          id: editingProduct?.id,
          data
        })
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin?model=sparepart&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus produk');
      }
      
      toast.success('Produk berhasil dihapus');
      fetchProducts();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Gagal menghapus produk');
      console.error('Delete error:', error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900"> 
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 w-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-blue-600">Produk</span> Management
            </h1>
            <button
              onClick={() => setIsAddingProduct(true)}
              className={styleConfig.button.primary}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Produk
            </button>
          </div>

          {/* Add Product Modal */}
          <Modal
            isOpen={isAddingProduct}
            onClose={() => setIsAddingProduct(false)}
            title="Tambah Produk Baru"
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                    <input
                      type="number"
                      value={newProduct.harga}
                      onChange={(e) => setNewProduct({ ...newProduct, harga: Number(e.target.value) })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                    <input
                      type="number"
                      value={newProduct.stok}
                      onChange={(e) => setNewProduct({ ...newProduct, stok: Number(e.target.value) })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Buat Produk
                </button>
              </div>
            </form>
          </Modal>

          {/* Edit Product Modal */}
          <Modal
            isOpen={!!editingProduct}
            onClose={() => setEditingProduct(null)}
            title="Edit Product"
          >
            {editingProduct && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEdit(editingProduct);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                      <input
                        type="number"
                        value={editingProduct.harga}
                        onChange={(e) => setEditingProduct({ ...editingProduct, harga: Number(e.target.value) })}
                        className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                      <input
                        type="number"
                        value={editingProduct.stok}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stok: Number(e.target.value) })}
                        className="w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}
          </Modal>

          {/* Products Table */}
          <div className={styleConfig.table.wrapper}>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Rp {product.harga.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.stok}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(String(product.id))}
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

          {/* Add Delete Confirmation Modal */}
          <Modal
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            title="Konfirmasi Hapus"
          >
            <div className="p-6">
              <p className="mb-4">Anda yakin ingin menghapus produk ini?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </Modal>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={setItemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}

