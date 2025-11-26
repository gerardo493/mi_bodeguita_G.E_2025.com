import React, { useState, useMemo } from 'react';
import { X, FileText, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { generateSalesReportPDF } from '../services/pdfService';

const QuickReports = ({ onClose }) => {
    const sales = useStore((state) => state.sales);
    const products = useStore((state) => state.products);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const [period, setPeriod] = useState('today');

    const reportData = useMemo(() => {
        let dateRange;
        switch (period) {
            case 'today':
                dateRange = { start: startOfDay(new Date()), end: endOfDay(new Date()) };
                break;
            case 'week':
                dateRange = { start: startOfWeek(new Date()), end: endOfWeek(new Date()) };
                break;
            case 'month':
                dateRange = { start: startOfMonth(new Date()), end: endOfMonth(new Date()) };
                break;
            default:
                dateRange = { start: startOfDay(new Date()), end: endOfDay(new Date()) };
        }

        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= dateRange.start && saleDate <= dateRange.end;
        });

        const totalUSD = filteredSales.reduce((sum, s) => sum + s.totalUSD, 0);
        const totalBs = filteredSales.reduce((sum, s) => sum + s.totalBs, 0);
        const count = filteredSales.length;

        // Productos más vendidos
        const productSales = {};
        filteredSales.forEach(sale => {
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
            .slice(0, 10);

        // Métodos de pago
        const byMethod = filteredSales.reduce((acc, sale) => {
            const method = sale.paymentMethod === 'mobile' ? 'Pago Móvil' :
                          sale.paymentMethod === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD';
            acc[method] = (acc[method] || 0) + sale.totalUSD;
            return acc;
        }, {});

        return { totalUSD, totalBs, count, topProducts, byMethod, filteredSales, dateRange };
    }, [sales, period]);

    const handleExportPDF = () => {
        generateSalesReportPDF(reportData.filteredSales, {
            start: format(reportData.dateRange.start, 'yyyy-MM-dd'),
            end: format(reportData.dateRange.end, 'yyyy-MM-dd')
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={20} />
                        Reportes Rápidos
                    </h3>
                    <div className="flex items-center gap-2">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="today">Hoy</option>
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mes</option>
                        </select>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Resumen */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Ventas</p>
                            <p className="text-2xl font-bold text-blue-700">${reportData.totalUSD.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-1">{reportData.totalBs.toFixed(2)} Bs</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Cantidad</p>
                            <p className="text-2xl font-bold text-green-700">{reportData.count}</p>
                            <p className="text-xs text-gray-500 mt-1">ventas</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Promedio</p>
                            <p className="text-2xl font-bold text-purple-700">
                                ${reportData.count > 0 ? (reportData.totalUSD / reportData.count).toFixed(2) : '0.00'}
                            </p>
                        </div>
                    </div>

                    {/* Productos más vendidos */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <TrendingUp size={18} />
                            Productos Más Vendidos
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {reportData.topProducts.length === 0 ? (
                                <p className="text-sm text-gray-500">No hay ventas en este período</p>
                            ) : (
                                reportData.topProducts.map((product, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-white rounded">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium text-gray-800">{product.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-900">{product.quantity} unidades</span>
                                            <p className="text-xs text-gray-500">${product.revenue.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Métodos de pago */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <DollarSign size={18} />
                            Por Método de Pago
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {Object.entries(reportData.byMethod).map(([method, amount]) => (
                                <div key={method} className="flex justify-between items-center p-2 bg-white rounded">
                                    <span className="text-gray-700">{method}</span>
                                    <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleExportPDF}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Exportar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickReports;

