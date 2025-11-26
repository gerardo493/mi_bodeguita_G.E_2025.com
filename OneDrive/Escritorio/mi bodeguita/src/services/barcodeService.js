// Servicio para manejo de códigos de barras
export const barcodeService = {
    // Buscar producto por código de barras
    findProductByBarcode: (barcode, products) => {
        return products.find(p => p.barcode === barcode || p.sku === barcode);
    },

    // Generar código de barras (simulado - en producción usar librería real)
    generateBarcode: (productId) => {
        // Generar un código EAN-13 simulado
        const prefix = '770';
        const productCode = productId.substring(0, 9).padStart(9, '0');
        const checkDigit = calculateCheckDigit(prefix + productCode);
        return prefix + productCode + checkDigit;
    },

    // Validar formato de código de barras
    validateBarcode: (barcode) => {
        // Validar EAN-13, UPC, Code128, etc.
        if (!barcode || barcode.length < 8) return false;
        return /^\d+$/.test(barcode);
    }
};

function calculateCheckDigit(barcode) {
    let sum = 0;
    for (let i = 0; i < barcode.length; i++) {
        const digit = parseInt(barcode[i]);
        sum += (i % 2 === 0) ? digit : digit * 3;
    }
    return (10 - (sum % 10)) % 10;
}
