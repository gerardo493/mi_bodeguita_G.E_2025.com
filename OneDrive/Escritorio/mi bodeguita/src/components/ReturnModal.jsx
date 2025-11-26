import React, { useState } from 'react';
import { X, Search, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

const ReturnModal = ({ onClose }) => {
    const sales = useStore((state) => state.sales);
    const addReturn = useStore((state) => state.addReturn);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const [returnItems, setReturnItems] = useState([]);

    const filteredSales = sales.filter(sale => {
        const searchLower = searchTerm.toLowerCase();
        return (
            sale.id.toLowerCase().includes(searchLower) ||
            sale.items.some(item => item.name.toLowerCase().includes(searchLower)) ||
            (sale.customer && sale.customer.name.toLowerCase().includes(searchLower))
        );
    }).slice(0, 10);

    const handleSelectSale = (sale) => {
        setSelectedSale(sale);
        setReturnItems(sale.items.map(item => ({ ...item, returnQuantity: 0 })));
    };

    const handleReturnQuantityChange = (itemId, quantity) => {
        const item = selectedSale.items.find(i => i.id === itemId);
        setReturnItems(returnItems.map(ri => 
            ri.id === itemId 
                ? { ...ri, returnQuantity: Math.min(quantity, item.quantity) }
                : ri
        ));
    };

    const handleProcessReturn = () => {
        const itemsToReturn = returnItems.filter(ri => ri.returnQuantity > 0);
        if (itemsToReturn.length === 0) {
            alert('Seleccione al menos un producto para devolver');
            return;
        }

        const returnData = {
            id: crypto.randomUUID(),
            saleId: selectedSale.id,
            date: new Date().toISOString(),
            items: itemsToReturn.map(ri => ({
                productId: ri.id,
                name: ri.name,
                quantity: ri.returnQuantity,
                priceUSD: ri.priceUSD
            })),
            totalUSD: itemsToReturn.reduce((sum, ri) => sum + (ri.priceUSD * ri.returnQuantity), 0),
            reason: 'Devolución de cliente'
        };

        addReturn(returnData);
        alert('Devolución procesada exitosamente');
        onClose();
    };

    if (selectedSale) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">
                                <ArrowLeft size={20} />
                            </button>
                            <h3 className="text-lg font-bold text-gray-800">Procesar Devolución</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Venta #${selectedSale.id.substring(0, 8)}</p>
                            <p className="text-sm text-gray-600">{format(new Date(selectedSale.date), 'dd/MM/yyyy HH:mm')}</p>
                        </div>

                        <div className="space-y-3">
                            {returnItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-500">
                                            Comprado: {item.quantity} x ${item.priceUSD.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="0"
                                            max={item.quantity}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                                            value={item.returnQuantity}
                                            onChange={(e) => handleReturnQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                        />
                                        <span className="text-sm text-gray-500">de {item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total a Devolver</p>
                            <p className="text-2xl font-bold text-blue-700">
                                ${returnItems.reduce((sum, ri) => sum + (ri.priceUSD * ri.returnQuantity), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 flex gap-2">
                        <button
                            onClick={() => setSelectedSale(null)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Volver
                        </button>
                        <button
                            onClick={handleProcessReturn}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Procesar Devolución
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
                    <h3 className="text-lg font-bold text-gray-800">Devoluciones</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar venta por ID, producto o cliente..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        {filteredSales.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No se encontraron ventas</p>
                        ) : (
                            filteredSales.map((sale) => (
                                <button
                                    key={sale.id}
                                    onClick={() => handleSelectSale(sale)}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                Venta #{sale.id.substring(0, 8)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}
                                            </p>
                                            {sale.customer && (
                                                <p className="text-sm text-gray-500">Cliente: {sale.customer.name}</p>
                                            )}
                                        </div>
                                        <p className="font-bold text-gray-900">${sale.totalUSD.toFixed(2)}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnModal;
