import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, ShoppingCart, History, BarChart3, Settings, DollarSign, TrendingUp, Package, Truck, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import ExchangeRateDisplay from './ExchangeRateDisplay';
import CashRegisterModal from './CashRegisterModal';
import BackupRestoreModal from './BackupRestoreModal';
import NotificationBell from './NotificationBell';

const Layout = ({ children }) => {
    const location = useLocation();
    const currentCashRegister = useStore((state) => state.currentCashRegister);
    const [showCashRegister, setShowCashRegister] = useState(false);
    const [showBackup, setShowBackup] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar / Mobile Header */}
            <aside className="bg-white shadow-md md:w-64 flex-shrink-0 flex md:flex-col justify-between md:h-screen sticky top-0 z-10">
                <div className="p-4 flex items-center justify-between md:block">
                    <h1 className="text-2xl font-bold text-blue-600">Mi Bodeguita</h1>
                    {/* Mobile Menu Button could go here */}
                </div>

                <nav className="flex md:flex-col flex-1 overflow-x-auto md:overflow-visible px-2 md:px-4 gap-2">
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard')
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <BarChart3 size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <ShoppingCart size={20} />
                        <span>Venta (POS)</span>
                    </Link>

                    <Link
                        to="/inventory"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/inventory')
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Store size={20} />
                        <span>Inventario</span>
                    </Link>

                    <Link
                        to="/history"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/history')
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <History size={20} />
                        <span>Historial</span>
                    </Link>

                    <Link
                        to="/profitability"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/profitability')
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <TrendingUp size={20} />
                        <span>Rentabilidad</span>
                    </Link>

                    <Link
                        to="/stock-movements"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/stock-movements')
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Package size={20} />
                        <span>Movimientos</span>
                    </Link>

                    <Link
                        to="/suppliers"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/suppliers')
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Truck size={20} />
                        <span>Proveedores</span>
                    </Link>

                    <Link
                        to="/financial-reports"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/financial-reports')
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FileText size={20} />
                        <span>Reportes</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button
                        onClick={() => setShowCashRegister(true)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentCashRegister
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <DollarSign size={16} />
                        <span>{currentCashRegister ? 'Caja Abierta' : 'Abrir Caja'}</span>
                    </button>
                    <button
                        onClick={() => setShowBackup(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        <Settings size={16} />
                        <span>Backup</span>
                    </button>
                    <div className="text-xs text-gray-400 text-center">
                        v2.0.0
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <ExchangeRateDisplay />
                        <NotificationBell />
                    </div>
                    {children}
                </div>
            </main>

            {showCashRegister && (
                <CashRegisterModal onClose={() => setShowCashRegister(false)} />
            )}

            {showBackup && (
                <BackupRestoreModal onClose={() => setShowBackup(false)} />
            )}
        </div>
    );
};

export default Layout;
