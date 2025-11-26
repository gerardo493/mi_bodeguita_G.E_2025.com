import React, { useState } from 'react';
import { X, Package, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

const ComboModal = ({ onClose }) => {
    const combos = useStore((state) => state.combos);
    const products = useStore((state) => state.products);
    const addToCart = useStore((state) => state.addToCart);
    const [selectedCombo, setSelectedCombo] = useState(null);

    const handleAddCombo = (combo) => {
        // Agregar todos los productos del combo al carrito
        combo.products.forEach(productData => {
            const product = products.find(p => p.id === productData.productId);
            if (product) {
                for (let i = 0; i < productData.quantity; i++) {
                    addToCart(product);
                }
            }
        });
        onClose();
    };

    if (selectedCombo) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">{selectedCombo.name}</h3>
                        <button onClick={() => setSelectedCombo(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <p className="text-gray-600">{selectedCombo.description}</p>
                        
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Productos incluidos:</h4>
                            <div className="space-y-2">
                                {selectedCombo.products.map((productData, idx) => {
                                    const product = products.find(p => p.id === productData.productId);
                                    return product ? (
                                        <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm">{productData.quantity}x {product.name}</span>
                                            <span className="text-sm text-gray-500">${(product.priceUSD * productData.quantity).toFixed(2)}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Precio Individual</span>
                                <span className="text-gray-800">${selectedCombo.products.reduce((sum, pd) => {
                                    const product = products.find(p => p.id === pd.productId);
                                    return sum + (product ? product.priceUSD * pd.quantity : 0);
                                }, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-gray-800">Precio Combo</span>
                                <span className="text-2xl font-bold text-blue-700">${selectedCombo.priceUSD.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                                Ahorro: ${(selectedCombo.products.reduce((sum, pd) => {
                                    const product = products.find(p => p.id === pd.productId);
                                    return sum + (product ? product.priceUSD * pd.quantity : 0);
                                }, 0) - selectedCombo.priceUSD).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 flex gap-2">
                        <button
                            onClick={() => setSelectedCombo(null)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Volver
                        </button>
                        <button
                            onClick={() => handleAddCombo(selectedCombo)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Package size={20} />
                        Combos y Packs
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {combos.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Package size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No hay combos disponibles</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {combos.map((combo) => (
                                <button
                                    key={combo.id}
                                    onClick={() => setSelectedCombo(combo)}
                                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                                >
                                    <h4 className="font-semibold text-gray-800 mb-2">{combo.name}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{combo.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            {combo.products.length} productos
                                        </span>
                                        <span className="text-lg font-bold text-blue-600">
                                            ${combo.priceUSD.toFixed(2)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComboModal;

