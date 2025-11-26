// Servicio de impresión de tickets
export const printService = {
    // Imprimir ticket usando la API de impresión del navegador
    printTicket: async (sale, settings) => {
        if (!settings.autoPrint && !window.confirm('¿Desea imprimir el ticket?')) {
            return;
        }

        const printWindow = window.open('', '_blank');
        const ticketHTML = generateTicketHTML(sale, settings);
        
        printWindow.document.write(ticketHTML);
        printWindow.document.close();
        
        // Esperar a que se cargue el contenido
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        };
    },

    // Generar HTML del ticket
    generateTicketHTML: (sale, settings) => {
        return generateTicketHTML(sale, settings);
    }
};

function generateTicketHTML(sale, settings) {
    const date = new Date(sale.date);
    const itemsHTML = sale.items.map(item => `
        <tr>
            <td>${item.quantity}x ${item.name}</td>
            <td style="text-align: right;">$${(item.priceUSD * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket de Venta</title>
            <style>
                @media print {
                    @page { size: 80mm auto; margin: 0; }
                    body { margin: 0; padding: 10px; }
                }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    width: 80mm;
                    margin: 0 auto;
                    padding: 10px;
                }
                .header { text-align: center; margin-bottom: 10px; }
                .header h1 { margin: 0; font-size: 18px; }
                .info { margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                table td { padding: 3px 0; border-bottom: 1px dashed #ccc; }
                .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
                .footer { text-align: center; margin-top: 15px; font-size: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MI BODEGUITA</h1>
                <div class="info">${date.toLocaleString()}</div>
            </div>
            ${sale.customer ? `<div class="info">Cliente: ${sale.customer.name}</div>` : ''}
            <table>
                ${itemsHTML}
            </table>
            ${sale.discount > 0 ? `
                <div>Subtotal: $${(sale.totalUSD + sale.discount).toFixed(2)}</div>
                <div>Descuento: -$${sale.discount.toFixed(2)}</div>
            ` : ''}
            <div class="total">
                TOTAL: $${sale.totalUSD.toFixed(2)}<br>
                ${sale.totalBs.toFixed(2)} Bs
            </div>
            <div class="info">
                Método: ${sale.paymentMethod === 'mobile' ? 'Pago Móvil' : sale.paymentMethod === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD'}<br>
                ${sale.reference ? `Ref: ${sale.reference}` : ''}
            </div>
            <div class="footer">
                ¡Gracias por su compra!<br>
                Venta #${sale.id.substring(0, 8)}
            </div>
        </body>
        </html>
    `;
}
