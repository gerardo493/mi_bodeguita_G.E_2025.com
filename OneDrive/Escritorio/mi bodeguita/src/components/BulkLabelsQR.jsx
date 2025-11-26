import React, { useState } from 'react';
import { X, QrCode, Printer, CheckSquare, Square } from 'lucide-react';
import { useStore } from '../store/useStore';
import jsPDF from 'jspdf';

const BulkLabelsQR = ({ onClose }) => {
    const products = useStore((state) => state.products);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const suppliers = useStore((state) => state.suppliers);
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [labelSize, setLabelSize] = useState('medium');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm)
    );

    const toggleProduct = (productId) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const toggleAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const generateQRData = (product) => {
        const supplier = product.supplierId ? suppliers.find(s => s.id === product.supplierId) : null;
        // Optimizado para menor tamaño y mejor legibilidad del QR
        return JSON.stringify({
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
    };

    const generateQRCodeImage = async (data, size) => {
        try {
            const QRCode = await import('qrcode');
            // Aumentar resolución para mejor calidad (300 DPI = 11.81 px/mm)
            // Mínimo recomendado: 200 píxeles para QR legible
            const qrSizePixels = Math.max(200, Math.round(size * 11.81));
            
            return new Promise((resolve) => {
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
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSizePixels}x${qrSizePixels}&data=${encodeURIComponent(data)}&ecc=H&margin=4`;
                        resolve(qrUrl);
                    } else {
                        resolve(url);
                    }
                });
            });
        } catch {
            const qrSizePixels = Math.max(200, Math.round(size * 11.81));
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSizePixels}x${qrSizePixels}&data=${encodeURIComponent(data)}&ecc=H&margin=4`;
            return Promise.resolve(qrUrl);
        }
    };

    const generateBulkPDF = async () => {
        if (selectedProducts.size === 0) {
            alert('Seleccione al menos un producto');
            return;
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm' });

        const sizes = {
            small: { width: 50, height: 30, fontSize: 8, perRow: 4, perCol: 8 },
            medium: { width: 80, height: 50, fontSize: 10, perRow: 2, perCol: 5 },
            large: { width: 100, height: 70, fontSize: 12, perRow: 2, perCol: 3 }
        };

        const size = sizes[labelSize];
        const selectedProductsList = filteredProducts.filter(p => selectedProducts.has(p.id));

        for (let idx = 0; idx < selectedProductsList.length; idx++) {
            const product = selectedProductsList[idx];
            if (idx > 0 && idx % (size.perRow * size.perCol) === 0) {
                doc.addPage();
            }

            const row = Math.floor((idx % (size.perRow * size.perCol)) / size.perRow);
            const col = (idx % (size.perRow * size.perCol)) % size.perRow;

            const startX = 10 + (col * (size.width + 5));
            const startY = 10 + (row * (size.height + 5));

            // Fondo
            doc.setFillColor(255, 255, 255);
            doc.rect(startX, startY, size.width, size.height, 'F');

            // Borde
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.rect(startX, startY, size.width, size.height);

            // Nombre
            doc.setFontSize(size.fontSize);
            doc.setFont(undefined, 'bold');
            doc.text(product.name.substring(0, 20), startX + size.width / 2, startY + 5, { align: 'center', maxWidth: size.width - 4 });

            // SKU
            if (product.sku) {
                doc.setFontSize(size.fontSize - 2);
                doc.setFont(undefined, 'normal');
                doc.text(`SKU: ${product.sku}`, startX + 2, startY + 10);
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
            
            const qrData = generateQRData(product);
            const qrImage = await generateQRCodeImage(qrData, qrSize);
            doc.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize);

            // Stock
            doc.setFontSize(size.fontSize - 1);
            doc.text(`Stock: ${product.stock}`, startX + 2, startY + size.height - 5);
        }

        doc.save(`etiquetas-masivas-${Date.now()}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <QrCode size={20} />
                        Generar Etiquetas con QR (Masivo)
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 space-y-3">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
                            <select
                                value={labelSize}
                                onChange={(e) => setLabelSize(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="small">Pequeña</option>
                                <option value="medium">Mediana</option>
                                <option value="large">Grande</option>
                            </select>
                        </div>
                        <button
                            onClick={toggleAll}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                        >
                            {selectedProducts.size === filteredProducts.length ? (
                                <>
                                    <CheckSquare size={18} />
                                    Deseleccionar Todo
                                </>
                            ) : (
                                <>
                                    <Square size={18} />
                                    Seleccionar Todo
                                </>
                            )}
                        </button>
                    </div>
                    <div className="text-sm text-gray-600">
                        {selectedProducts.size} de {filteredProducts.length} productos seleccionados
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredProducts.map((product) => {
                            const isSelected = selectedProducts.has(product.id);
                            const supplier = product.supplierId ? suppliers.find(s => s.id === product.supplierId) : null;
                            
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => toggleProduct(product.id)}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center mt-0.5 ${
                                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                        }`}>
                                            {isSelected && (
                                                <span className="text-white text-xs">✓</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
                                            {product.sku && (
                                                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                            )}
                                            <p className="text-sm font-bold text-gray-900 mt-1">
                                                ${product.priceUSD?.toFixed(2) || '0.00'}
                                            </p>
                                            {supplier && (
                                                <p className="text-xs text-gray-500">Proveedor: {supplier.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {selectedProducts.size > 0 && (
                    <div className="p-4 border-t border-gray-100 flex gap-2">
                        <button
                            onClick={async () => {
                                try {
                                    await generateBulkPDF();
                                    alert(`${selectedProducts.size} etiquetas generadas exitosamente`);
                                } catch (error) {
                                    console.error('Error generando PDF:', error);
                                    alert('Error al generar el PDF. Por favor, intente nuevamente.');
                                }
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                        >
                            <Printer size={18} />
                            <span>Generar {selectedProducts.size} Etiquetas PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkLabelsQR;

