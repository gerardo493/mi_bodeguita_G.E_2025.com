import React, { useState } from 'react';
import { X, Package, Plus, Minus, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

const InventoryQuickView = ({ onClose }) => {
    const products = useStore((state) => state.products);
    const increaseStock = useStore((state) => state.increaseStock);
    const decreaseStock = useStore((state) => state.decreaseStock);
    const [searchTerm, setSearchTerm] = useState('');
    const [adjustingProduct, setAdjustingProduct] = useState(null);
    const [adjustmentQuantity, setAdjustmentQuantity] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdjustStock = (product, type) => {
        const quantity = parseInt(adjustmentQuantity) || 0;
        if (quantity <= 0) {
            alert('Ingrese una cantidad válida');
            return;
        }

        if (type === 'increase') {
            increaseStock(product.id, quantity, 'adjustment', 'Ajuste manual desde POS');
        } else {
            decreaseStock(product.id, quantity, 'adjustment', 'Ajuste manual desde POS');
        }

        setAdjustingProduct(null);
        setAdjustmentQuantity('');
        alert('Stock ajustado exitosamente');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Package size={20} />
                        Vista Rápida de Inventario
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                                        {product.sku && (
                                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        product.stock === 0 ? 'bg-red-100 text-red-700' :
                                        product.stock <= 10 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {product.stock}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAdjustingProduct({ product, type: 'increase' })}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                    >
                                        <Plus size={12} />
                                        Aumentar
                                    </button>
                                    <button
                                        onClick={() => setAdjustingProduct({ product, type: 'decrease' })}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                    >
                                        <Minus size={12} />
                                        Disminuir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {adjustingProduct && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">
                                    {adjustingProduct.type === 'increase' ? 'Aumentar' : 'Disminuir'} stock de: {adjustingProduct.product.name}
                                </p>
                                <p className="text-xs text-gray-500">Stock actual: {adjustingProduct.product.stock}</p>
                            </div>
                            <input
                                type="number"
                                min="1"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                placeholder="Cant."
                                value={adjustmentQuantity}
                                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                            />
                            <button
                                onClick={() => handleAdjustStock(adjustingProduct.product, adjustingProduct.type)}
                                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                Aplicar
                            </button>
                            <button
                                onClick={() => {
                                    setAdjustingProduct(null);
                                    setAdjustmentQuantity('');
                                }}
                                className="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryQuickView;

