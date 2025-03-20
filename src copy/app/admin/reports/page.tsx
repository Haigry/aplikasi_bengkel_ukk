'use client';
import { useState, useEffect } from 'react';
import { Laporan, RiwayatLaporan, Riwayat } from '@prisma/client';
import Pagination from '@/components/common/Pagination';
import { toast } from 'react-hot-toast';
// Update imports
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Update interface
type AutoTablePlugin = {
  autoTable: typeof autoTable;
}

type JsPDFWithPlugin = jsPDF & AutoTablePlugin;

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
  const [generating, setGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?model=riwayat');
      const orders = await res.json();

      const reportData = processOrdersData(orders, period);
      setReports(reportData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const processOrdersData = (orders: Riwayat[], selectedPeriod: string) => {
    const reports: ReportWithDetails[] = [];
    const groupedOrders = new Map();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key;

      switch (selectedPeriod) {
        case 'HARIAN':
          key = date.toISOString().split('T')[0];
          break;
        case 'MINGGUAN':
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          key = startOfWeek.toISOString().split('T')[0];
          break;
        case 'BULANAN':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groupedOrders.has(key)) {
        groupedOrders.set(key, []);
      }
      groupedOrders.get(key).push(order);
    });

    for (const [date, groupOrders] of groupedOrders) {
      const totalRevenue = groupOrders.reduce((sum: number, order: Riwayat) => sum + order.totalHarga, 0);
      const servicesCount = groupOrders.filter((order: Riwayat) => order.serviceId).length;
      const sparepartsCount = groupOrders.filter((order: Riwayat) => order.sparepartId).length;

      reports.push({
        id: date,
        tanggal: new Date(date),
        periode: selectedPeriod,
        jumlahServis: servicesCount,
        jumlahSparepart: sparepartsCount,
        totalTransaksi: groupOrders.length,
        omset: totalRevenue,
        riwayatLaporan: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return reports.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const doc = new jsPDF() as JsPDFWithPlugin;

      const imgData = '/BENGKEL.png';
      doc.addImage(imgData, 'PNG', 14, 10, 30, 30);

      doc.setFontSize(20);
      doc.setTextColor(51, 122, 183);
      doc.text('BENGKEL HARYO', 50, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Professional Auto Service', 50, 32);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Service Report - ${period}`, 14, 55);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 62);

      doc.setDrawColor(51, 122, 183);
      doc.setLineWidth(0.5);
      doc.line(14, 65, 196, 65);

      const tableData = reports.map(report => [
        new Date(report.tanggal).toLocaleDateString(),
        report.periode,
        report.jumlahServis.toString(),
        report.jumlahSparepart.toString(),
        report.totalTransaksi.toString(),
        `Rp ${report.omset.toLocaleString()}`
      ]);

      // Update table generation
      autoTable(doc, {
        head: [['Date', 'Period', 'Services', 'Parts', 'Trans.', 'Revenue']],
        body: tableData,
        startY: 75,
        styles: { 
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [51, 122, 183],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        theme: 'grid'
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 75;

      const totalRevenue = reports.reduce((sum, report) => sum + report.omset, 0);
      const totalServices = reports.reduce((sum, report) => sum + report.jumlahServis, 0);
      const totalParts = reports.reduce((sum, report) => sum + report.jumlahSparepart, 0);

      doc.setDrawColor(51, 122, 183);
      doc.setFillColor(240, 247, 254);
      doc.roundedRect(14, finalY + 10, 182, 40, 3, 3, 'FD');

      doc.setFontSize(12);
      doc.setTextColor(51, 122, 183);
      doc.text('Summary', 20, finalY + 20);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const summaryData = [
        [`Total Revenue: Rp ${totalRevenue.toLocaleString()}`, `Total Services: ${totalServices}`],
        [`Total Transactions: ${reports.length}`, `Total Parts Sold: ${totalParts}`]
      ];
      
      summaryData.forEach((row, i) => {
        row.forEach((text, j) => {
          doc.text(text, 20 + (j * 90), finalY + 30 + (i * 8));
        });
      });

      const pageCount = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${pageCount} - Bengkel Haryo © ${new Date().getFullYear()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`bengkel-report-${period.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-blue-600">Laporan</span> Bengkel
          </h1>
          <p className="mt-2 text-gray-600">Lihat dan unduh laporan layanan bengkel</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating || loading || reports.length === 0}
          className={`flex items-center gap-2 px-6 py-2 rounded-md
            ${generating || loading || reports.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
        >
          {generating ? (
            <>
              <span className="animate-spin">↻</span>
              <span>Membuat Laporan...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Unduh Laporan
            </>
          )}
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        {(['HARIAN', 'MINGGUAN', 'BULANAN'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              period === p 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {p === 'HARIAN' ? 'Harian' : 
             p === 'MINGGUAN' ? 'Mingguan' : 'Bulanan'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            Ringkasan {period === 'HARIAN' ? 'Harian' : 
                      period === 'MINGGUAN' ? 'Mingguan' : 'Bulanan'}
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Servis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Sparepart</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Omset</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.periode === 'HARIAN' ? 'Harian' : 
                         report.periode === 'MINGGUAN' ? 'Mingguan' : 'Bulanan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.jumlahServis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.jumlahSparepart}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.totalTransaksi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rp {report.omset.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-medium">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reports.reduce((sum, r) => sum + r.jumlahServis, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reports.reduce((sum, r) => sum + r.jumlahSparepart, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reports.reduce((sum, r) => sum + r.totalTransaksi, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      Rp {reports.reduce((sum, r) => sum + r.omset, 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                limit={itemsPerPage}
                onPageChange={setCurrentPage}
                onLimitChange={setItemsPerPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
