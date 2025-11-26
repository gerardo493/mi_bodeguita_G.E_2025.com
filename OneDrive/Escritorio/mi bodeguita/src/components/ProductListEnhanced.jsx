import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Truck, QrCode, Search, Filter, Grid3x3, List, Eye, Copy, Plus, Minus, Image as ImageIcon, ChevronLeft, ChevronRight, CheckSquare, Square, Download, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductLabelQR from './ProductLabelQR';
import ProductQuickView from './ProductQuickView';
import QuickStockAdjust from './QuickStockAdjust';
import ProductHistoryModal from './ProductHistoryModal';

const ProductListEnhanced = ({ onEdit }) => {
    const products = useStore((state) => state.products);
    const deleteProduct = useStore((state) => state.deleteProduct);
    const suppliers = useStore((state) => state.suppliers);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const settings = useStore((state) => state.settings);
    const duplicateProduct = useStore((state) => state.duplicateProduct);
    const updateProduct = useStore((state) => state.updateProduct);

    // Estados
    const [labelProduct, setLabelProduct] = useState(null);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [adjustingProduct, setAdjustingProduct] = useState(null);
    const [historyProduct, setHistoryProduct] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // table, grid, list
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('all'); // all, low, out, expired, expiring
    const [sortBy, setSortBy] = useState('name'); // name, price, stock, category, supplier
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [showFilters, setShowFilters] = useState(false);

    const getSupplierName = (supplierId) => {
        if (!supplierId) return null;
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : null;
    };

    // Obtener categorías únicas
    const categories = useMemo(() => {
        return [...new Set(products.map(p => p.category).filter(Boolean))];
    }, [products]);

    // Filtrar y ordenar productos
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter(product => {
            // Búsqueda
            const matchesSearch = 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.barcode?.includes(searchTerm) ||
                product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getSupplierName(product.supplierId)?.toLowerCase().includes(searchTerm.toLowerCase());

            // Filtro de categoría
            const matchesCategory = !selectedCategory || product.category === selectedCategory;

            // Filtro de stock
            let matchesStock = true;
            if (stockFilter === 'low') {
                matchesStock = product.stock > 0 && product.stock <= settings.lowStockThreshold;
            } else if (stockFilter === 'out') {
                matchesStock = product.stock === 0;
            } else if (stockFilter === 'expired') {
                matchesStock = product.expirationDate && new Date(product.expirationDate) < new Date();
            } else if (stockFilter === 'expiring') {
                const daysUntilExpiration = product.expirationDate 
                    ? Math.ceil((new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;
                matchesStock = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;
            }

            return matchesSearch && matchesCategory && matchesStock;
        });

        // Ordenar
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'price':
                    aValue = a.priceUSD || 0;
                    bValue = b.priceUSD || 0;
                    break;
                case 'stock':
                    aValue = a.stock || 0;
                    bValue = b.stock || 0;
                    break;
                case 'category':
                    aValue = a.category || '';
                    bValue = b.category || '';
                    break;
                case 'supplier':
                    aValue = getSupplierName(a.supplierId) || '';
                    bValue = getSupplierName(b.supplierId) || '';
                    break;
                case 'name':
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return filtered;
    }, [products, searchTerm, selectedCategory, stockFilter, sortBy, sortOrder, settings.lowStockThreshold, suppliers]);

    // Paginación
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
    const paginatedProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Estadísticas
    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalValueUSD = products.reduce((sum, p) => sum + (p.priceUSD * p.stock), 0);
        const totalValueBS = products.reduce((sum, p) => sum + (p.priceBS * p.stock), 0);
        const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= settings.lowStockThreshold).length;
        const outOfStockCount = products.filter(p => p.stock === 0).length;
        const expiredCount = products.filter(p => p.expirationDate && new Date(p.expirationDate) < new Date()).length;
        const expiringCount = products.filter(p => {
            if (!p.expirationDate) return false;
            const days = Math.ceil((new Date(p.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
            return days <= 7 && days > 0;
        }).length;

        return {
            totalProducts,
            totalValueUSD,
            totalValueBS,
            lowStockCount,
            outOfStockCount,
            expiredCount,
            expiringCount
        };
    }, [products, settings.lowStockThreshold]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const toggleProduct = (productId) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const toggleAll = () => {
        if (selectedProducts.size === paginatedProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
        }
    };

    const handleDuplicate = (product) => {
        const duplicated = {
            ...product,
            name: `${product.name} (Copia)`,
            sku: `${product.sku}-COPY-${Date.now()}`,
            barcode: null, // No duplicar código de barras
            id: undefined // Se generará nuevo ID
        };
        duplicateProduct(duplicated);
    };

    const handleBulkDelete = () => {
        if (selectedProducts.size === 0) {
            alert('Seleccione al menos un producto');
            return;
        }
        if (window.confirm(`¿Eliminar ${selectedProducts.size} producto(s)?`)) {
            selectedProducts.forEach(id => deleteProduct(id));
            setSelectedProducts(new Set());
        }
    };

    const exportToCSV = () => {
        const headers = ['Nombre', 'SKU', 'Código de Barras', 'Categoría', 'Proveedor', 'Precio USD', 'Precio Bs', 'Stock', 'Fecha Vencimiento'];
        const rows = filteredAndSortedProducts.map(p => [
            p.name,
            p.sku || '',
            p.barcode || '',
            p.category || '',
            getSupplierName(p.supplierId) || '',
            p.priceUSD?.toFixed(2) || '0.00',
            p.priceBS?.toFixed(2) || '0.00',
            p.stock || 0,
            p.expirationDate ? new Date(p.expirationDate).toLocaleDateString() : ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventario-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleImportCSV = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            // Mapeo de columnas (ajustar según formato)
            const nameIdx = headers.indexOf('Nombre') || headers.indexOf('name');
            const skuIdx = headers.indexOf('SKU') || headers.indexOf('sku');
            const priceIdx = headers.indexOf('Precio USD') || headers.indexOf('priceUSD');
            const stockIdx = headers.indexOf('Stock') || headers.indexOf('stock');
            const categoryIdx = headers.indexOf('Categoría') || headers.indexOf('category');

            let imported = 0;
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                
                if (nameIdx >= 0 && values[nameIdx]) {
                    const productData = {
                        name: values[nameIdx],
                        sku: skuIdx >= 0 ? values[skuIdx] : `SKU-${Date.now()}-${i}`,
                        priceUSD: priceIdx >= 0 ? parseFloat(values[priceIdx]) || 0 : 0,
                        stock: stockIdx >= 0 ? parseInt(values[stockIdx]) || 0 : 0,
                        category: categoryIdx >= 0 ? values[categoryIdx] : ''
                    };
                    useStore.getState().addProduct(productData);
                    imported++;
                }
            }
            alert(`${imported} productos importados exitosamente`);
        };
        reader.readAsText(file);
    };

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500">No hay productos en el inventario.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Panel de Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Total Productos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Valor Total USD</p>
                    <p className="text-2xl font-bold text-green-600">${stats.totalValueUSD.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Valor Total Bs</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalValueBS.toFixed(2)} Bs</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                    <p className="text-xs text-gray-600 mb-1">Stock Bajo</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50">
                    <p className="text-xs text-gray-600 mb-1">Sin Stock</p>
                    <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-200 bg-orange-50">
                    <p className="text-xs text-gray-600 mb-1">Vencidos</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.expiredCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200 bg-purple-50">
                    <p className="text-xs text-gray-600 mb-1">Por Vencer</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.expiringCount}</p>
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3">
                <div className="flex gap-2 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, SKU, código de barras, categoría o proveedor..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Filter size={18} />
                        Filtros
                    </button>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                            title="Vista tabla"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                            title="Vista grilla"
                        >
                            <Grid3x3 size={18} />
                        </button>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Download size={18} />
                        Exportar CSV
                    </button>
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                        <Upload size={18} />
                        Importar CSV
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImportCSV}
                            className="hidden"
                        />
                    </label>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filtro de Stock</label>
                            <select
                                value={stockFilter}
                                onChange={(e) => {
                                    setStockFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos</option>
                                <option value="low">Stock Bajo</option>
                                <option value="out">Sin Stock</option>
                                <option value="expiring">Por Vencer (7 días)</option>
                                <option value="expired">Vencidos</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [col, order] = e.target.value.split('-');
                                    setSortBy(col);
                                    setSortOrder(order);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name-asc">Nombre (A-Z)</option>
                                <option value="name-desc">Nombre (Z-A)</option>
                                <option value="price-desc">Precio (Mayor a Menor)</option>
                                <option value="price-asc">Precio (Menor a Mayor)</option>
                                <option value="stock-desc">Stock (Mayor a Menor)</option>
                                <option value="stock-asc">Stock (Menor a Mayor)</option>
                                <option value="category-asc">Categoría (A-Z)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Acciones masivas */}
                {selectedProducts.size > 0 && (
                    <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
                        <span className="text-sm text-gray-600">{selectedProducts.size} seleccionado(s)</span>
                        <button
                            onClick={handleBulkDelete}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                            Eliminar Seleccionados
                        </button>
                        <button
                            onClick={() => setSelectedProducts(new Set())}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                            Deseleccionar Todo
                        </button>
                    </div>
                )}
            </div>

            {/* Vista de Tabla */}
            {viewMode === 'table' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 w-12">
                                        <button
                                            onClick={toggleAll}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {selectedProducts.size === paginatedProducts.length ? (
                                                <CheckSquare size={18} />
                                            ) : (
                                                <Square size={18} />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                        Producto <SortIcon column="name" />
                                    </th>
                                    <th className="px-4 py-3">Imagen</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('category')}>
                                        Categoría <SortIcon column="category" />
                                    </th>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('supplier')}>
                                        Proveedor <SortIcon column="supplier" />
                                    </th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('price')}>
                                        Precio USD <SortIcon column="price" />
                                    </th>
                                    <th className="px-4 py-3 text-right">Precio Bs</th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stock')}>
                                        Stock <SortIcon column="stock" />
                                    </th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedProducts.map((product) => {
                                    const isSelected = selectedProducts.has(product.id);
                                    const isLowStock = product.stock > 0 && product.stock <= settings.lowStockThreshold;
                                    const isExpired = product.expirationDate && new Date(product.expirationDate) < new Date();
                                    const daysUntilExpiration = product.expirationDate 
                                        ? Math.ceil((new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))
                                        : null;
                                    const isExpiring = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;

                                    return (
                                        <tr 
                                            key={product.id} 
                                            className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => toggleProduct(product.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare size={18} className="text-blue-600" />
                                                    ) : (
                                                        <Square size={18} />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setQuickViewProduct(product)}
                                                    className="font-medium text-gray-800 hover:text-blue-600 text-left"
                                                >
                                                    {product.name}
                                                </button>
                                                {product.barcode && (
                                                    <p className="text-xs text-gray-400 font-mono mt-1">Código: {product.barcode}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {product.image ? (
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded border border-gray-200"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                                        <ImageIcon size={20} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-sm font-mono">
                                                {product.sku || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{product.category || '-'}</td>
                                            <td className="px-4 py-3">
                                                {getSupplierName(product.supplierId) ? (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Truck size={14} />
                                                        <span className="text-sm">{getSupplierName(product.supplierId)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-800">${product.priceUSD?.toFixed(2) || '0.00'}</td>
                                            <td className="px-4 py-3 text-right text-blue-600 font-medium">
                                                {product.priceBS ? `${product.priceBS.toFixed(2)} Bs` : `${(product.priceUSD * exchangeRate).toFixed(2)} Bs`}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        product.stock === 0 ? 'bg-red-100 text-red-700' :
                                                        isLowStock ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {product.stock}
                                                    </span>
                                                    <button
                                                        onClick={() => setAdjustingProduct(product)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Ajustar stock"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                </div>
                                                {isExpired && (
                                                    <p className="text-xs text-red-600 mt-1">Vencido</p>
                                                )}
                                                {isExpiring && (
                                                    <p className="text-xs text-orange-600 mt-1">Vence en {daysUntilExpiration} día(s)</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => setHistoryProduct(product)}
                                                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                                        title="Ver historial"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setLabelProduct(product)}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                        title="Etiqueta QR"
                                                    >
                                                        <QrCode size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(product)}
                                                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                        title="Duplicar"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(product)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Editar"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('¿Eliminar este producto?')) {
                                                                deleteProduct(product.id);
                                                            }
                                                        }}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Mostrar:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(parseInt(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-gray-600">
                                    de {filteredAndSortedProducts.length} productos
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm text-gray-600">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Vista de Grilla */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedProducts.map((product) => {
                        const isSelected = selectedProducts.has(product.id);
                        const isLowStock = product.stock > 0 && product.stock <= settings.lowStockThreshold;
                        
                        return (
                            <div
                                key={product.id}
                                className={`bg-white rounded-lg border-2 p-4 transition-all ${
                                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <button
                                        onClick={() => toggleProduct(product.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {isSelected ? (
                                            <CheckSquare size={18} className="text-blue-600" />
                                        ) : (
                                            <Square size={18} />
                                        )}
                                    </button>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        product.stock === 0 ? 'bg-red-100 text-red-700' :
                                        isLowStock ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {product.stock} disp.
                                    </span>
                                </div>

                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-32 object-cover rounded-lg mb-2 border border-gray-200"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 border border-gray-200 flex items-center justify-center">
                                        <ImageIcon size={32} className="text-gray-400" />
                                    </div>
                                )}

                                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
                                {product.sku && (
                                    <p className="text-xs text-gray-500 mb-1">SKU: {product.sku}</p>
                                )}
                                {product.category && (
                                    <p className="text-xs text-gray-500 mb-2">Categoría: {product.category}</p>
                                )}

                                <div className="mb-2">
                                    <p className="text-lg font-bold text-gray-900">${product.priceUSD?.toFixed(2) || '0.00'}</p>
                                    <p className="text-sm text-blue-600">
                                        {product.priceBS?.toFixed(2) || (product.priceUSD * exchangeRate).toFixed(2)} Bs
                                    </p>
                                </div>

                                {getSupplierName(product.supplierId) && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                        <Truck size={12} />
                                        <span>{getSupplierName(product.supplierId)}</span>
                                    </div>
                                )}

                                <div className="flex gap-1 mt-3">
                                    <button
                                        onClick={() => setQuickViewProduct(product)}
                                        className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                                    >
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => setAdjustingProduct(product)}
                                        className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                                    >
                                        Stock
                                    </button>
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modales */}
            {labelProduct && (
                <ProductLabelQR
                    product={labelProduct}
                    onClose={() => setLabelProduct(null)}
                />
            )}

            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onEdit={(product) => {
                        onEdit(product);
                        setQuickViewProduct(null);
                    }}
                />
            )}

            {adjustingProduct && (
                <QuickStockAdjust
                    product={adjustingProduct}
                    onClose={() => setAdjustingProduct(null)}
                />
            )}

            {historyProduct && (
                <ProductHistoryModal
                    product={historyProduct}
                    onClose={() => setHistoryProduct(null)}
                />
            )}
        </div>
    );
};

export default ProductListEnhanced;

