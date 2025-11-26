import React from 'react';
import { Tag, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const PromotionsWidget = ({ onClose }) => {
    const coupons = useStore((state) => state.coupons);
    const combos = useStore((state) => state.combos);

    const activeCoupons = coupons.filter(c => 
        !c.used && 
        (!c.expiryDate || new Date(c.expiryDate) > new Date()) &&
        (c.usageLimit === null || c.usageCount < c.usageLimit)
    );

    const activeCombos = combos.filter(c => c.active !== false);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Tag size={20} />
                        Promociones Activas
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Cupones activos */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Cupones Disponibles ({activeCoupons.length})</h4>
                        {activeCoupons.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay cupones activos</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {activeCoupons.map((coupon) => (
                                    <div key={coupon.id} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-800">{coupon.code}</p>
                                                <p className="text-sm text-gray-600">{coupon.description || 'Sin descripción'}</p>
                                            </div>
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                {coupon.discountType === 'percentage' 
                                                    ? `${coupon.discount}%`
                                                    : `$${coupon.discount.toFixed(2)}`}
                                            </span>
                                        </div>
                                        {coupon.expiryDate && (
                                            <p className="text-xs text-gray-500">
                                                Válido hasta: {new Date(coupon.expiryDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Combos activos */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Combos Disponibles ({activeCombos.length})</h4>
                        {activeCombos.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay combos activos</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {activeCombos.map((combo) => (
                                    <div key={combo.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-800">{combo.name}</p>
                                                <p className="text-sm text-gray-600">{combo.description || 'Sin descripción'}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {combo.products.length} productos incluidos
                                                </p>
                                            </div>
                                            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                ${combo.priceUSD.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionsWidget;

