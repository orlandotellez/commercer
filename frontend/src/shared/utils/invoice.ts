// @ts-ignore - jsPDF UMD bundle for browser
import jsPDF from 'jspdf/dist/jspdf.umd.min.js';
import autoTable from 'jspdf-autotable';

// Access jsPDF from the window object (UMD format)
const jsPDFClass = (jsPDF as any).jsPDF || jsPDF;

interface OrderItem {
  id: string;
  product_id?: string;
  product_name?: string;
  quantity: number;
  unit_price?: number;
  subtotal: number;
}

// Union type para aceptar ambos formatos (admin y profile)
interface OrderData {
  id: string;
  customer?: string;
  customer_name?: string;
  email?: string;
  customer_email?: string;
  total: number;
  status: string;
  date?: string;
  created_at?: string;
  items?: number;
  user_id?: string;
  subtotal?: number;
  taxes?: number;
  order_items?: OrderItem[];
  items?: OrderItem[];
}

// Normalizar datos del pedido para usar con cualquier formato
const normalizeOrderData = (order: OrderData) => {
  return {
    id: order.id,
    customer: order.customer || order.customer_name || 'Cliente',
    email: order.email || order.customer_email || '',
    total: order.total,
    status: order.status,
    date: order.date || order.created_at || new Date().toISOString(),
    created_at: order.created_at || order.date,
    subtotal: order.subtotal,
    taxes: order.taxes,
    order_items: (order.order_items || order.items || []) as OrderItem[],
  };
};

export const generateInvoicePDF = (order: OrderData): void => {
  // Normalizar datos del pedido
  const orderData = normalizeOrderData(order);
  
  const doc = new jsPDFClass();

  // Colors
  const primaryColor: [number, number, number] = [51, 51, 51];
  const secondaryColor: [number, number, number] = [102, 102, 102];
  const accentColor: [number, number, number] = [0, 122, 204];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', 105, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${order.id.slice(0, 8).toUpperCase()}`, 105, 35, { align: 'center' });

  // Company Info (placeholder)
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(10);
  doc.text('TECHCOMPONENTS', 20, 55);
  doc.setFontSize(8);
  doc.text('info@techcomponents.com', 20, 62);
  doc.text('Nicaragua', 20, 68);

  // Invoice Details (right side)
  const invoiceDate = orderData.created_at || orderData.date;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.text('Fecha:', 140, 55);
  doc.text(new Date(invoiceDate).toLocaleDateString('es-AR'), 170, 55);

  doc.text('Estado:', 140, 62);
  const statusLabel = orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1);
  doc.text(statusLabel, 170, 62);

  // Client Info
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 80, 180, 35, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Cliente', 20, 90);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${orderData.customer}`, 20, 100);
  doc.text(`Email: ${orderData.email}`, 20, 108);
  doc.text(`ID Pedido: ${orderData.id.slice(0, 8).toUpperCase()}`, 20, 116);

  // Products Table
  const tableData = (orderData.order_items || []).map((item) => [
    item.product_name || 'Producto',
    item.quantity.toString(),
    `$${(item.unit_price || 0).toFixed(2)}`,
    `$${item.subtotal.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 125,
    head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: primaryColor,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Totals
  const subtotal = orderData.subtotal || orderData.total / 1.15;
  const taxes = orderData.taxes || orderData.total - subtotal;

  doc.setFillColor(245, 245, 245);
  doc.rect(120, finalY, 75, 45, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);

  // Subtotal
  doc.text('Subtotal:', 130, finalY + 12);
  doc.text(`$${subtotal.toFixed(2)}`, 190, finalY + 12, { align: 'right' });

  // IVA
  doc.text('IVA (15%):', 130, finalY + 22);
  doc.text(`$${taxes.toFixed(2)}`, 190, finalY + 22, { align: 'right' });

  // Total
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(130, finalY + 30, 190, finalY + 30);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 130, finalY + 40);
  doc.setTextColor(...accentColor);
  doc.text(`$${orderData.total.toFixed(2)}`, 190, finalY + 40, { align: 'right' });

  // Footer
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Gracias por su compra - TechComponents',
    105,
    280,
    { align: 'center' }
  );

  // Save
  doc.save(`factura-${order.id.slice(0, 8).toUpperCase()}.pdf`);
};