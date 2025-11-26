import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateSalesReportPDF = (sales, dateRange = null) => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Ventas', 14, 20);
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
    
    if (dateRange) {
        doc.text(`Período: ${dateRange.start} - ${dateRange.end}`, 14, 35);
    }
    
    // Calcular totales
    const totalUSD = sales.reduce((sum, sale) => sum + sale.totalUSD, 0);
    const totalBs = sales.reduce((sum, sale) => sum + sale.totalBs, 0);
    
    // Tabla de ventas
    const tableData = sales.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        sale.items.length + ' productos',
        sale.paymentMethod === 'mobile' ? 'Pago Móvil' : sale.paymentMethod === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD',
        `$${sale.totalUSD.toFixed(2)}`,
        `${sale.totalBs.toFixed(2)} Bs`
    ]);
    
    doc.autoTable({
        startY: 40,
        head: [['Fecha', 'Productos', 'Método', 'Total USD', 'Total Bs']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Totales
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TOTALES:', 14, finalY);
    doc.setFont(undefined, 'normal');
    doc.text(`USD: $${totalUSD.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Bs: ${totalBs.toFixed(2)} Bs`, 14, finalY + 16);
    
    doc.save(`reporte-ventas-${Date.now()}.pdf`);
};

export const generateInventoryReportPDF = (products) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Inventario', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
    
    const tableData = products.map(product => [
        product.name,
        product.sku || '-',
        product.category || '-',
        `$${product.priceUSD?.toFixed(2) || '0.00'}`,
        `${product.priceBS?.toFixed(2) || '0.00'} Bs`,
        product.stock.toString()
    ]);
    
    doc.autoTable({
        startY: 40,
        head: [['Producto', 'SKU', 'Categoría', 'Precio USD', 'Precio Bs', 'Stock']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
    });
    
    const lowStock = products.filter(p => p.stock <= 10);
    if (lowStock.length > 0) {
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Productos con Stock Bajo:', 14, finalY);
        doc.setFont(undefined, 'normal');
        lowStock.forEach((product, index) => {
            doc.text(`${product.name} - Stock: ${product.stock}`, 14, finalY + 10 + (index * 6));
        });
    }
    
    doc.save(`reporte-inventario-${Date.now()}.pdf`);
};

export const generateInventoryPDF = (products, exchangeRate) => {
    return generateInventoryReportPDF(products);
};

export const generateSaleTicketPDF = (sale) => {
    const doc = new jsPDF({ format: [80, 200] }); // Ticket pequeño
    
    doc.setFontSize(14);
    doc.text('MI BODEGUITA', 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Fecha: ${new Date(sale.date).toLocaleString()}`, 40, 18, { align: 'center' });
    
    if (sale.customer) {
        doc.text(`Cliente: ${sale.customer.name}`, 40, 24, { align: 'center' });
    }
    
    doc.line(10, 28, 70, 28);
    
    let yPos = 35;
    sale.items.forEach(item => {
        doc.setFontSize(8);
        doc.text(`${item.quantity}x ${item.name}`, 10, yPos);
        doc.text(`$${(item.priceUSD * item.quantity).toFixed(2)}`, 70, yPos, { align: 'right' });
        yPos += 6;
    });
    
    doc.line(10, yPos, 70, yPos);
    yPos += 8;
    
    if (sale.discount > 0) {
        doc.text(`Subtotal: $${(sale.totalUSD + sale.discount).toFixed(2)}`, 10, yPos);
        yPos += 6;
        doc.text(`Descuento: -$${sale.discount.toFixed(2)}`, 10, yPos);
        yPos += 6;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: $${sale.totalUSD.toFixed(2)}`, 10, yPos);
    doc.text(`${sale.totalBs.toFixed(2)} Bs`, 70, yPos, { align: 'right' });
    yPos += 8;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    doc.text(`Método: ${sale.paymentMethod === 'mobile' ? 'Pago Móvil' : sale.paymentMethod === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD'}`, 10, yPos);
    if (sale.reference) {
        yPos += 5;
        doc.text(`Ref: ${sale.reference}`, 10, yPos);
    }
    
    doc.text('¡Gracias por su compra!', 40, yPos + 10, { align: 'center' });
    
    doc.save(`ticket-${sale.id}.pdf`);
};

