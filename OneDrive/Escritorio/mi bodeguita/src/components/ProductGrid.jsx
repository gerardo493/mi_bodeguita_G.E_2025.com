import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, X, Scan, Grid3x3, List, Zap, Star, Eye, Layers, Calculator, Scale } from 'lucide-react';
import { useStore } from '../store/useStore';
import { soundService } from '../services/soundService';
import BarcodeScanner from './BarcodeScanner';
import SmartSearch from './SmartSearch';
import ExpressMode from './ExpressMode';
import ProductQuickView from './ProductQuickView';
import BatchAddModal from './BatchAddModal';
import QuickCalculator from './QuickCalculator';
import MonetaryCalculator from './MonetaryCalculator';

const ProductGrid = () => {
    const products = useStore((state) => state.products);
    const addToCart = useStore((state) => state.addToCart);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const settings = useStore((state) => state.settings);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, price, stock
    const [showFilters, setShowFilters] = useState(false);
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid, list
    const [showSmartSearch, setShowSmartSearch] = useState(false);
    const [showExpressMode, setShowExpressMode] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [showBatchAdd, setShowBatchAdd] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [showMonetaryCalculator, setShowMonetaryCalculator] = useState(false);
    const favoriteProducts = useStore((state) => state.favoriteProducts);
    const isFavorite = useStore((state) => state.isFavorite);
    const addFavorite = useStore((state) => state.addFavorite);
    const removeFavorite = useStore((state) => state.removeFavorite);

    // Obtener categorías únicas
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Ordenar productos
    filteredProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return (b.priceUSD || 0) - (a.priceUSD || 0);
            case 'stock':
                return (b.stock || 0) - (a.stock || 0);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    // Atajos de teclado - Solo para teclas de función y combinaciones especiales
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Verificar si el usuario está escribiendo en un input, textarea o contenteditable
            const target = e.target;
            
            // Detectar si es un campo de entrada de forma más robusta
            const isInput = target && (
                target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                (target.isContentEditable && target.isContentEditable === true) ||
                (target.getAttribute && target.getAttribute('contenteditable') === 'true')
            );
            
            // Si está escribiendo en un input, NO hacer nada (dejar que el input maneje todo)
            if (isInput) {
                return; // Permitir que el input maneje el evento normalmente
            }

            // Solo procesar teclas de atajo específicas
            // F1, F2, Escape, o Ctrl/Cmd+K
            const isShortcutKey = 
                e.key === 'F1' || 
                e.key === 'F2' || 
                e.key === 'Escape' ||
                ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K'));

            if (!isShortcutKey) {
                return; // No interferir con otras teclas normales
            }

            // Ctrl+K o Cmd+K para búsqueda inteligente
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                e.stopPropagation();
                setShowSmartSearch(true);
                return;
            }
            
            // F1 para modo express
            if (e.key === 'F1') {
                e.preventDefault();
                e.stopPropagation();
                setShowExpressMode(true);
                return;
            }
            
            // F2 para calculadora monetaria
            if (e.key === 'F2') {
                e.preventDefault();
                e.stopPropagation();
                setShowMonetaryCalculator(true);
                return;
            }
            
            // Esc para cerrar modales
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setShowSmartSearch(false);
                setShowExpressMode(false);
                setShowCalculator(false);
                setShowMonetaryCalculator(false);
                setQuickViewProduct(null);
                return;
            }
        };

        // Usar capture: false para que los inputs puedan manejar primero
        document.addEventListener('keydown', handleKeyPress, false);
        return () => document.removeEventListener('keydown', handleKeyPress, false);
    }, []);

    return (
        <div className="flex flex-col h-full">
            {showBarcodeScanner && (
                <div className="mb-4">
                    <BarcodeScanner 
                        onProductFound={(product) => {
                            setShowBarcodeScanner(false);
                            setSearchTerm('');
                        }}
                        onClose={() => setShowBarcodeScanner(false)}
                    />
                </div>
            )}

            {showSmartSearch && (
                <div className="mb-4">
                    <SmartSearch
                        onSelectProduct={(product) => {
                            if (product.stock > 0) {
                                addToCart(product);
                                if (settings.soundEnabled) {
                                    soundService.playBeep();
                                }
                            }
                            setShowSmartSearch(false);
                        }}
                        onClose={() => setShowSmartSearch(false)}
                    />
                </div>
            )}

            <div className="mb-4 space-y-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar productos, SKU, código de barras o categoría... (Ctrl+K para búsqueda inteligente)"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            // Si es un código de barras, buscar automáticamente
                            if (e.target.value.length >= 8 && /^\d+$/.test(e.target.value)) {
                                const product = products.find(p => p.barcode === e.target.value || p.sku === e.target.value);
                                if (product && product.stock > 0) {
                                    addToCart(product);
                                    if (settings.soundEnabled) {
                                        soundService.playScan();
                                    }
                                    setSearchTerm('');
                                }
                            }
                        }}
                        onKeyDown={(e) => {
                            // Permitir que Enter funcione normalmente en el input
                            if (e.key === 'Enter' && searchTerm.length >= 8) {
                                e.stopPropagation(); // Evitar que otros listeners capturen esto
                                const product = products.find(p => p.barcode === searchTerm || p.sku === searchTerm);
                                if (product && product.stock > 0) {
                                    addToCart(product);
                                    if (settings.soundEnabled) {
                                        soundService.playScan();
                                    }
                                    setSearchTerm('');
                                }
                            }
                        }}
                        onFocus={() => {
                            // Mostrar búsqueda inteligente al hacer focus si hay texto
                            if (searchTerm.length > 0) {
                                setShowSmartSearch(true);
                            }
                        }}
                        autoComplete="off"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
                
                <div className="flex gap-2 items-center flex-wrap">
                    <button
                        onClick={() => setShowSmartSearch(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                        title="Búsqueda inteligente (Ctrl+K)"
                    >
                        <Search size={16} />
                        <span>Búsqueda</span>
                    </button>
                    <button
                        onClick={() => setShowExpressMode(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                        title="Modo Express (F1)"
                    >
                        <Zap size={16} />
                        <span>Express</span>
                    </button>
                    <button
                        onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                        <Scan size={16} />
                        <span>Escanear</span>
                    </button>
                    <button
                        onClick={() => setShowBatchAdd(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                        <Layers size={16} />
                        <span>Lotes</span>
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                        <Filter size={16} />
                        <span>Filtros</span>
                    </button>
                    <button
                        onClick={() => setShowMonetaryCalculator(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        title="Calculadora Monetaria (F2)"
                    >
                        <Calculator size={16} />
                        <span>Calc. Monetaria</span>
                    </button>
                    <button
                        onClick={() => {
                            const scaleModal = document.querySelector('[data-scale-modal]');
                            if (scaleModal) scaleModal.show();
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        title="Balanza"
                    >
                        <Scale size={16} />
                        <span>Balanza</span>
                    </button>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            <Grid3x3 size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                    
                    {(selectedCategory || sortBy !== 'name') && (
                        <button
                            onClick={() => {
                                setSelectedCategory('');
                                setSortBy('name');
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                            <X size={14} />
                            Limpiar
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name">Nombre</option>
                                <option value="price">Precio (Mayor a Menor)</option>
                                <option value="stock">Stock (Mayor a Menor)</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20 md:pb-0"
                : "space-y-2 overflow-y-auto pb-20 md:pb-0"
            }>
                {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    const isLowStock = product.stock > 0 && product.stock <= 10;
                    
                    if (viewMode === 'list') {
                        return (
                            <button
                                key={product.id}
                                onClick={() => {
                                    if (!isOutOfStock) {
                                        addToCart(product);
                                        if (settings.soundEnabled) {
                                            soundService.playBeep();
                                        }
                                    }
                                }}
                                disabled={isOutOfStock}
                                className={`w-full bg-white p-4 rounded-lg shadow-sm border transition-all text-left group flex items-center gap-4 ${
                                    isOutOfStock
                                        ? 'opacity-50 cursor-not-allowed border-red-200'
                                        : 'border-gray-100 hover:shadow-md hover:border-blue-200'
                                }`}
                            >
                                {product.image && (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 truncate">
                                            {product.name}
                                        </h3>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                                            isOutOfStock
                                                ? 'bg-red-100 text-red-600'
                                                : isLowStock
                                                ? 'bg-yellow-100 text-yellow-600'
                                                : 'bg-green-100 text-green-600'
                                        }`}>
                                            {product.stock}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        {product.sku && <span className="text-gray-400">SKU: {product.sku}</span>}
                                        {product.category && <span className="text-gray-400">• {product.category}</span>}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-bold text-gray-900">${product.priceUSD?.toFixed(2) || '0.00'}</p>
                                    <p className="text-sm text-blue-600">{product.priceBS ? `${product.priceBS.toFixed(2)} Bs` : (product.priceUSD ? `${(product.priceUSD * exchangeRate).toFixed(2)} Bs` : '0.00 Bs')}</p>
                                </div>
                            </button>
                        );
                    }

                    return (
                        <div
                            key={product.id}
                            className={`bg-white rounded-xl shadow-sm border transition-all group relative ${
                                isOutOfStock
                                    ? 'opacity-50 border-red-200'
                                    : 'border-gray-100 hover:shadow-md hover:border-blue-200'
                            }`}
                        >
                            <button
                                onClick={() => {
                                    if (!isOutOfStock) {
                                        addToCart(product);
                                        if (settings.soundEnabled) {
                                            soundService.playBeep();
                                        }
                                    }
                                }}
                                disabled={isOutOfStock}
                                className="w-full p-4 text-left flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {product.category || 'General'}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            isOutOfStock
                                                ? 'bg-red-100 text-red-600'
                                                : isLowStock
                                                ? 'bg-yellow-100 text-yellow-600'
                                                : 'bg-green-100 text-green-600'
                                        }`}>
                                            {product.stock} disp.
                                        </span>
                                    </div>
                                    {product.sku && (
                                        <div className="text-xs text-gray-400 mb-1">SKU: {product.sku}</div>
                                    )}
                                    <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    {isOutOfStock && (
                                        <div className="text-xs text-red-600 font-medium mt-1">Sin stock</div>
                                    )}
                                    {isLowStock && !isOutOfStock && (
                                        <div className="text-xs text-yellow-600 font-medium mt-1">Stock bajo</div>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-lg font-bold text-gray-900">
                                            ${product.priceUSD?.toFixed(2) || '0.00'}
                                        </span>
                                        {!isOutOfStock && (
                                            <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Plus size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-blue-600">
                                        {product.priceBS ? `${product.priceBS.toFixed(2)} Bs` : (product.priceUSD ? `${(product.priceUSD * exchangeRate).toFixed(2)} Bs` : '0.00 Bs')}
                                    </div>
                                </div>
                            </button>
                            
                            {/* Botones de acción rápida */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setQuickViewProduct(product);
                                    }}
                                    className="p-1.5 bg-white rounded-lg shadow-md hover:bg-blue-50 text-blue-600"
                                    title="Vista rápida"
                                >
                                    <Eye size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isFavorite(product.id)) {
                                            removeFavorite(product.id);
                                        } else {
                                            addFavorite(product.id);
                                        }
                                    }}
                                    className={`p-1.5 bg-white rounded-lg shadow-md hover:bg-yellow-50 ${
                                        isFavorite(product.id) ? 'text-yellow-600' : 'text-gray-400'
                                    }`}
                                    title={isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                >
                                    <Star size={14} fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No se encontraron productos.
                    </div>
                )}
            </div>

            {/* Modales */}
            {showExpressMode && (
                <ExpressMode
                    onClose={() => setShowExpressMode(false)}
                    onAddToCart={(product) => {
                        addToCart(product);
                        if (settings.soundEnabled) {
                            soundService.playBeep();
                        }
                    }}
                />
            )}

            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onAddToCart={(product) => {
                        addToCart(product);
                        if (settings.soundEnabled) {
                            soundService.playBeep();
                        }
                        setQuickViewProduct(null);
                    }}
                />
            )}

            {showBatchAdd && (
                <BatchAddModal
                    onClose={() => setShowBatchAdd(false)}
                    onAdd={(product) => {
                        addToCart(product);
                        if (settings.soundEnabled) {
                            soundService.playBeep();
                        }
                    }}
                />
            )}

            {showCalculator && (
                <QuickCalculator
                    onClose={() => setShowCalculator(false)}
                />
            )}

            {showMonetaryCalculator && (
                <MonetaryCalculator
                    onClose={() => setShowMonetaryCalculator(false)}
                    onResult={(result) => {
                        // El resultado puede ser usado para cálculos rápidos
                        console.log('Resultado calculadora:', result);
                    }}
                />
            )}
        </div>
    );
};

export default ProductGrid;
