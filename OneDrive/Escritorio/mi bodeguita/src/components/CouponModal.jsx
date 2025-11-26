import React, { useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

const CouponModal = ({ onClose, onApply }) => {
    const coupons = useStore((state) => state.coupons);
    const validateCoupon = useStore((state) => state.validateCoupon);
    const [couponCode, setCouponCode] = useState('');
    const [error, setError] = useState(null);

    const handleApply = () => {
        const coupon = validateCoupon(couponCode);
        if (coupon) {
            if (onApply) {
                onApply(coupon);
            }
            onClose();
        } else {
            setError('Cupón inválido o expirado');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Tag size={20} />
                        Aplicar Cupón
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código del Cupón</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono uppercase"
                            placeholder="INGRESE CÓDIGO"
                            value={couponCode}
                            onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setError(null);
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-red-600 mt-2">{error}</p>
                        )}
                    </div>

                    {coupons.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Cupones disponibles:</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {coupons.filter(c => !c.used && (!c.expiryDate || new Date(c.expiryDate) > new Date())).map((coupon) => (
                                    <div key={coupon.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">{coupon.code}</p>
                                            <p className="text-xs text-gray-500">
                                                {coupon.discountType === 'percentage' 
                                                    ? `${coupon.discount}% descuento`
                                                    : `$${coupon.discount} descuento`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setCouponCode(coupon.code);
                                                handleApply();
                                            }}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                        >
                                            Usar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponModal;

