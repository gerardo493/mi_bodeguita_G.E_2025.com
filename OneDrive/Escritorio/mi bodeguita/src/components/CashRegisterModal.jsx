import React, { useState } from 'react';
import { X, DollarSign, Calculator, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { generateSalesReportPDF } from '../services/pdfService';

const CashRegisterModal = ({ onClose }) => {
    const currentCashRegister = useStore((state) => state.currentCashRegister);
    const openCashRegister = useStore((state) => state.openCashRegister);
    const closeCashRegister = useStore((state) => state.closeCashRegister);
    const sales = useStore((state) => state.sales);
    const exchangeRate = useStore((state) => state.exchangeRate);

    const [initialAmount, setInitialAmount] = useState('');
    const [finalAmount, setFinalAmount] = useState('');

    const handleOpen = () => {
        if (!initialAmount || parseFloat(initialAmount) < 0) {
            alert('Ingrese un monto inicial válido');
            return;
        }
        openCashRegister(parseFloat(initialAmount));
        onClose();
    };

    const handleClose = () => {
        if (!finalAmount || parseFloat(finalAmount) < 0) {
            alert('Ingrese un monto final válido');
            return;
        }
        const closedRegister = closeCashRegister(parseFloat(finalAmount));
        if (closedRegister) {
            generateSalesReportPDF(closedRegister.sales, {
                start: closedRegister.openDate,
                end: closedRegister.closeDate
            });
            alert('Corte de caja cerrado exitosamente');
            onClose();
        }
    };

    if (!currentCashRegister) {
        // Abrir caja
        const todaySales = sales.filter(s => {
            const saleDate = new Date(s.date);
            const today = new Date();
            return saleDate.toDateString() === today.toDateString();
        });

        const totalToday = todaySales.reduce((sum, s) => sum + s.totalUSD, 0);

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Abrir Caja</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Ventas del día</p>
                            <p className="text-2xl font-bold text-blue-700">${totalToday.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 mt-1">{todaySales.length} ventas</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monto Inicial en Caja (USD)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                placeholder="0.00"
                                value={initialAmount}
                                onChange={(e) => setInitialAmount(e.target.value)}
                                autoFocus
                            />
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
                            onClick={handleOpen}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Abrir Caja
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Cerrar caja
    const registerDate = new Date(currentCashRegister.openDate);
    const registerSales = sales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= registerDate;
    });

    const totalSales = registerSales.reduce((sum, s) => sum + s.totalUSD, 0);
    const expectedAmount = currentCashRegister.initialAmount + totalSales;

    const salesByMethod = registerSales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalUSD;
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h3 className="text-lg font-bold text-gray-800">Cerrar Caja</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Apertura</p>
                            <p className="text-lg font-bold text-gray-800">
                                {format(registerDate, 'dd/MM/yyyy HH:mm')}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Monto Inicial</p>
                            <p className="text-lg font-bold text-gray-800">
                                ${currentCashRegister.initialAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Resumen de Ventas</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">Total Ventas</span>
                                <span className="font-bold">${totalSales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">Monto Esperado</span>
                                <span className="font-bold">${expectedAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Ventas por Método de Pago</h4>
                        <div className="space-y-2">
                            {Object.entries(salesByMethod).map(([method, amount]) => (
                                <div key={method} className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-gray-600">
                                        {method === 'mobile' ? 'Pago Móvil' : method === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD'}
                                    </span>
                                    <span className="font-medium">${amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto Final en Caja (USD)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            placeholder="0.00"
                            value={finalAmount}
                            onChange={(e) => setFinalAmount(e.target.value)}
                            autoFocus
                        />
                        {finalAmount && (
                            <div className="mt-2 p-3 rounded-lg" style={{
                                backgroundColor: (parseFloat(finalAmount) - expectedAmount) === 0 ? '#d1fae5' : 
                                    (parseFloat(finalAmount) - expectedAmount) > 0 ? '#fef3c7' : '#fee2e2',
                                color: (parseFloat(finalAmount) - expectedAmount) === 0 ? '#065f46' : 
                                    (parseFloat(finalAmount) - expectedAmount) > 0 ? '#92400e' : '#991b1b'
                            }}>
                                <p className="font-medium">
                                    Diferencia: ${(parseFloat(finalAmount) - expectedAmount).toFixed(2)}
                                </p>
                            </div>
                        )}
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
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Cerrar Caja
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashRegisterModal;

