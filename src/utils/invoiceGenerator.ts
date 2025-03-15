import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

export const generateCustomerInvoice = (orderData: any) => {
  const doc = new jsPDF();

  // Add logo and header
  doc.addImage('/BENGKEL.png', 'PNG', 14, 10, 30, 30);
  doc.setFontSize(20);
  doc.setTextColor(51, 122, 183);
  doc.text('BENGKEL HARYO', 50, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Professional Auto Service', 50, 32);

  // Add invoice info
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('SERVICE INVOICE', 14, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 62);
  doc.text(`Invoice #: INV-${orderData.id}`, 14, 68);

  // Add customer info box
  doc.setDrawColor(51, 122, 183);
  doc.setFillColor(240, 247, 254);
  doc.roundedRect(14, 75, 182, 35, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Customer Details:', 20, 85);
  doc.setFontSize(10);
  doc.text(`Name: ${orderData.user.name}`, 20, 93);
  doc.text(`Vehicle: ${orderData.kendaraan?.merk} ${orderData.kendaraan?.tipe}`, 20, 100);
  doc.text(`Vehicle ID: ${orderData.kendaraan?.id}`, 120, 100);

  // Add service details
  const tableData = [];
  
  if (orderData.service) {
    tableData.push([
      'Service',
      orderData.service.name,
      '1',
      `Rp ${orderData.service.harga.toLocaleString()}`,
      `Rp ${orderData.service.harga.toLocaleString()}`
    ]);
  }

  if (orderData.spareParts) {
    orderData.spareParts.forEach((part: any) => {
      tableData.push([
        'Sparepart',
        part.sparepart.name,
        part.quantity.toString(),
        `Rp ${part.sparepart.harga.toLocaleString()}`,
        `Rp ${(part.quantity * part.sparepart.harga).toLocaleString()}`
      ]);
    });
  }

  // Add service table
  autoTable(doc, {
    startY: 120,
    head: [['Type', 'Description', 'Qty', 'Price', 'Total']],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [51, 122, 183],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 70 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    theme: 'grid'
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Add total
  doc.setDrawColor(51, 122, 183);
  doc.setFillColor(240, 247, 254);
  doc.roundedRect(130, finalY + 10, 66, 25, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Total Amount:', 135, finalY + 20);
  doc.setFontSize(12);
  doc.setTextColor(51, 122, 183);
  doc.text(`Rp ${orderData.totalHarga.toLocaleString()}`, 135, finalY + 28);

  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', doc.internal.pageSize.width / 2, finalY + 45, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

  return doc;
};
