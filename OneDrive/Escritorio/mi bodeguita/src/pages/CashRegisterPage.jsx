import React, { useState, useMemo } from 'react';
import { DollarSign, Calculator, Download, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfDay, endOfDay } from 'date-fns';
import { generateSalesReportPDF } from '../services/pdfService';

const CashRegisterPage = () => {
    const sales = useStore((state) => state.sales);
    const cashRegisters = useStore((state) => state.cashRegisters);
    const getCurrentCashRegister = useStore((state) => state.getCurrentCashRegister);
    const addCashRegister = useStore((state) => state.addCashRegister);
    const settings = useStore((state) => state.settings);
    
    const [initialCash, setInitialCash] = useState({ usd: 0, bs: 0 });
    const [isOpening, setIsOpening] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    
    const currentRegister = getCurrentCashRegister();
    
    const todaySales = useMemo(() => {
        const today = { start: startOfDay(new Date()), end: endOfDay(new Date()) };
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= today.start && saleDate <= today.end;
        });
    }, [sales]);
    
    const registerStats = useMemo(() => {
        if (!currentRegister) return null;
        
        const registerSales = todaySales.filter(s => {
            const saleDate = new Date(s.date);
            const registerDate = new Date(currentRegister.openedAt);
            return saleDate >= registerDate;
        });
        
        const totals = registerSales.reduce((acc, sale) => {
            if (sale.paymentMethod === 'cash_usd') {
                acc.cashUSD += sale.totalUSD;
                acc.cashUSDReceived += sale.amountPaid || sale.totalUSD;
            } else if (sale.paymentMethod === 'cash_bs') {
                acc.cashBS += sale.totalBs;
                acc.cashBSReceived += sale.amountPaid || sale.totalBs;
            } else if (sale.paymentMethod === 'mobile') {
                acc.mobile += sale.totalUSD;
            }
            acc.totalUSD += sale.totalUSD;
            acc.totalBS += sale.totalBs;
            return acc;
        }, {
            cashUSD: 0,
            cashBS: 0,
            mobile: 0,
            totalUSD: 0,
            totalBS: 0,
            cashUSDReceived: 0,
            cashBSReceived: 0
        });
        
        return {
            ...totals,
            expectedCashUSD: currentRegister.initialCashUSD + totals.cashUSD,
            expectedCashBS: currentRegister.initialCashBS + totals.cashBS,
            differenceUSD: 0,
            differenceBS: 0,
            salesCount: registerSales.length
        };
    }, [currentRegister, todaySales]);
    
    const handleOpenRegister = () => {
        if (!initialCash.usd && !initialCash.bs) {
            alert('Debe ingresar el efectivo inicial');
            return;
        }
        
        addCashRegister({
            openedAt: new Date().toISOString(),
            initialCashUSD: parseFloat(initialCash.usd) || 0,
            initialCashBS: parseFloat(initialCash.bs) || 0,
            closed: false
        });
        
        setIsOpening(false);
        setInitialCash({ usd: 0, bs: 0 });
    };
    
    const handleCloseRegister = () => {
        if (!currentRegister) return;
        
        const finalCashUSD = parseFloat(prompt('Efectivo USD en caja:') || '0');
        const finalCashBS = parseFloat(prompt('Efectivo Bs en caja:') || '0');
        
        if (registerStats) {
            const differenceUSD = finalCashUSD - registerStats.expectedCashUSD;
            const differenceBS = finalCashBS - registerStats.expectedCashBS;
            
            const closedRegister = {
                ...currentRegister,
                closed: true,
                closedAt: new Date().toISOString(),
                finalCashUSD,
                finalCashBS,
                differenceUSD,
                differenceBS,
                salesCount: registerStats.salesCount,
                totalUSD: registerStats.totalUSD,
                totalBS: registerStats.totalBS
            };
            
            // Actualizar el registro
            const registers = cashRegisters.map(r => 
                r.id === currentRegister.id ? closedRegister : r
            );
            useStore.setState({ cashRegisters: registers });
            
            // Generar PDF del corte
            generateSalesReportPDF(
                todaySales.filter(s => {
                    const saleDate = new Date(s.date);
                    const registerDate = new Date(currentRegister.openedAt);
                    return saleDate >= registerDate;
                }),
                { start: currentRegister.openedAt, end: new Date().toISOString() }
            );
        }
        
        setIsClosing(false);
    };
    
    if (!currentRegister) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
                    <Calculator className="mx-auto mb-4 text-gray-400" size={48} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Abrir Caja</h2>
                    <p className="text-gray-600 mb-6">Ingrese el efectivo inicial para comenzar el turno</p>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Efectivo Inicial USD</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={initialCash.usd}
                                onChange={(e) => setInitialCash({ ...initialCash, usd: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Efectivo Inicial Bs</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={initialCash.bs}
                                onChange={(e) => setInitialCash({ ...initialCash, bs: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={handleOpenRegister}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Abrir Caja
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Corte de Caja</h2>
                    <p className="text-sm text-gray-500">
                        Abierto: {format(new Date(currentRegister.openedAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                </div>
                <button
                    onClick={handleCloseRegister}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <X size={18} />
                    Cerrar Caja
                </button>
            </div>
            
            {registerStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Efectivo USD</h3>
                        <p className="text-2xl font-bold text-gray-900">${registerStats.cashUSD.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Inicial: ${currentRegister.initialCashUSD.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                            Esperado: ${registerStats.expectedCashUSD.toFixed(2)}
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Efectivo Bs</h3>
                        <p className="text-2xl font-bold text-gray-900">{registerStats.cashBS.toFixed(2)} Bs</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Inicial: {currentRegister.initialCashBS.toFixed(2)} Bs
                        </p>
                        <p className="text-xs text-gray-500">
                            Esperado: {registerStats.expectedCashBS.toFixed(2)} Bs
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Pago Móvil</h3>
                        <p className="text-2xl font-bold text-gray-900">${registerStats.mobile.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {registerStats.salesCount} ventas
                        </p>
                    </div>
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen del Turno</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Ventas USD</span>
                        <span className="font-bold">${registerStats?.totalUSD.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Ventas Bs</span>
                        <span className="font-bold">{registerStats?.totalBS.toFixed(2) || '0.00'} Bs</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Número de Ventas</span>
                        <span className="font-bold">{registerStats?.salesCount || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashRegisterPage;

