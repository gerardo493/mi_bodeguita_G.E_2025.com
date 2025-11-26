import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProfitabilityPage = () => {
    const products = useStore((state) => state.products);
    const sales = useStore((state) => state.sales);

    const profitability = useMemo(() => {
        const productStats = products.map(product => {
            // Calcular ventas del producto
            const productSales = sales.reduce((sum, sale) => {
                const item = sale.items.find(i => i.id === product.id);
                if (item) {
                    return sum + item.quantity;
                }
                return sum;
            }, 0);

            const revenue = productSales * product.priceUSD;
            const cost = productSales * (product.purchasePriceUSD || 0);
            const profit = revenue - cost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
            const roi = cost > 0 ? (profit / cost) * 100 : 0;

            return {
                id: product.id,
                name: product.name,
                revenue,
                cost,
                profit,
                margin,
                roi,
                quantitySold: productSales,
                stockValue: product.stock * (product.purchasePriceUSD || 0)
            };
        }).filter(p => p.quantitySold > 0 || p.revenue > 0);

        const totalRevenue = productStats.reduce((sum, p) => sum + p.revenue, 0);
        const totalCost = productStats.reduce((sum, p) => sum + p.cost, 0);
        const totalProfit = totalRevenue - totalCost;
        const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        const topProducts = [...productStats].sort((a, b) => b.profit - a.profit).slice(0, 10);
        const worstProducts = [...productStats].sort((a, b) => a.profit - b.profit).slice(0, 5);

        const categoryStats = products.reduce((acc, product) => {
            const category = product.category || 'Sin categoría';
            if (!acc[category]) {
                acc[category] = { revenue: 0, cost: 0, profit: 0 };
            }
            const sales = productStats.find(p => p.id === product.id);
            if (sales) {
                acc[category].revenue += sales.revenue;
                acc[category].cost += sales.cost;
                acc[category].profit += sales.profit;
            }
            return acc;
        }, {});

        const categoryData = Object.entries(categoryStats).map(([name, stats]) => ({
            name,
            profit: stats.profit,
            revenue: stats.revenue
        }));

        return {
            totalRevenue,
            totalCost,
            totalProfit,
            totalMargin,
            productStats,
            topProducts,
            worstProducts,
            categoryData
        };
    }, [products, sales]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Análisis de Rentabilidad</h2>

            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                            <p className="text-2xl font-bold text-gray-900">${profitability.totalRevenue.toFixed(2)}</p>
                        </div>
                        <DollarSign className="text-green-600" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Costos Totales</p>
                            <p className="text-2xl font-bold text-gray-900">${profitability.totalCost.toFixed(2)}</p>
                        </div>
                        <Package className="text-orange-600" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Ganancia Total</p>
                            <p className="text-2xl font-bold text-green-600">${profitability.totalProfit.toFixed(2)}</p>
                        </div>
                        <TrendingUp className="text-green-600" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Margen Total</p>
                            <p className="text-2xl font-bold text-blue-600">{profitability.totalMargin.toFixed(2)}%</p>
                        </div>
                        <AlertCircle className="text-blue-600" size={32} />
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ganancia por Categoría</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={profitability.categoryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="profit" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Ingresos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={profitability.categoryData}
                                dataKey="revenue"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {profitability.categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top productos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Rentables</h3>
                    <div className="space-y-3">
                        {profitability.topProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {product.quantitySold} vendidos | Margen: {product.margin.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">${product.profit.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">Ganancia</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Menos Rentables</h3>
                    <div className="space-y-3">
                        {profitability.worstProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {product.quantitySold} vendidos | Margen: {product.margin.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${product.profit.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500">Ganancia</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitabilityPage;

