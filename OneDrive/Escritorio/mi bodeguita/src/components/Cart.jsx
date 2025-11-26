import React, { useState } from 'react';
import { Trash2, Minus, Plus, CreditCard, Tag, User, Package, ArrowLeft, Clock, Calculator, Eye, Edit, FileText, Zap, Layers, Box, Scale, Gift } from 'lucide-react';
import { useStore } from '../store/useStore';
import PaymentModal from './PaymentModal';
import DiscountModal from './DiscountModal';
import CustomerSelector from './CustomerSelector';
import CouponModal from './CouponModal';
import ComboModal from './ComboModal';
import ReturnModal from './ReturnModal';
import SuspendedCartsModal from './SuspendedCartsModal';
import QuickCalculator from './QuickCalculator';
import TicketPreview from './TicketPreview';
import ChangeCalculator from './ChangeCalculator';
import MonetaryCalculator from './MonetaryCalculator';
import TodaySalesWidget from './TodaySalesWidget';
import PriceEditor from './PriceEditor';
import BatchAddModal from './BatchAddModal';
import InventoryQuickView from './InventoryQuickView';
import PromotionsWidget from './PromotionsWidget';
import QuickReports from './QuickReports';
import PriceLabelGenerator from './PriceLabelGenerator';
import ScaleIntegration from './ScaleIntegration';

