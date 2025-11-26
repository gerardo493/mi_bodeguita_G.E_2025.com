import React, { useMemo, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle, Settings, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const DashboardPage = () => {
    const sales = useStore((state) => state.sales);
    const products = useStore((state) => state.products);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const settings = useStore((state) => state.settings);
    const [visibleWidgets, setVisibleWidgets] = useState({
        todayStats: true,
        charts: true,
        topProducts: true,
        lowStock: true
    });

    const now = new Date();
    const today = { start: startOfDay(now), end: endOfDay(now) };
    const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
    const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };

    const stats = useMemo(() => {
        const todaySales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= today.start && saleDate <= today.end;
        });

        const weekSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= thisWeek.start && saleDate <= thisWeek.end;
        });

        const monthSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= thisMonth.start && saleDate <= thisMonth.end;
        });

        const totalTodayUSD = todaySales.reduce((sum, s) => sum + s.totalUSD, 0);
        const totalWeekUSD = weekSales.reduce((sum, s) => sum + s.totalUSD, 0);
        const totalMonthUSD = monthSales.reduce((sum, s) => sum + s.totalUSD, 0);

        const lowStockProducts = products.filter(p => p.stock <= settings.lowStockThreshold);
        const outOfStockProducts = products.filter(p => p.stock === 0);

        // Productos más vendidos
        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.priceUSD * item.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Ventas por día (últimos 7 días)
        const dailySales = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayStart = startOfDay(date);
            const dayEnd = endOfDay(date);
            
            const daySales = sales.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= dayStart && saleDate <= dayEnd;
            });

            dailySales.push({
                date: format(date, 'dd/MM'),
                ventas: daySales.length,
                ingresos: daySales.reduce((sum, s) => sum + s.totalUSD, 0)
            });
        }

        return {
            today: {
                sales: todaySales.length,
                revenueUSD: totalTodayUSD,
                revenueBs: totalTodayUSD * exchangeRate
            },
            week: {
                sales: weekSales.length,
                revenueUSD: totalWeekUSD,
                revenueBs: totalWeekUSD * exchangeRate
            },
            month: {
                sales: monthSales.length,
                revenueUSD: totalMonthUSD,
                revenueBs: totalMonthUSD * exchangeRate
            },
            lowStockProducts,
            outOfStockProducts,
            topProducts,
            dailySales
        };
    }, [sales, products, exchangeRate, settings.lowStockThreshold]);

    const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`bg-${color}-100 p-3 rounded-lg`}>
                    <Icon className={`text-${color}-600`} size={24} />
                </div>
            </div>
        </div>
    );

    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500">{format(now, 'dd/MM/yyyy HH:mm')}</p>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Personalizar dashboard"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Mostrar/Ocultar Widgets</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(visibleWidgets).map(([key, value]) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => setVisibleWidgets({ ...visibleWidgets, [key]: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-700">
                                    {key === 'todayStats' ? 'Estadísticas del Día' :
                                     key === 'charts' ? 'Gráficos' :
                                     key === 'topProducts' ? 'Productos Más Vendidos' :
                                     'Stock Bajo'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Estadísticas principales */}
            {visibleWidgets.todayStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Ventas Hoy"
                    value={stats.today.sales}
                    subtitle={`$${stats.today.revenueUSD.toFixed(2)} USD`}
                    icon={ShoppingCart}
                    color="blue"
                />
                <StatCard
                    title="Ingresos Semana"
                    value={`$${stats.week.revenueUSD.toFixed(2)}`}
                    subtitle={`${stats.week.revenueBs.toFixed(2)} Bs`}
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    title="Ingresos Mes"
                    value={`$${stats.month.revenueUSD.toFixed(2)}`}
                    subtitle={`${stats.month.revenueBs.toFixed(2)} Bs`}
                    icon={DollarSign}
                    color="purple"
                />
                <StatCard
                    title="Stock Bajo"
                    value={stats.lowStockProducts.length}
                    subtitle={`${stats.outOfStockProducts.length} sin stock`}
                    icon={AlertTriangle}
                    color="yellow"
                />
            </div>
            )}

            {/* Gráficos */}
            {visibleWidgets.charts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas Últimos 7 Días</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.dailySales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="ventas" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos Últimos 7 Días</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.dailySales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            )}

            {/* Productos más vendidos */}
            {visibleWidgets.topProducts && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h3>
                <div className="space-y-3">
                    {stats.topProducts.length > 0 ? (
                        stats.topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.quantity} unidades vendidas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">${product.revenue.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">Ingresos</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No hay ventas registradas aún</p>
                    )}
                </div>
            </div>
            )}

            {/* Alertas de stock */}
            {visibleWidgets.lowStock && stats.lowStockProducts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-yellow-600" size={20} />
                        <h3 className="text-lg font-semibold text-yellow-800">Productos con Stock Bajo</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stats.lowStockProducts.slice(0, 6).map((product) => (
                            <div key={product.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-sm text-yellow-600">Stock: {product.stock} unidades</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;

