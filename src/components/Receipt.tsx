import { Riwayat } from '@prisma/client';

interface ReceiptProps {
  transaction: Riwayat & {
    user: { name: string; };
    service?: { name: string; harga: number; } | null;
    sparepart?: { name: string; harga: number; } | null;
  };
}

const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Service Receipt</h2>
        <p className="text-gray-600">#{transaction.id}</p>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="font-medium mb-2">Customer Details</h3>
          <p>{transaction.user.name}</p>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-medium mb-2">Service Details</h3>
          {transaction.service && (
            <div className="flex justify-between">
              <span>{transaction.service.name}</span>
              <span>Rp {transaction.service.harga.toLocaleString()}</span>
            </div>
          )}
        </div>

        {transaction.sparepart && (
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Spareparts</h3>
            <div className="flex justify-between">
              <span>{transaction.sparepart.name}</span>
              <span>Rp {transaction.sparepart.harga.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="text-right pt-4">
          <div className="text-lg font-bold">
            Total: Rp {transaction.totalHarga.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
