import React from 'react';
import { X, Calendar, User, DollarSign, Smartphone, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import QRCode from './QRCode';

const SaleDetailModal = ({ sale, onClose }) => {
    const getPaymentIcon = (method) => {
        switch (method) {
            case 'mobile': return <Smartphone size={20} className="text-blue-600" />;
            case 'cash_bs': return <Banknote size={20} className="text-green-600" />;
            case 'cash_usd': return <DollarSign size={20} className="text-green-800" />;
            default: return null;
        }
    };

    const getPaymentLabel = (method) => {
        switch (method) {
            case 'mobile': return 'Pago Móvil';
            case 'cash_bs': return 'Efectivo Bs';
            case 'cash_usd': return 'Efectivo USD';
            default: return method;
        }
    };

    const qrData = JSON.stringify({
        id: sale.id,
        date: sale.date,
        totalUSD: sale.totalUSD,
        totalBs: sale.totalBs,
        items: sale.items.map(item => ({ name: item.name, quantity: item.quantity, price: item.priceUSD }))
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Detalles de Venta</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Información general */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-gray-400" size={18} />
                            <div>
                                <p className="text-xs text-gray-500">Fecha</p>
                                <p className="font-medium text-gray-800">{format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}</p>
                            </div>
                        </div>
                        {sale.customer && (
                            <div className="flex items-center gap-2">
                                <User className="text-gray-400" size={18} />
                                <div>
                                    <p className="text-xs text-gray-500">Cliente</p>
                                    <p className="font-medium text-gray-800">{sale.customer.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Productos */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Productos</h4>
                        <div className="space-y-2">
                            {sale.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} x ${item.priceUSD.toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="font-bold text-gray-900">
                                        ${(item.priceUSD * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                        {sale.discount > 0 && (
                            <>
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${(sale.totalUSD + sale.discount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Descuento</span>
                                    <span>-${sale.discount.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-800">Total USD</span>
                            <span className="text-xl font-bold text-gray-900">${sale.totalUSD.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">Total Bs</span>
                            <span className="text-lg font-bold text-blue-600">{sale.totalBs.toFixed(2)} Bs</span>
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        {getPaymentIcon(sale.paymentMethod)}
                        <div>
                            <p className="text-sm text-gray-500">Método de Pago</p>
                            <p className="font-medium text-gray-800">{getPaymentLabel(sale.paymentMethod)}</p>
                            {sale.reference && (
                                <p className="text-sm text-gray-500 mt-1">Ref: {sale.reference}</p>
                            )}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Código QR de la Venta</p>
                        <QRCode value={qrData} size={150} />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleDetailModal;

