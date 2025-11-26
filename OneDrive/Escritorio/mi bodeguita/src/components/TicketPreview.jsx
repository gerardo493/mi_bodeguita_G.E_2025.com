import React from 'react';
import { X, Printer } from 'lucide-react';
import { useStore } from '../store/useStore';
import { printService } from '../services/printService';
import QRCode from './QRCode';

const TicketPreview = ({ cart, totalUSD, totalBs, discount, customer, onClose, onConfirm }) => {
    const exchangeRate = useStore((state) => state.exchangeRate);
    const settings = useStore((state) => state.settings);

    const subtotalUSD = cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
    const discountAmount = discount || 0;

    const handlePrint = () => {
        const saleData = {
            items: cart,
            totalUSD,
            totalBs,
            discount: discountAmount,
            customer,
            date: new Date().toISOString(),
            id: crypto.randomUUID()
        };
        printService.printTicket(saleData, settings);
    };

    const qrData = JSON.stringify({
        items: cart.map(item => ({ name: item.name, qty: item.quantity, price: item.priceUSD })),
        totalUSD,
        totalBs,
        customer: customer?.name || 'Público General',
        date: new Date().toISOString()
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h3 className="text-lg font-bold text-gray-800">Vista Previa del Ticket</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Simulación de ticket */}
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 font-mono text-sm">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-bold">MI BODEGUITA</h2>
                            <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
                        </div>

                        {customer && (
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <p className="text-xs">Cliente: {customer.name}</p>
                                {customer.ci && <p className="text-xs">C.I.: {customer.ci}</p>}
                            </div>
                        )}

                        <div className="mb-4 space-y-2">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                    <div className="flex-1">
                                        <p>{item.quantity}x {item.name}</p>
                                        {item.notes && (
                                            <p className="text-gray-500 italic">Nota: {item.notes}</p>
                                        )}
                                    </div>
                                    <p className="ml-2">${(item.priceUSD * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-2 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${subtotalUSD.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Descuento:</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                                <span>TOTAL USD:</span>
                                <span>${totalUSD.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-blue-600">
                                <span>TOTAL Bs:</span>
                                <span>{totalBs.toFixed(2)} Bs</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                            <QRCode value={qrData} size={120} />
                            <p className="text-xs text-gray-500 mt-2">Escanea para ver detalles</p>
                        </div>

                        <div className="mt-4 text-center text-xs text-gray-500">
                            ¡Gracias por su compra!
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        <Printer size={18} />
                        <span>Imprimir</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Confirmar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketPreview;

