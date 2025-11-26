import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Calendar, DollarSign, Smartphone, Banknote, Search, Filter, Download, Eye, Trash2, X, ArrowLeft } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { generateSalesReportPDF, generateSaleTicketPDF } from '../services/pdfService';
import SaleDetailModal from '../components/SaleDetailModal';
import ReturnModal from '../components/ReturnModal';

const SalesHistoryPage = () => {
  const sales = useStore((state) => state.sales);
  const deleteSale = useStore((state) => state.deleteSale);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const returns = useStore((state) => state.returns);

  const filteredSales = useMemo(() => {
    let filtered = sales;

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(sale => {
        const searchLower = searchTerm.toLowerCase();
        return (
          sale.id.toLowerCase().includes(searchLower) ||
          sale.items.some(item => item.name.toLowerCase().includes(searchLower)) ||
          (sale.customer && sale.customer.name.toLowerCase().includes(searchLower)) ||
          (sale.reference && sale.reference.toLowerCase().includes(searchLower))
        );
      });
    }

    // Filtro de método de pago
    if (paymentMethodFilter) {
      filtered = filtered.filter(sale => sale.paymentMethod === paymentMethodFilter);
    }

    // Filtro de fecha
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const start = startOfDay(filterDate);
      const end = endOfDay(filterDate);
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate <= end;
      });
    }

    return filtered;
  }, [sales, searchTerm, paymentMethodFilter, dateFilter]);

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'mobile': return <Smartphone size={16} className="text-blue-600" />;
      case 'cash_bs': return <Banknote size={16} className="text-green-600" />;
      case 'cash_usd': return <DollarSign size={16} className="text-green-800" />;
      default: return null;
    }
  };

  const getPaymentLabel = (method) => {
    switch (method) {
      case 'mobile': return 'Pago Móvil';
      case 'cash_bs': return 'Efectivo Bs';
      case 'cash_usd': return 'Efectivo USD';
      default: return method;
    }
  };

  const handleExportPDF = () => {
    generateSalesReportPDF(filteredSales, dateFilter ? { start: dateFilter, end: dateFilter } : null);
  };

  const handleDeleteSale = (saleId) => {
    if (window.confirm('¿Está seguro de eliminar esta venta? Esta acción restaurará el stock de los productos.')) {
      deleteSale(saleId);
    }
  };

  const totalFiltered = filteredSales.reduce((sum, sale) => sum + sale.totalUSD, 0);
  const totalFilteredBs = filteredSales.reduce((sum, sale) => sum + sale.totalBs, 0);

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
        <div className="bg-gray-50 inline-flex p-4 rounded-full mb-4 text-gray-400">
          <Calendar size={32} />
        </div>
        <p className="text-gray-500">No hay ventas registradas aún.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Ventas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReturns(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Devoluciones ({returns.length})</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por ID, producto, cliente o referencia..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="mobile">Pago Móvil</option>
                <option value="cash_bs">Efectivo Bs</option>
                <option value="cash_usd">Efectivo USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setPaymentMethodFilter('');
                  setDateFilter('');
                  setSearchTerm('');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <X size={18} />
                <span>Limpiar Filtros</span>
              </button>
            </div>
          </div>
        )}

        {(searchTerm || paymentMethodFilter || dateFilter) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {filteredSales.length} de {sales.length} ventas
              {totalFiltered > 0 && (
                <span className="ml-2 font-medium">
                  - Total: ${totalFiltered.toFixed(2)} USD / {totalFilteredBs.toFixed(2)} Bs
                </span>
              )}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Productos</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4 text-right">Total USD</th>
                <th className="px-6 py-4 text-right">Total Bs</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron ventas con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">
                      {format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      {sale.customer ? (
                        <span className="font-medium text-gray-800">{sale.customer.name}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {sale.items.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="text-xs text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                        {sale.items.length > 2 && (
                          <span className="text-xs text-blue-600">+{sale.items.length - 2} más</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(sale.paymentMethod)}
                        <span className="font-medium text-gray-700">
                          {getPaymentLabel(sale.paymentMethod)}
                        </span>
                      </div>
                      {sale.reference && (
                        <div className="text-xs text-gray-400 mt-1">Ref: {sale.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${sale.totalUSD.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-blue-600">
                      {sale.totalBs.toFixed(2)} Bs
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => generateSaleTicketPDF(sale)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Imprimir ticket"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar venta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}

      {showReturns && (
        <ReturnModal
          onClose={() => setShowReturns(false)}
        />
      )}
    </div>
  );
};

export default SalesHistoryPage;
