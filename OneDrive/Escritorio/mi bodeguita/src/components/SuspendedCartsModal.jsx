import React, { useState } from 'react';
import { X, Clock, Trash2, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

const SuspendedCartsModal = ({ onClose }) => {
    const suspendedCarts = useStore((state) => state.suspendedCarts);
    const restoreCart = useStore((state) => state.restoreCart);
    const deleteSuspendedCart = useStore((state) => state.deleteSuspendedCart);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCarts = suspendedCarts.filter(cart =>
        cart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cart.customer && cart.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRestore = (cartId) => {
        if (window.confirm('¿Restaurar esta venta suspendida? Se reemplazará el carrito actual.')) {
            restoreCart(cartId);
            onClose();
        }
    };

    const getTotal = (cart) => {
        const subtotal = cart.cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
        let discount = 0;
        if (cart.discount > 0) {
            discount = cart.discountType === 'percentage' 
                ? subtotal * (cart.discount / 100)
                : cart.discount;
        }
        return subtotal - discount;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Clock size={20} />
                        Ventas Suspendidas ({suspendedCarts.length})
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <input
                        type="text"
                        placeholder="Buscar ventas suspendidas..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {filteredCarts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No hay ventas suspendidas</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCarts.map((suspendedCart) => (
                                <div
                                    key={suspendedCart.id}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{suspendedCart.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(suspendedCart.date), 'dd/MM/yyyy HH:mm')}
                                            </p>
                                            {suspendedCart.customer && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Cliente: {suspendedCart.customer.name}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 mt-1">
                                                {suspendedCart.cart.length} productos • Total: ${getTotal(suspendedCart).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRestore(suspendedCart.id)}
                                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                title="Restaurar venta"
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('¿Eliminar esta venta suspendida?')) {
                                                        deleteSuspendedCart(suspendedCart.id);
                                                    }
                                                }}
                                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuspendedCartsModal;

