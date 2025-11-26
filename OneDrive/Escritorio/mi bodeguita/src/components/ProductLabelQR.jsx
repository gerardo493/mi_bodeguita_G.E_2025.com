import React, { useState } from 'react';
import { X, QrCode, Printer, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import QRCode from './QRCode';
import jsPDF from 'jspdf';

const ProductLabelQR = ({ product, onClose }) => {
    const exchangeRate = useStore((state) => state.exchangeRate);
    const suppliers = useStore((state) => state.suppliers);
    const [labelSize, setLabelSize] = useState('medium'); // small, medium, large

    const supplier = product.supplierId ? suppliers.find(s => s.id === product.supplierId) : null;

    // Generar datos para el QR (optimizado para menor tamaño y mejor legibilidad)
    const qrData = JSON.stringify({
        id: product.id,
        n: product.name, // 'n' en lugar de 'name' para reducir tamaño
        s: product.sku, // 's' en lugar de 'sku'
        b: product.barcode, // 'b' en lugar de 'barcode'
        pUSD: product.priceUSD, // 'pUSD' en lugar de 'priceUSD'
        pBS: product.priceBS, // 'pBS' en lugar de 'priceBS'
        st: product.stock, // 'st' en lugar de 'stock'
        c: product.category, // 'c' en lugar de 'category'
        sup: supplier?.name || null, // 'sup' en lugar de 'supplier'
        t: Date.now() // 't' timestamp en lugar de ISO string completo
    });

    const generateQRCodeImage = async (data, size) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Intentar usar la librería qrcode
                const QRCode = await import('qrcode');
                
                // Aumentar resolución para mejor calidad (300 DPI = 11.81 px/mm)
                // Mínimo recomendado: 200 píxeles para QR legible
                const qrSizePixels = Math.max(200, Math.round(size * 11.81));
                
                // Generar QR como data URL (imagen base64) con configuración optimizada
                QRCode.default.toDataURL(data, {
                    width: qrSizePixels,
                    margin: 4, // Zona silenciosa recomendada (mínimo 4 módulos)
                    color: {
                        dark: '#000000', // Negro puro para máximo contraste
                        light: '#FFFFFF' // Blanco puro
                    },
                    errorCorrectionLevel: 'H', // Alto nivel de corrección (30% de daño recuperable)
                    type: 'image/png', // PNG para mejor calidad
                    quality: 1.0, // Máxima calidad
                    rendererOpts: {
                        quality: 1.0
                    }
                }, (error, url) => {
                    if (error) {
                        console.error('Error generando QR:', error);
                        // Fallback: usar API online con parámetros mejorados
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSizePixels}x${qrSizePixels}&data=${encodeURIComponent(data)}&ecc=H&margin=4`;
                        resolve(qrUrl);
                    } else {
                        resolve(url);
                    }
                });
            } catch (error) {
                console.error('Error importando qrcode:', error);
                // Fallback: usar API online con parámetros mejorados
                const qrSizePixels = Math.max(200, Math.round(size * 11.81));
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSizePixels}x${qrSizePixels}&data=${encodeURIComponent(data)}&ecc=H&margin=4`;
                resolve(qrUrl);
            }
        });
    };

    const generatePDF = async () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Tamaños según la opción seleccionada
        const sizes = {
            small: { width: 50, height: 30, fontSize: 8 },
            medium: { width: 80, height: 50, fontSize: 10 },
            large: { width: 100, height: 70, fontSize: 12 }
        };

        const size = sizes[labelSize];
        const startX = (pageWidth - size.width) / 2;
        const startY = 20;

        // Fondo
        doc.setFillColor(255, 255, 255);
        doc.rect(startX, startY, size.width, size.height, 'F');

        // Borde
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(startX, startY, size.width, size.height);

        // Nombre del producto
        doc.setFontSize(size.fontSize);
        doc.setFont(undefined, 'bold');
        const productNameLines = doc.splitTextToSize(product.name, size.width - 4);
        doc.text(productNameLines, startX + size.width / 2, startY + 5, { align: 'center' });

        // SKU
        if (product.sku) {
            doc.setFontSize(size.fontSize - 2);
            doc.setFont(undefined, 'normal');
            doc.text(`SKU: ${product.sku}`, startX + 2, startY + 8);
        }

        // Precio
        doc.setFontSize(size.fontSize + 2);
        doc.setFont(undefined, 'bold');
        doc.text(`$${product.priceUSD?.toFixed(2) || '0.00'}`, startX + 2, startY + size.height - 15);
        doc.setFontSize(size.fontSize - 1);
        doc.text(`${product.priceBS?.toFixed(2) || (product.priceUSD * exchangeRate).toFixed(2)} Bs`, startX + 2, startY + size.height - 10);

        // QR Code - Generar como imagen (tamaños aumentados para mejor legibilidad)
        // Tamaño mínimo recomendado: 20mm para escaneo confiable
        const qrSize = labelSize === 'small' ? 20 : labelSize === 'medium' ? 30 : 40;
        const qrX = startX + size.width - qrSize - 3;
        const qrY = startY + 10;

        try {
            const qrImage = await generateQRCodeImage(qrData, qrSize);
            doc.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize);
        } catch (error) {
            console.error('Error agregando QR al PDF:', error);
            // Fallback: dibujar un rectángulo con texto
            doc.setFontSize(6);
            doc.text('QR', qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' });
            doc.rect(qrX, qrY, qrSize, qrSize);
        }

        // Stock
        doc.setFontSize(size.fontSize - 1);
        doc.text(`Stock: ${product.stock}`, startX + 2, startY + size.height - 5);

        doc.save(`etiqueta-${product.sku || product.id.substring(0, 8)}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <QrCode size={20} />
                        Etiqueta con QR - {product.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Vista previa de la etiqueta */}
                        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex items-center justify-center">
                            <div className={`bg-white border-2 border-gray-300 rounded-lg p-4 ${labelSize === 'small' ? 'w-48' : labelSize === 'medium' ? 'w-64' : 'w-80'}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 mb-1 text-sm">{product.name}</h4>
                                        {product.sku && (
                                            <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                                        )}
                                        <div className="mb-2">
                                            <p className="text-lg font-bold text-gray-900">
                                                ${product.priceUSD?.toFixed(2) || '0.00'}
                                            </p>
                                            <p className="text-sm text-blue-600">
                                                {product.priceBS?.toFixed(2) || (product.priceUSD * exchangeRate).toFixed(2)} Bs
                                            </p>
                                        </div>
                                        {supplier && (
                                            <p className="text-xs text-gray-500">Proveedor: {supplier.name}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className={`bg-white border border-gray-200 rounded p-2 ${labelSize === 'small' ? 'w-16 h-16' : labelSize === 'medium' ? 'w-24 h-24' : 'w-32 h-32'}`}>
                                            <QRCode value={qrData} size={labelSize === 'small' ? 60 : labelSize === 'medium' ? 90 : 120} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuración */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño de Etiqueta</label>
                            <select
                                value={labelSize}
                                onChange={(e) => setLabelSize(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="small">Pequeña (50x30mm)</option>
                                <option value="medium">Mediana (80x50mm)</option>
                                <option value="large">Grande (100x70mm)</option>
                            </select>
                        </div>

                        {/* Información del QR */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Información en el QR:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• ID del producto</li>
                                <li>• Nombre y SKU</li>
                                <li>• Código de barras</li>
                                <li>• Precios (USD y Bs)</li>
                                <li>• Stock disponible</li>
                                <li>• Categoría</li>
                                {supplier && <li>• Proveedor: {supplier.name}</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-2">
                    <button
                        onClick={async () => {
                            try {
                                await generatePDF();
                            } catch (error) {
                                console.error('Error generando PDF:', error);
                                alert('Error al generar el PDF. Por favor, intente nuevamente.');
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                    >
                        <Printer size={18} />
                        <span>Generar PDF</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductLabelQR;

