import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateSalesReportPDF } from '../services/pdfService';

const FinancialReportsPage = () => {
    const sales = useStore((state) => state.sales);
    const products = useStore((state) => state.products);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const [period, setPeriod] = useState('week'); // day, week, month, custom
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const dateRange = useMemo(() => {
        const now = new Date();
        switch (period) {
            case 'day':
                return { start: startOfDay(now), end: endOfDay(now) };
            case 'week':
                return { start: startOfWeek(now), end: endOfWeek(now) };
            case 'month':
                return { start: startOfMonth(now), end: endOfMonth(now) };
            case 'custom':
                return { start: startOfDay(new Date(startDate)), end: endOfDay(new Date(endDate)) };
            default:
                return { start: startOfWeek(now), end: endOfWeek(now) };
        }
    }, [period, startDate, endDate]);

    const reportData = useMemo(() => {
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= dateRange.start && saleDate <= dateRange.end;
        });

        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalUSD, 0);
        const totalCost = filteredSales.reduce((sum, sale) => {
            return sum + sale.items.reduce((itemSum, item) => {
                const product = products.find(p => p.id === item.id);
                return itemSum + (product?.purchasePriceUSD || 0) * item.quantity;
            }, 0);
        }, 0);
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        // Ventas por día
        const dailyData = [];
        const currentDate = new Date(dateRange.start);
        while (currentDate <= dateRange.end) {
            const dayStart = startOfDay(currentDate);
            const dayEnd = endOfDay(currentDate);
            const daySales = filteredSales.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= dayStart && saleDate <= dayEnd;
            });

            const dayRevenue = daySales.reduce((sum, s) => sum + s.totalUSD, 0);
            const dayCost = daySales.reduce((sum, sale) => {
                return sum + sale.items.reduce((itemSum, item) => {
                    const product = products.find(p => p.id === item.id);
                    return itemSum + (product?.purchasePriceUSD || 0) * item.quantity;
                }, 0);
            }, 0);

            dailyData.push({
                date: format(currentDate, 'dd/MM'),
                revenue: dayRevenue,
                cost: dayCost,
                profit: dayRevenue - dayCost
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Ventas por método de pago
        const paymentMethodData = filteredSales.reduce((acc, sale) => {
            const method = sale.paymentMethod === 'mobile' ? 'Pago Móvil' : 
                          sale.paymentMethod === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD';
            acc[method] = (acc[method] || 0) + sale.totalUSD;
            return acc;
        }, {});

        // Comparación con período anterior
        const previousPeriod = {
            start: new Date(dateRange.start.getTime() - (dateRange.end.getTime() - dateRange.start.getTime())),
            end: dateRange.start
        };

        const previousSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= previousPeriod.start && saleDate < previousPeriod.end;
        });

        const previousRevenue = previousSales.reduce((sum, s) => sum + s.totalUSD, 0);
        const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCost,
            totalProfit,
            profitMargin,
            dailyData,
            paymentMethodData: Object.entries(paymentMethodData).map(([name, value]) => ({ name, value })),
            revenueChange,
            salesCount: filteredSales.length
        };
    }, [sales, products, dateRange]);

    const handleExportPDF = () => {
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= dateRange.start && saleDate <= dateRange.end;
        });
        generateSalesReportPDF(filteredSales, {
            start: format(dateRange.start, 'yyyy-MM-dd'),
            end: format(dateRange.end, 'yyyy-MM-dd')
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Reportes Financieros</h2>
                <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Download size={18} />
                    <span>Exportar PDF</span>
                </button>
            </div>

            {/* Selector de período */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Período:</span>
                    </div>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="day">Hoy</option>
                        <option value="week">Esta Semana</option>
                        <option value="month">Este Mes</option>
                        <option value="custom">Personalizado</option>
                    </select>
                    {period === 'custom' && (
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="self-center text-gray-500">a</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Ingresos</p>
                        <DollarSign className="text-green-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${reportData.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {reportData.revenueChange > 0 ? (
                            <span className="text-green-600 flex items-center gap-1">
                                <TrendingUp size={14} />
                                +{reportData.revenueChange.toFixed(1)}%
                            </span>
                        ) : reportData.revenueChange < 0 ? (
                            <span className="text-red-600 flex items-center gap-1">
                                <TrendingDown size={14} />
                                {reportData.revenueChange.toFixed(1)}%
                            </span>
                        ) : (
                            <span className="text-gray-500">Sin cambios</span>
                        )}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Costos</p>
                        <TrendingDown className="text-orange-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${reportData.totalCost.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {reportData.totalRevenue > 0 
                            ? `${((reportData.totalCost / reportData.totalRevenue) * 100).toFixed(1)}% de ingresos`
                            : 'Sin datos'}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Ganancia</p>
                        <TrendingUp className="text-blue-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-green-600">${reportData.totalProfit.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {reportData.totalRevenue > 0 
                            ? `Margen: ${reportData.profitMargin.toFixed(1)}%`
                            : 'Sin datos'}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Ventas</p>
                        <Calendar className="text-purple-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{reportData.salesCount}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {reportData.salesCount > 0 
                            ? `Promedio: $${(reportData.totalRevenue / reportData.salesCount).toFixed(2)}`
                            : 'Sin ventas'}
                    </p>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Flujo de Caja</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reportData.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                            <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} name="Costos" />
                            <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Ganancia" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos por Método de Pago</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.paymentMethodData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Estado de resultados simplificado */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Resultados</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Ingresos Totales</span>
                        <span className="text-lg font-bold text-gray-900">${reportData.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Costos Totales</span>
                        <span className="text-lg font-bold text-orange-600">-${reportData.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <span className="font-bold text-gray-800">Ganancia Neta</span>
                        <span className="text-2xl font-bold text-green-600">${reportData.totalProfit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Margen de Ganancia</span>
                        <span className="text-lg font-bold text-blue-600">{reportData.profitMargin.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialReportsPage;

