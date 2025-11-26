import React from 'react';
import { X, TrendingUp, Package, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';

const ProductHistoryModal = ({ product, onClose }) => {
    // Los movimientos de stock están almacenados en el producto mismo
    const productMovements = product.stockMovements || [];
    const priceHistory = product.priceHistory || [];

    const getMovementTypeLabel = (type) => {
        const labels = {
            'sale': 'Venta',
            'purchase': 'Compra',
            'return': 'Devolución',
            'adjustment': 'Ajuste',
            'transfer': 'Transferencia',
            'initial': 'Stock Inicial'
        };
        return labels[type] || type;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Clock size={20} />
                        Historial - {product.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Historial de Precios */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <TrendingUp size={18} />
                                Historial de Precios
                            </h4>
                            {priceHistory.length === 0 ? (
                                <p className="text-sm text-gray-500">No hay cambios de precio registrados</p>
                            ) : (
                                <div className="space-y-2">
                                    {priceHistory.map((entry, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        ${entry.priceUSD?.toFixed(2)} USD
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {entry.priceBS?.toFixed(2)} Bs
                                                    </p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(entry.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-blue-800">
                                                    Precio Actual: ${product.priceUSD?.toFixed(2)} USD
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    {product.priceBS?.toFixed(2)} Bs
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Movimientos de Stock */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Package size={18} />
                                Movimientos de Stock
                            </h4>
                            {productMovements.length === 0 ? (
                                <p className="text-sm text-gray-500">No hay movimientos de stock registrados</p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {productMovements.map((movement) => (
                                        <div 
                                            key={movement.id} 
                                            className={`p-3 rounded-lg border ${
                                                movement.quantity > 0 
                                                    ? 'bg-green-50 border-green-200' 
                                                    : 'bg-red-50 border-red-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {getMovementTypeLabel(movement.type)}
                                                    </p>
                                                    <p className={`text-lg font-bold ${
                                                        movement.quantity > 0 ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                                    </p>
                                                    {movement.notes && (
                                                        <p className="text-xs text-gray-600 mt-1">{movement.notes}</p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(movement.date).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductHistoryModal;

