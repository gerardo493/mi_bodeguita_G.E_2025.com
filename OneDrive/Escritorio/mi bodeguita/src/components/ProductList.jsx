import React, { useState } from 'react';
import { Edit, Trash2, Truck, QrCode } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductLabelQR from './ProductLabelQR';

const ProductList = ({ onEdit }) => {
    const products = useStore((state) => state.products);
    const deleteProduct = useStore((state) => state.deleteProduct);
    const suppliers = useStore((state) => state.suppliers);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const [labelProduct, setLabelProduct] = useState(null);

    const getSupplierName = (supplierId) => {
        if (!supplierId) return null;
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : null;
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500">No hay productos en el inventario.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3">Producto</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3">Proveedor</th>
                            <th className="px-4 py-3 text-right">Precio USD</th>
                            <th className="px-4 py-3 text-right">Precio Bs</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                                <td className="px-4 py-3 text-gray-500 text-sm">{product.sku || '-'}</td>
                                <td className="px-4 py-3 text-gray-500">{product.category || '-'}</td>
                                <td className="px-4 py-3">
                                    {getSupplierName(product.supplierId) ? (
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Truck size={14} />
                                            <span className="text-sm">{getSupplierName(product.supplierId)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-800">${product.priceUSD?.toFixed(2) || '0.00'}</td>
                                <td className="px-4 py-3 text-right text-blue-600 font-medium">
                                    {product.priceBS ? `${product.priceBS.toFixed(2)} Bs` : (product.priceUSD ? `${(product.priceUSD * exchangeRate).toFixed(2)} Bs` : '0.00 Bs')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                            product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setLabelProduct(product)}
                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                            title="Generar etiqueta con QR"
                                        >
                                            <QrCode size={16} />
                                        </button>
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Editar producto"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Eliminar producto"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {labelProduct && (
                <ProductLabelQR
                    product={labelProduct}
                    onClose={() => setLabelProduct(null)}
                />
            )}
        </div>
    );
};

export default ProductList;
