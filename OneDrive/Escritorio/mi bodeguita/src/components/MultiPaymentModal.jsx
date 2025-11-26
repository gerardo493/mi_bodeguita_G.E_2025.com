import React, { useState } from 'react';
import { X, Plus, Trash2, Smartphone, Banknote, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';

const MultiPaymentModal = ({ totalUSD, totalBs, onConfirm, onClose }) => {
    const exchangeRate = useStore((state) => state.exchangeRate);
    const [payments, setPayments] = useState([]);
    const [currentPayment, setCurrentPayment] = useState({ method: 'cash_usd', amount: '' });

    const addPayment = () => {
        const amount = parseFloat(currentPayment.amount);
        if (!amount || amount <= 0) return;

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = totalUSD - totalPaid;

        if (amount > remaining) {
            alert(`El monto excede lo restante: $${remaining.toFixed(2)}`);
            return;
        }

        setPayments([...payments, { ...currentPayment, amount, id: crypto.randomUUID() }]);
        setCurrentPayment({ method: 'cash_usd', amount: '' });
    };

    const removePayment = (id) => {
        setPayments(payments.filter(p => p.id !== id));
    };

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = totalUSD - totalPaid;

    const handleConfirm = () => {
        if (Math.abs(remaining) > 0.01) {
            alert(`El total pagado ($${totalPaid.toFixed(2)}) no coincide con el total ($${totalUSD.toFixed(2)})`);
            return;
        }
        onConfirm(payments);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Pago Múltiple</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
                        <p className="text-2xl font-bold text-gray-900">${totalUSD.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mt-1">{totalBs.toFixed(2)} Bs</p>
                    </div>

                    <div className="space-y-2">
                        {payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {payment.method === 'mobile' && <Smartphone size={18} className="text-blue-600" />}
                                    {payment.method === 'cash_bs' && <Banknote size={18} className="text-green-600" />}
                                    {payment.method === 'cash_usd' && <DollarSign size={18} className="text-green-800" />}
                                    <span className="font-medium">
                                        {payment.method === 'mobile' ? 'Pago Móvil' : 
                                         payment.method === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold">${payment.amount.toFixed(2)}</span>
                                    <button
                                        onClick={() => removePayment(payment.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div className="flex gap-2">
                            <select
                                value={currentPayment.method}
                                onChange={(e) => setCurrentPayment({ ...currentPayment, method: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="cash_usd">Efectivo USD</option>
                                <option value="cash_bs">Efectivo Bs</option>
                                <option value="mobile">Pago Móvil</option>
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Monto"
                                value={currentPayment.amount}
                                onChange={(e) => setCurrentPayment({ ...currentPayment, amount: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && addPayment()}
                            />
                            <button
                                onClick={addPayment}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Total Pagado</span>
                            <span className="font-bold">${totalPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Restante</span>
                            <span className={`font-bold ${remaining <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${Math.abs(remaining).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={Math.abs(remaining) > 0.01}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MultiPaymentModal;
