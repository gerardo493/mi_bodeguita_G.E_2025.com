import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { startOfDay, endOfDay } from 'date-fns';

const RealTimeStats = () => {
    const sales = useStore((state) => state.sales);
    const exchangeRate = useStore((state) => state.exchangeRate);

    const todayStats = useMemo(() => {
        const today = { start: startOfDay(new Date()), end: endOfDay(new Date()) };
        const todaySales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= today.start && saleDate <= today.end;
        });

        const totalUSD = todaySales.reduce((sum, s) => sum + s.totalUSD, 0);
        const totalBs = todaySales.reduce((sum, s) => sum + s.totalBs, 0);
        const count = todaySales.length;
        const avgSale = count > 0 ? totalUSD / count : 0;

        return { totalUSD, totalBs, count, avgSale };
    }, [sales]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <DollarSign size={18} className="text-green-600" />
                        <p className="text-xs text-gray-600">Hoy USD</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">${todayStats.totalUSD.toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <ShoppingCart size={18} className="text-blue-600" />
                        <p className="text-xs text-gray-600">Ventas</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{todayStats.count}</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <TrendingUp size={18} className="text-purple-600" />
                        <p className="text-xs text-gray-600">Promedio</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">${todayStats.avgSale.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default RealTimeStats;