const Cart = () => {
    const cart = useStore((state) => state.cart);
    const removeFromCart = useStore((state) => state.removeFromCart);
    const updateCartQuantity = useStore((state) => state.updateCartQuantity);
    const clearCart = useStore((state) => state.clearCart);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const discount = useStore((state) => state.discount);
    const discountType = useStore((state) => state.discountType);
    const selectedCustomer = useStore((state) => state.selectedCustomer);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [isComboModalOpen, setIsComboModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isSuspendedCartsOpen, setIsSuspendedCartsOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isTicketPreviewOpen, setIsTicketPreviewOpen] = useState(false);
    const [isChangeCalculatorOpen, setIsChangeCalculatorOpen] = useState(false);
    const [isTodaySalesOpen, setIsTodaySalesOpen] = useState(false);
    const [isBatchAddOpen, setIsBatchAddOpen] = useState(false);
    const [editingPriceItem, setEditingPriceItem] = useState(null);
    const [showInventoryQuickView, setShowInventoryQuickView] = useState(false);
    const [showPromotions, setShowPromotions] = useState(false);
    const [showQuickReports, setShowQuickReports] = useState(false);
    const [showPriceLabels, setShowPriceLabels] = useState(false);
    const [showScale, setShowScale] = useState(false);
    const [showMonetaryCalculator, setShowMonetaryCalculator] = useState(false);
    const validateCoupon = useStore((state) => state.validateCoupon);
    const setDiscount = useStore((state) => state.setDiscount);
    const suspendCart = useStore((state) => state.suspendCart);
    const updateCartItemPrice = useStore((state) => state.updateCartItemPrice);
    const updateCartItemNotes = useStore((state) => state.updateCartItemNotes);
    const addToCart = useStore((state) => state.addToCart);

    const subtotalUSD = cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
    
    // Calcular descuento
    let discountAmount = 0;
    if (discount > 0) {
        if (discountType === 'percentage') {
            discountAmount = subtotalUSD * (discount / 100);
        } else {
            discountAmount = discount;
        }
    }
    
    const totalUSD = subtotalUSD - discountAmount;
    const totalBs = totalUSD * exchangeRate;

    if (cart.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 bg-white rounded-xl border border-gray-100">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <CreditCard size={32} />
                </div>
                <p className="text-center">El carrito está vacío</p>
                <p className="text-sm text-center mt-2">Selecciona productos para comenzar una venta</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-800">Orden Actual</h2>
                <button
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                    Limpiar
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                                <div className="text-xs text-gray-500">
                                    ${item.priceUSD.toFixed(2)} x {item.quantity} = ${(item.priceUSD * item.quantity).toFixed(2)}
                                </div>
                                {item.notes && (
                                    <p className="text-xs text-gray-400 italic mt-1">Nota: {item.notes}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditingPriceItem(item)}
                                    className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                    title="Editar precio"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                                <button
                                    onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    const notes = prompt('Agregar nota/comentario:', item.notes || '');
                                    if (notes !== null) {
                                        updateCartItemNotes(item.id, notes);
                                    }
                                }}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                title="Agregar nota"
                            >
                                Nota
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
                {/* Cliente seleccionado */}
                {selectedCustomer && (
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-blue-600" />
                            <span className="text-gray-700">{selectedCustomer.name}</span>
                        </div>
                        <button
                            onClick={() => useStore.getState().setSelectedCustomer(null)}
                            className="text-red-500 hover:text-red-700 text-xs"
                        >
                            Quitar
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setIsCustomerModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                        <User size={16} />
                        {selectedCustomer ? 'Cambiar' : 'Cliente'}
                    </button>
                    <button
                        onClick={() => setIsDiscountModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                        <Tag size={16} />
                        {discount > 0 ? `${discount}${discountType === 'percentage' ? '%' : '$'}` : 'Descuento'}
                    </button>
                    <button
                        onClick={() => setIsCouponModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                        <Tag size={16} />
                        Cupón
                    </button>
                    <button
                        onClick={() => setIsComboModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                        <Package size={16} />
                        Combos
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setIsReturnModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Devoluciones
                    </button>
                    <button
                        onClick={() => setIsTodaySalesOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                        <FileText size={16} />
                        Ventas Hoy
                    </button>
                    <button
                        onClick={() => setIsSuspendedCartsOpen(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                    >
                        <Clock size={16} />
                        Suspendidas
                    </button>
                    <button
                        onClick={() => {
                            const name = prompt('Nombre de la venta suspendida (opcional):', '');
                            suspendCart(name);
                            alert('Venta suspendida exitosamente');
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                        <Clock size={16} />
                        Suspender
                    </button>
                    <button
                        onClick={() => setShowInventoryQuickView(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                    >
                        <Box size={16} />
                        Inventario
                    </button>
                    <button
                        onClick={() => setShowPromotions(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm"
                    >
                        <Gift size={16} />
                        Promociones
                    </button>
                    <button
                        onClick={() => setShowQuickReports(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm"
                    >
                        <FileText size={16} />
                        Reportes
                    </button>
                    <button
                        onClick={() => setShowPriceLabels(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors text-sm"
                    >
                        <Tag size={16} />
                        Etiquetas
                    </button>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal USD</span>
                    <span className="font-medium">${subtotalUSD.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Descuento ({discountType === 'percentage' ? `${discount}%` : `$${discount.toFixed(2)}`})</span>
                        <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tasa de Cambio</span>
                    <span className="font-medium">{exchangeRate.toFixed(2)} Bs/$</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-gray-800 font-bold">Total USD</span>
                        <span className="text-xl font-bold text-gray-900">${totalUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-gray-600 font-medium">Total Bs</span>
                        <span className="text-lg font-bold text-blue-600">{totalBs.toFixed(2)} Bs</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsTicketPreviewOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                        <Eye size={16} />
                        Vista Previa
                    </button>
                    <button
                        onClick={() => setIsChangeCalculatorOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                        <Calculator size={16} />
                        Cambio
                    </button>
                </div>

                <button
                    onClick={() => setShowMonetaryCalculator(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                    <Calculator size={20} />
                    <span>Calculadora Monetaria (USD ↔ Bs)</span>
                </button>

                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                    Cobrar
                </button>
            </div>

            {isPaymentModalOpen && (
                <PaymentModal
                    totalUSD={totalUSD}
                    totalBs={totalBs}
                    discount={discountAmount}
                    customer={selectedCustomer}
                    onClose={() => setIsPaymentModalOpen(false)}
                />
            )}

            {isDiscountModalOpen && (
                <DiscountModal
                    onClose={() => setIsDiscountModalOpen(false)}
                />
            )}

            {isCustomerModalOpen && (
                <CustomerSelector
                    onClose={() => setIsCustomerModalOpen(false)}
                />
            )}

            {isCouponModalOpen && (
                <CouponModal
                    onClose={() => setIsCouponModalOpen(false)}
                    onApply={(coupon) => {
                        if (coupon.discountType === 'percentage') {
                            setDiscount(coupon.discount, 'percentage');
                        } else {
                            setDiscount(coupon.discount, 'fixed');
                        }
                    }}
                />
            )}

            {isComboModalOpen && (
                <ComboModal
                    onClose={() => setIsComboModalOpen(false)}
                />
            )}

            {isReturnModalOpen && (
                <ReturnModal
                    onClose={() => setIsReturnModalOpen(false)}
                />
            )}

            {isSuspendedCartsOpen && (
                <SuspendedCartsModal
                    onClose={() => setIsSuspendedCartsOpen(false)}
                />
            )}

            {isCalculatorOpen && (
                <QuickCalculator
                    onClose={() => setIsCalculatorOpen(false)}
                />
            )}

            {isTicketPreviewOpen && (
                <TicketPreview
                    cart={cart}
                    totalUSD={totalUSD}
                    totalBs={totalBs}
                    discount={discountAmount}
                    customer={selectedCustomer}
                    onClose={() => setIsTicketPreviewOpen(false)}
                    onConfirm={() => {
                        setIsTicketPreviewOpen(false);
                        setIsPaymentModalOpen(true);
                    }}
                />
            )}

            {isChangeCalculatorOpen && (
                <ChangeCalculator
                    total={totalUSD}
                    onClose={() => setIsChangeCalculatorOpen(false)}
                />
            )}

            {isTodaySalesOpen && (
                <TodaySalesWidget
                    onClose={() => setIsTodaySalesOpen(false)}
                />
            )}

            {isBatchAddOpen && (
                <BatchAddModal
                    onClose={() => setIsBatchAddOpen(false)}
                    onAdd={(product) => addToCart(product)}
                />
            )}

            {editingPriceItem && (
                <PriceEditor
                    item={editingPriceItem}
                    onClose={() => setEditingPriceItem(null)}
                    onSave={(newPrice) => {
                        updateCartItemPrice(editingPriceItem.id, newPrice);
                        setEditingPriceItem(null);
                    }}
                />
            )}

            {showInventoryQuickView && (
                <InventoryQuickView
                    onClose={() => setShowInventoryQuickView(false)}
                />
            )}

            {showPromotions && (
                <PromotionsWidget
                    onClose={() => setShowPromotions(false)}
                />
            )}

            {showQuickReports && (
                <QuickReports
                    onClose={() => setShowQuickReports(false)}
                />
            )}

            {showPriceLabels && (
                <PriceLabelGenerator
                    onClose={() => setShowPriceLabels(false)}
                />
            )}

            {showScale && (
                <ScaleIntegration
                    onClose={() => setShowScale(false)}
                    onWeightReceived={(weight) => {
                        // Usar el peso recibido (se puede integrar con productos a granel)
                        alert(`Peso recibido: ${weight} kg`);
                    }}
                />
            )}

            {showMonetaryCalculator && (
                <MonetaryCalculator
                    onClose={() => setShowMonetaryCalculator(false)}
                    onResult={(result) => {
                        // El resultado puede ser usado para cálculos rápidos
                        console.log('Resultado calculadora:', result);
                    }}
                />
            )}
        </div>
    );
};

export default Cart;
