import React, { useState } from 'react';
import { X, Percent, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';

const DiscountModal = ({ onClose }) => {
    const discount = useStore((state) => state.discount);
    const discountType = useStore((state) => state.discountType);
    const setDiscount = useStore((state) => state.setDiscount);
    const clearDiscount = useStore((state) => state.clearDiscount);

    const [localDiscount, setLocalDiscount] = useState(discount.toString());
    const [localType, setLocalType] = useState(discountType);

    const handleApply = () => {
        const value = parseFloat(localDiscount) || 0;
        if (value > 0) {
            setDiscount(value, localType);
        } else {
            clearDiscount();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Aplicar Descuento</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Descuento</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLocalType('percentage')}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                    localType === 'percentage'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <Percent size={20} />
                                <span>Porcentaje</span>
                            </button>
                            <button
                                onClick={() => setLocalType('fixed')}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                    localType === 'fixed'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <DollarSign size={20} />
                                <span>Monto Fijo</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {localType === 'percentage' ? 'Porcentaje (%)' : 'Monto (USD)'}
                        </label>
                        <input
                            type="number"
                            step={localType === 'percentage' ? '1' : '0.01'}
                            min="0"
                            max={localType === 'percentage' ? '100' : undefined}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            placeholder={localType === 'percentage' ? '0' : '0.00'}
                            value={localDiscount}
                            onChange={(e) => setLocalDiscount(e.target.value)}
                        />
                    </div>

                    {localDiscount && parseFloat(localDiscount) > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                            {localType === 'percentage' 
                                ? `Descuento del ${localDiscount}%`
                                : `Descuento de $${parseFloat(localDiscount).toFixed(2)}`
                            }
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-2">
                    <button
                        onClick={clearDiscount}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Quitar Descuento
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiscountModal;

