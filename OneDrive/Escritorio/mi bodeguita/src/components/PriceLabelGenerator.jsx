import React, { useState } from 'react';
import { X, Tag, Printer } from 'lucide-react';
import { useStore } from '../store/useStore';
import QRCode from './QRCode';
import jsPDF from 'jspdf';

const PriceLabelGenerator = ({ onClose }) => {
    const products = useStore((state) => state.products);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [labelSize, setLabelSize] = useState('small'); // small, medium, large

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleProduct = (product) => {
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.filter(p => p.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const handleGenerateLabels = () => {
        if (selectedProducts.length === 0) {
            alert('Seleccione al menos un producto');
            return;
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        let yPos = 10;
        const labelsPerPage = labelSize === 'small' ? 6 : labelSize === 'medium' ? 4 : 2;
        const labelHeight = (pageHeight - 20) / labelsPerPage;

        selectedProducts.forEach((product, index) => {
            if (index > 0 && index % labelsPerPage === 0) {
                doc.addPage();
                yPos = 10;
            }

            const currentY = yPos + (index % labelsPerPage) * labelHeight;

            // Nombre del producto
            doc.setFontSize(labelSize === 'small' ? 10 : labelSize === 'medium' ? 12 : 14);
            doc.text(product.name, 10, currentY, { maxWidth: pageWidth - 20 });

            // Precio
            doc.setFontSize(labelSize === 'small' ? 14 : labelSize === 'medium' ? 18 : 22);
            doc.setFont(undefined, 'bold');
            doc.text(`$${product.priceUSD.toFixed(2)}`, 10, currentY + 8);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`${product.priceBS?.toFixed(2) || (product.priceUSD * exchangeRate).toFixed(2)} Bs`, 10, currentY + 12);

            // SKU
            if (product.sku) {
                doc.setFontSize(8);
                doc.text(`SKU: ${product.sku}`, 10, currentY + 16);
            }

            // Línea divisoria
            doc.line(10, currentY + 20, pageWidth - 10, currentY + 20);
        });

        doc.save(`etiquetas-${Date.now()}.pdf`);
        alert('Etiquetas generadas exitosamente');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Tag size={20} />
                        Generar Etiquetas de Precio
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 space-y-3">
                    <div>
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño de Etiqueta</label>
                        <select
                            value={labelSize}
                            onChange={(e) => setLabelSize(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="small">Pequeña (6 por página)</option>
                            <option value="medium">Mediana (4 por página)</option>
                            <option value="large">Grande (2 por página)</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredProducts.map((product) => {
                            const isSelected = selectedProducts.find(p => p.id === product.id);
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => handleToggleProduct(product)}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{product.name}</p>
                                            <p className="text-sm text-gray-600">${product.priceUSD?.toFixed(2)}</p>
                                            {product.sku && (
                                                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {selectedProducts.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-medium">
                                {selectedProducts.length} productos seleccionados
                            </span>
                        </div>
                        <button
                            onClick={handleGenerateLabels}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
                        >
                            <Printer size={18} />
                            <span>Generar Etiquetas PDF</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriceLabelGenerator;

