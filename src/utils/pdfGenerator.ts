import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Riwayat } from '@prisma/client';

interface RiwayatWithDetails extends Riwayat {
  message: string;
  user: {
    name: string;
    noTelp: string;
    alamat?: string;
  };
  karyawan: {
    name: string;
  };
  kendaraan: {
    id: string;
    merk: string;
    tipe: string;
  };
  service?: {
    name: string;
    harga: number;
  };
  spareParts: Array<{
    sparepart: {
      name: string;
      harga: number;
    };
    quantity: number;
    harga: number;
  }>;
}

export const generateInvoicePDF = (riwayat: RiwayatWithDetails) => {
  const doc = new jsPDF();
  const company = "Bengkel Auto Service";
  
  // Header
  doc.setFontSize(20);
  doc.text(company, 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text("INVOICE", 105, 25, { align: 'center' });
  
  // Invoice Info
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${new Date(riwayat.createdAt).toLocaleDateString()}`, 15, 40);
  doc.text(`Invoice #: INV-${riwayat.id.toString().padStart(5, '0')}`, 15, 45);
  
  // Customer Info
  doc.text('Customer Details:', 15, 60);
  doc.text(`Name: ${riwayat.user.name}`, 15, 65);
  doc.text(`Phone: ${riwayat.user.noTelp}`, 15, 70);
  doc.text(`Address: ${riwayat.user.alamat || '-'}`, 15, 75);
  
  // Vehicle Info
  doc.text('Vehicle Details:', 120, 60);
  doc.text(`Plate: ${riwayat.kendaraan.id}`, 120, 65);
  doc.text(`Brand: ${riwayat.kendaraan.merk}`, 120, 70);
  doc.text(`Type: ${riwayat.kendaraan.tipe}`, 120, 75);
  
  // Add Service Request Details
  doc.text('Service Request:', 15, 85);
  doc.text(riwayat.message || '-', 15, 90);
  
  // Adjust starting Y position for table
  const tableStartY = 100;
  
  // Items Table with enhanced styling
  const tableData = [];
  if (riwayat.service) {
    tableData.push([
      'Service',
      riwayat.service.name,
      '1',
      `Rp ${riwayat.service.harga.toLocaleString()}`,
      `Rp ${riwayat.service.harga.toLocaleString()}`
    ]);
  }
  
  if (riwayat.spareParts && riwayat.spareParts.length > 0) {
    riwayat.spareParts.forEach(part => {
      tableData.push([
        'Sparepart',
        part.sparepart.name,
        part.quantity.toString(),
        `Rp ${part.harga.toLocaleString()}`,
        `Rp ${(part.harga * part.quantity).toLocaleString()}`
      ]);
    });
  }
  
  (doc as any).autoTable({
    startY: tableStartY,
    head: [['Type', 'Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [66, 139, 202],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total: Rp ${riwayat.totalHarga.toLocaleString()}`, 150, finalY);
  
  // Footer
  doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });
  doc.text(`Served by: ${riwayat.karyawan.name}`, 105, finalY + 25, { align: 'center' });
  
  return doc;
};
