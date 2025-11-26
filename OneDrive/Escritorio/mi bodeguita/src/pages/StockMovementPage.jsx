import React, { useState, useMemo } from 'react';
import { Package, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

const StockMovementPage = () => {
    const products = useStore((state) => state.products);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');

    const allMovements = useMemo(() => {
        const movements = [];
        products.forEach(product => {
            if (product.stockMovements && product.stockMovements.length > 0) {
                product.stockMovements.forEach(movement => {
                    movements.push({
                        ...movement,
                        productName: product.name,
                        productId: product.id
                    });
                });
            }
        });
        return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [products]);

    const filteredMovements = useMemo(() => {
        return allMovements.filter(movement => {
            const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movement.notes.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = !typeFilter || movement.type === typeFilter;
            const matchesProduct = !productFilter || movement.productId === productFilter;
            return matchesSearch && matchesType && matchesProduct;
        });
    }, [allMovements, searchTerm, typeFilter, productFilter]);

    const getTypeLabel = (type) => {
        const labels = {
            'sale': 'Venta',
            'purchase': 'Compra',
            'return': 'Devolución',
            'adjustment': 'Ajuste',
            'transfer': 'Transferencia',
            'initial': 'Stock Inicial'
        };
        return labels[type] || type;
    };

    const getTypeColor = (type) => {
        const colors = {
            'sale': 'text-red-600 bg-red-50',
            'purchase': 'text-green-600 bg-green-50',
            'return': 'text-blue-600 bg-blue-50',
            'adjustment': 'text-yellow-600 bg-yellow-50',
            'transfer': 'text-purple-600 bg-purple-50',
            'initial': 'text-gray-600 bg-gray-50'
        };
        return colors[type] || 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Historial de Movimientos de Stock</h2>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar producto o notas..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="sale">Venta</option>
                        <option value="purchase">Compra</option>
                        <option value="return">Devolución</option>
                        <option value="adjustment">Ajuste</option>
                        <option value="transfer">Transferencia</option>
                        <option value="initial">Stock Inicial</option>
                    </select>
                    <select
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos los productos</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla de movimientos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4 text-right">Cantidad</th>
                                <th className="px-6 py-4">Notas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMovements.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron movimientos
                                    </td>
                                </tr>
                            ) : (
                                filteredMovements.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600">
                                            {format(new Date(movement.date), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {movement.productName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(movement.type)}`}>
                                                {getTypeLabel(movement.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {movement.quantity > 0 ? (
                                                    <ArrowUp className="text-green-600" size={16} />
                                                ) : (
                                                    <ArrowDown className="text-red-600" size={16} />
                                                )}
                                                <span className={`font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {Math.abs(movement.quantity)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {movement.notes || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockMovementPage;

