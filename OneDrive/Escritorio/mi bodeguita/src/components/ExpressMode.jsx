import React, { useMemo } from 'react';
import { Zap, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const ExpressMode = ({ onClose, onAddToCart }) => {
    const products = useStore((state) => state.products);
    const getTopSellingProducts = useStore((state) => state.getTopSellingProducts);
    const favoriteProducts = useStore((state) => state.favoriteProducts);

    const topProducts = useMemo(() => getTopSellingProducts(12), [getTopSellingProducts]);
    const favoriteProductsList = useMemo(() => 
        products.filter(p => favoriteProducts.includes(p.id)).slice(0, 12),
        [products, favoriteProducts]
    );

    const expressProducts = favoriteProductsList.length > 0 ? favoriteProductsList : topProducts;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-500" />
                        Modo Express - Venta Rápida
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {expressProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => {
                                    if (onAddToCart) {
                                        onAddToCart(product);
                                    }
                                }}
                                disabled={product.stock <= 0}
                                className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {product.image && (
                                    <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                                    {product.name}
                                </h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">
                                        ${product.priceUSD?.toFixed(2) || '0.00'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {product.stock}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {expressProducts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Zap size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No hay productos favoritos o frecuentes</p>
                            <p className="text-sm mt-2">Agrega productos a favoritos para acceso rápido</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpressMode;

