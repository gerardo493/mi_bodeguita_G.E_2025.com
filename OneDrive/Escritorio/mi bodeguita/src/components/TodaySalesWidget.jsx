import React, { useMemo } from 'react';
import { Clock, DollarSign, TrendingUp, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfDay, endOfDay } from 'date-fns';
import { printService } from '../services/printService';

const TodaySalesWidget = ({ onClose }) => {
    const sales = useStore((state) => state.sales);
    const settings = useStore((state) => state.settings);

    const todaySales = useMemo(() => {
        const today = { start: startOfDay(new Date()), end: endOfDay(new Date()) };
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= today.start && saleDate <= today.end;
        });
    }, [sales]);

    const stats = useMemo(() => {
        const totalUSD = todaySales.reduce((sum, s) => sum + s.totalUSD, 0);
        const totalBs = todaySales.reduce((sum, s) => sum + s.totalBs, 0);
        const count = todaySales.length;
        const avgSale = count > 0 ? totalUSD / count : 0;

        const byMethod = todaySales.reduce((acc, sale) => {
            const method = sale.paymentMethod === 'mobile' ? 'Pago Móvil' :
                          sale.paymentMethod === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD';
            acc[method] = (acc[method] || 0) + sale.totalUSD;
            return acc;
        }, {});

        return { totalUSD, totalBs, count, avgSale, byMethod };
    }, [todaySales]);

    const handleReprint = (sale) => {
        printService.printTicket(sale, settings);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Clock size={20} />
                        Ventas del Día
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Ventas</p>
                            <p className="text-2xl font-bold text-blue-700">${stats.totalUSD.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.totalBs.toFixed(2)} Bs</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Cantidad</p>
                            <p className="text-2xl font-bold text-green-700">{stats.count}</p>
                            <p className="text-xs text-gray-500 mt-1">ventas</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Promedio</p>
                            <p className="text-2xl font-bold text-purple-700">${stats.avgSale.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-1">por venta</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Por Método</p>
                            <div className="text-xs space-y-1 mt-1">
                                {Object.entries(stats.byMethod).map(([method, amount]) => (
                                    <div key={method} className="flex justify-between">
                                        <span>{method}:</span>
                                        <span className="font-medium">${amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lista de ventas */}
                    <div className="space-y-2">
                        {todaySales.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No hay ventas hoy</p>
                            </div>
                        ) : (
                            todaySales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-800">
                                                    {sale.ticketNumber || `#${sale.saleNumber || 'N/A'}`}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(sale.date), 'HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {sale.items.length} productos • {sale.paymentMethod === 'mobile' ? 'Pago Móvil' : sale.paymentMethod === 'cash_bs' ? 'Efectivo Bs' : 'Efectivo USD'}
                                            </p>
                                            {sale.customer && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Cliente: {sale.customer.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">${sale.totalUSD.toFixed(2)}</p>
                                                <p className="text-sm text-blue-600">{sale.totalBs.toFixed(2)} Bs</p>
                                            </div>
                                            <button
                                                onClick={() => handleReprint(sale)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Reimprimir ticket"
                                            >
                                                <DollarSign size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodaySalesWidget;

