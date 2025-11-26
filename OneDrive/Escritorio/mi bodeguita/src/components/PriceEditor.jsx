import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';

const PriceEditor = ({ item, onClose, onSave }) => {
    const exchangeRate = useStore((state) => state.exchangeRate);
    const [priceUSD, setPriceUSD] = useState(item.priceUSD?.toFixed(2) || '0.00');
    const [priceBS, setPriceBS] = useState(item.priceBS?.toFixed(2) || (item.priceUSD * exchangeRate).toFixed(2));

    const handlePriceUSDChange = (value) => {
        const usd = parseFloat(value) || 0;
        const bs = (usd * exchangeRate).toFixed(2);
        setPriceUSD(value);
        setPriceBS(bs);
    };

    const handlePriceBSChange = (value) => {
        const bs = parseFloat(value) || 0;
        const usd = (bs / exchangeRate).toFixed(2);
        setPriceBS(value);
        setPriceUSD(usd);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(parseFloat(priceUSD));
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign size={20} />
                        Editar Precio
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Producto: <span className="font-medium">{item.name}</span></p>
                        <p className="text-xs text-gray-500">Precio original: ${item.priceUSD?.toFixed(2) || '0.00'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio USD</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            value={priceUSD}
                            onChange={(e) => handlePriceUSDChange(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Bs</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            value={priceBS}
                            onChange={(e) => handlePriceBSChange(e.target.value)}
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Tasa de cambio</p>
                        <p className="text-sm font-medium">{exchangeRate.toFixed(2)} Bs/$</p>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PriceEditor;

