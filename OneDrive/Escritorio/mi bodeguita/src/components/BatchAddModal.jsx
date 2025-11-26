import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';

const BatchAddModal = ({ onClose, onAdd }) => {
    const products = useStore((state) => state.products);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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
                return [...prev, { ...product, quantity: 1 }];
            }
        });
    };

    const handleQuantityChange = (productId, quantity) => {
        setSelectedProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p)
        );
    };

    const handleAddAll = () => {
        if (onAdd) {
            selectedProducts.forEach(item => {
                for (let i = 0; i < item.quantity; i++) {
                    onAdd(item);
                }
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Agregar Múltiples Productos</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => {
                        const isSelected = selectedProducts.find(p => p.id === product.id);
                        return (
                            <div
                                key={product.id}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleToggleProduct(product)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-sm text-gray-500">${product.priceUSD?.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuantityChange(product.id, isSelected.quantity - 1);
                                                }}
                                                className="p-1 bg-white rounded border border-gray-300"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-medium">{isSelected.quantity}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuantityChange(product.id, isSelected.quantity + 1);
                                                }}
                                                className="p-1 bg-white rounded border border-gray-300"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedProducts.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-medium">
                                {selectedProducts.length} productos seleccionados
                            </span>
                            <span className="font-bold text-lg">
                                Total: ${selectedProducts.reduce((sum, p) => sum + (p.priceUSD * p.quantity), 0).toFixed(2)}
                            </span>
                        </div>
                        <button
                            onClick={handleAddAll}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
                        >
                            Agregar al Carrito
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchAddModal;

