import React, { useState, useEffect } from 'react';
import { X, Smartphone, Banknote, DollarSign, CheckCircle, Printer, CreditCard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { printService } from '../services/printService';
import { soundService } from '../services/soundService';
import MultiPaymentModal from './MultiPaymentModal';
import ChangeCalculator from './ChangeCalculator';

const PaymentModal = ({ totalUSD, totalBs, discount = 0, customer = null, onClose }) => {
    const addSale = useStore((state) => state.addSale);
    const clearCart = useStore((state) => state.clearCart);
    const clearDiscount = useStore((state) => state.clearDiscount);
    const cart = useStore((state) => state.cart);
    const exchangeRate = useStore((state) => state.exchangeRate);

    const settings = useStore((state) => state.settings);
    const [paymentMethod, setPaymentMethod] = useState('mobile'); // mobile, cash_bs, cash_usd
    const [amountPaid, setAmountPaid] = useState('');
    const [reference, setReference] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [showMultiPayment, setShowMultiPayment] = useState(false);
    const [showChangeCalculator, setShowChangeCalculator] = useState(false);

    // Atajos de teclado - Solo Enter y Esc cuando NO está escribiendo
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Verificar si el usuario está escribiendo en un input
            const target = e.target;
            const isInput = target && (
                target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.isContentEditable === true
            );
            
            // Si está escribiendo, NO hacer nada (dejar que el input maneje normalmente)
            if (isInput) {
                return;
            }

            // Solo capturar Enter si NO está en un input y hay datos válidos
            if (e.key === 'Enter' && !isSuccess) {
                if (paymentMethod === 'mobile' && reference) {
                    e.preventDefault();
                    handlePayment();
                } else if ((paymentMethod === 'cash_bs' || paymentMethod === 'cash_usd') && amountPaid) {
                    const change = calculateChange();
                    if (change >= 0) {
                        e.preventDefault();
                        handlePayment();
                    }
                }
                return;
            }
            
            // Esc siempre funciona para cerrar (solo si NO está escribiendo)
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                return;
            }
        };

        // Usar capture: false para que los inputs puedan manejar primero
        window.addEventListener('keydown', handleKeyPress, false);
        return () => window.removeEventListener('keydown', handleKeyPress, false);
    }, [paymentMethod, reference, amountPaid, isSuccess]);

    const handlePayment = () => {
        const sale = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            items: cart,
            subtotalUSD: totalUSD + discount,
            discount,
            totalUSD,
            totalBs,
            paymentMethod,
            exchangeRate,
            customer: customer ? { id: customer.id, name: customer.name } : null,
            reference: paymentMethod === 'mobile' ? reference : null,
            amountPaid: parseFloat(amountPaid) || 0,
            change: calculateChange()
        };

        addSale(sale);
        clearDiscount();
        setIsSuccess(true);
        
        // Reproducir sonido
        if (settings.soundEnabled) {
            soundService.playSale();
        }

        // Imprimir ticket si está configurado
        if (settings.autoPrint) {
            setTimeout(() => {
                printService.printTicket(sale, settings);
            }, 500);
        }

        setTimeout(() => {
            clearCart();
            onClose();
        }, 2000);
    };

    const handleMultiPayment = (payments) => {
        const sale = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            items: cart,
            subtotalUSD: totalUSD + discount,
            discount,
            totalUSD,
            totalBs,
            paymentMethod: 'multiple',
            payments,
            exchangeRate,
            customer: customer ? { id: customer.id, name: customer.name } : null,
            reference: null,
            amountPaid: payments.reduce((sum, p) => sum + p.amount, 0),
            change: 0
        };

        addSale(sale);
        clearDiscount();
        setIsSuccess(true);
        
        if (settings.soundEnabled) {
            soundService.playSale();
        }

        if (settings.autoPrint) {
            setTimeout(() => {
                printService.printTicket(sale, settings);
            }, 500);
        }

        setTimeout(() => {
            clearCart();
            onClose();
        }, 2000);
    };

    const calculateChange = () => {
        const paid = parseFloat(amountPaid) || 0;
        if (paymentMethod === 'cash_bs') {
            return Math.max(0, paid - totalBs);
        }
        if (paymentMethod === 'cash_usd') {
            return Math.max(0, paid - totalUSD);
        }
        return 0;
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600">
                        <CheckCircle size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Venta Exitosa!</h3>
                    <p className="text-gray-500">La transacción se ha registrado correctamente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Procesar Pago</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex justify-around mb-3">
                        <button
                            onClick={() => setPaymentMethod('mobile')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-28 ${paymentMethod === 'mobile' ? 'bg-white shadow-md text-blue-600 ring-2 ring-blue-500' : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            <Smartphone size={24} />
                            <span className="text-xs font-medium">Pago Móvil</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('cash_bs')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-28 ${paymentMethod === 'cash_bs' ? 'bg-white shadow-md text-blue-600 ring-2 ring-blue-500' : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            <Banknote size={24} />
                            <span className="text-xs font-medium">Efectivo Bs</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('cash_usd')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-28 ${paymentMethod === 'cash_usd' ? 'bg-white shadow-md text-blue-600 ring-2 ring-blue-500' : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            <DollarSign size={24} />
                            <span className="text-xs font-medium">Efectivo USD</span>
                        </button>
                    </div>
                    <button
                        onClick={() => setShowMultiPayment(true)}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                        <CreditCard size={18} />
                        <span className="text-sm font-medium">Pago Múltiple</span>
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {customer && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Cliente</p>
                            <p className="font-medium text-gray-800">{customer.name}</p>
                        </div>
                    )}
                    
                    {discount > 0 && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Descuento aplicado</p>
                            <p className="font-medium text-green-700">-${discount.toFixed(2)}</p>
                        </div>
                    )}

                    <div className="mb-6 text-center">
                        <p className="text-sm text-gray-500 mb-1">Total a Pagar</p>
                        <div className="text-3xl font-bold text-gray-900">
                            {paymentMethod === 'cash_usd' ? `$${totalUSD.toFixed(2)}` : `${totalBs.toFixed(2)} Bs`}
                        </div>
                        {paymentMethod !== 'cash_usd' && (
                            <p className="text-sm text-gray-400 mt-1">Ref: ${totalUSD.toFixed(2)}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {paymentMethod === 'mobile' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia / Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ingrese los últimos 4 dígitos"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                />
                            </div>
                        )}

                        {(paymentMethod === 'cash_bs' || paymentMethod === 'cash_usd') && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Recibido</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                        placeholder="0.00"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                    <span className="font-medium text-gray-600">Vuelto:</span>
                                    <span className={`text-xl font-bold ${calculateChange() > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                        {paymentMethod === 'cash_usd' ? '$' : ''}{calculateChange().toFixed(2)} {paymentMethod === 'cash_bs' ? 'Bs' : ''}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button
                        onClick={handlePayment}
                        disabled={
                            (paymentMethod === 'mobile' && !reference) ||
                            ((paymentMethod === 'cash_bs' || paymentMethod === 'cash_usd') && (!amountPaid || calculateChange() < 0))
                        }
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar Venta
                    </button>
                    <button
                        onClick={() => printService.printTicket({
                            ...cart.reduce((acc, item) => {
                                acc.items = [...(acc.items || []), item];
                                acc.totalUSD = (acc.totalUSD || 0) + (item.priceUSD * item.quantity);
                                return acc;
                            }, { items: [], totalUSD: 0, totalBs, date: new Date().toISOString(), paymentMethod, customer, reference }),
                            totalBs
                        }, settings)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <Printer size={18} />
                        <span>Imprimir Ticket</span>
                    </button>
                </div>
            </div>

            {showMultiPayment && (
                <MultiPaymentModal
                    totalUSD={totalUSD}
                    totalBs={totalBs}
                    onConfirm={handleMultiPayment}
                    onClose={() => setShowMultiPayment(false)}
                />
            )}

            {showChangeCalculator && (
                <ChangeCalculator
                    total={paymentMethod === 'cash_usd' ? totalUSD : totalBs}
                    onClose={() => setShowChangeCalculator(false)}
                />
            )}
        </div>
    );
};

export default PaymentModal;
