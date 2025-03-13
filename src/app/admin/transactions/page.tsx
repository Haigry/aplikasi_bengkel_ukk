'use client';
import { useState, useEffect } from 'react';
import { Riwayat, User, Service, Sparepart } from '@prisma/client';
import Receipt from '@/components/Receipt';
import Modal from '@/components/common/Modal';

// Add interface for transaction with relations
interface TransactionWithRelations extends Riwayat {
  user: {
    name: string;
  };
  service: (Service & { name: string; harga: number; }) | null;
  sparepart: (Sparepart & { name: string; harga: number; }) | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin?model=riwayat');
      const data = await res.json();
      setTransactions(data as TransactionWithRelations[]);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
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
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">#{transaction.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.service?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.sparepart?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Rp {transaction.totalHarga.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedTransaction(transaction)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Receipt"
      >
        {selectedTransaction && <Receipt transaction={selectedTransaction} />}
      </Modal>
    </div>
  );
}
