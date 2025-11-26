import React from 'react';
import { X, Package, DollarSign, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import QRCode from './QRCode';

const ProductQuickView = ({ product, onClose, onAddToCart, onEdit }) => {
    const exchangeRate = useStore((state) => state.exchangeRate);
    const sales = useStore((state) => state.sales);
    const isFavorite = useStore((state) => state.isFavorite(product.id));
    const addFavorite = useStore((state) => state.addFavorite);
    const removeFavorite = useStore((state) => state.removeFavorite);

    // Calcular estadísticas del producto
    const productSales = sales.reduce((sum, sale) => {
        const item = sale.items.find(i => i.id === product.id);
        return sum + (item ? item.quantity : 0);
    }, 0);

    const totalRevenue = productSales * product.priceUSD;
    const margin = product.purchasePriceUSD > 0 
        ? ((product.priceUSD - product.purchasePriceUSD) / product.priceUSD * 100).toFixed(1)
        : 'N/A';

    const isExpiringSoon = product.expirationDate && 
        new Date(product.expirationDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const qrData = JSON.stringify({
        id: product.id,
        name: product.name,
        sku: product.sku,
        priceUSD: product.priceUSD,
        priceBS: product.priceBS
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h3 className="text-lg font-bold text-gray-800">Vista Rápida del Producto</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información principal */}
                    <div className="space-y-4">
                        {product.image && (
                            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h2>
                            {product.sku && (
                                <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                            )}
                            {product.barcode && (
                                <p className="text-sm text-gray-500 font-mono mb-2">Código: {product.barcode}</p>
                            )}
                            {product.category && (
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    {product.category}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Precio Venta</p>
                                <p className="text-lg font-bold text-gray-800">${product.priceUSD?.toFixed(2) || '0.00'}</p>
                                <p className="text-sm text-blue-600">{product.priceBS?.toFixed(2) || (product.priceUSD * exchangeRate).toFixed(2)} Bs</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Precio Compra</p>
                                <p className="text-lg font-bold text-gray-800">${product.purchasePriceUSD?.toFixed(2) || '0.00'}</p>
                                <p className="text-sm text-gray-600">Margen: {margin}%</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Stock Disponible</span>
                                <span className={`text-xl font-bold ${
                                    product.stock === 0 ? 'text-red-600' :
                                    product.stock <= 10 ? 'text-yellow-600' :
                                    'text-green-600'
                                }`}>
                                    {product.stock} unidades
                                </span>
                            </div>
                        </div>

                        {product.expirationDate && (
                            <div className={`p-3 rounded-lg ${
                                isExpiringSoon ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className={isExpiringSoon ? 'text-yellow-600' : 'text-gray-600'} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Fecha de Vencimiento</p>
                                        <p className={`text-sm ${isExpiringSoon ? 'text-yellow-700 font-bold' : 'text-gray-600'}`}>
                                            {new Date(product.expirationDate).toLocaleDateString()}
                                            {isExpiringSoon && ' ⚠ Próximo a vencer'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Estadísticas y acciones */}
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">Estadísticas</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Vendidos:</span>
                                    <span className="font-medium">{productSales} unidades</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ingresos:</span>
                                    <span className="font-medium">${totalRevenue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Margen:</span>
                                    <span className="font-medium">{margin}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Código QR</h4>
                            <QRCode value={qrData} size={150} />
                            <p className="text-xs text-gray-500 mt-2">Escanea para ver detalles</p>
                        </div>

                        <div className="space-y-2">
                            {onAddToCart && (
                                <button
                                    onClick={() => onAddToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Agregar al Carrito
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={() => {
                                        onEdit(product);
                                        onClose();
                                    }}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                                >
                                    Editar Producto
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (isFavorite) {
                                        removeFavorite(product.id);
                                    } else {
                                        addFavorite(product.id);
                                    }
                                }}
                                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                    isFavorite
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {isFavorite ? '★ Favorito' : '☆ Agregar a Favoritos'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductQuickView;

