'use client';
import { useState, useEffect } from 'react';
import { Laporan, RiwayatLaporan } from '@prisma/client';

interface ReportWithDetails extends Laporan {
  riwayatLaporan: Array<RiwayatLaporan & {
    riwayat: {
      totalHarga: number;
      user: { name: string };
      service: { name: string } | null;
      sparepart: { name: string } | null;
    }
  }>;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [period, setPeriod] = useState<'HARIAN' | 'MINGGUAN' | 'BULANAN'>('HARIAN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin?model=laporan');
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    // Implementation pending based on requirements
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Reports</h1>
        <button
          onClick={generateReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Generate Report
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        {(['HARIAN', 'MINGGUAN', 'BULANAN'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg ${
              period === p 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(report.tanggal).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{report.periode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{report.jumlahServis}</td>
                <td className="px-6 py-4 whitespace-nowrap">{report.jumlahSparepart}</td>
                <td className="px-6 py-4 whitespace-nowrap">{report.totalTransaksi}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Rp {report.omset.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
