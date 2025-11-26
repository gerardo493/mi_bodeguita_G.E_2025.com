import React, { useState, useEffect } from 'react';
import { Calculator, X, DollarSign } from 'lucide-react';

const ChangeCalculator = ({ total, onClose }) => {
    const [amountPaid, setAmountPaid] = useState('');
    const [change, setChange] = useState(0);
    const [suggestedBills, setSuggestedBills] = useState([]);

    useEffect(() => {
        if (amountPaid && parseFloat(amountPaid) >= total) {
            const changeAmount = parseFloat(amountPaid) - total;
            setChange(changeAmount);
            
            // Calcular billetes sugeridos (simulado para USD)
            const bills = [100, 50, 20, 10, 5, 1, 0.50, 0.25, 0.10, 0.05, 0.01];
            const result = [];
            let remaining = changeAmount;
            
            bills.forEach(bill => {
                const count = Math.floor(remaining / bill);
                if (count > 0) {
                    result.push({ value: bill, count });
                    remaining = (remaining % bill).toFixed(2);
                }
            });
            
            setSuggestedBills(result);
        } else {
            setChange(0);
            setSuggestedBills([]);
        }
    }, [amountPaid, total]);

    const quickAmounts = [total, total * 1.1, total * 1.2, total * 1.5, total * 2];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Calculator size={20} />
                        Calculadora de Cambio
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
                        <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto Recibido
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
                            placeholder="0.00"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {quickAmounts.map((amount, idx) => (
                            <button
                                key={idx}
                                onClick={() => setAmountPaid(amount.toFixed(2))}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                            >
                                ${amount.toFixed(2)}
                            </button>
                        ))}
                    </div>

                    {change > 0 && (
                        <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-lg font-semibold text-gray-700">Cambio:</span>
                                <span className="text-3xl font-bold text-green-600">
                                    ${change.toFixed(2)}
                                </span>
                            </div>

                            {suggestedBills.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Sugerencia de billetes:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedBills.slice(0, 6).map((bill, idx) => (
                                            <div
                                                key={idx}
                                                className="px-3 py-1 bg-white border border-green-200 rounded text-sm"
                                            >
                                                {bill.count}x ${bill.value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {change < 0 && (
                        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                            <p className="text-red-700 font-semibold">
                                Faltan ${Math.abs(change).toFixed(2)}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeCalculator;

