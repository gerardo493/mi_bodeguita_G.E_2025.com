import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

const SmartSearch = ({ onSelectProduct, onClose }) => {
    const products = useStore((state) => state.products);
    const sales = useStore((state) => state.sales);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        // Cargar historial de búsquedas desde localStorage
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Calcular productos más buscados
    const getFrequentlySearched = () => {
        const searchCounts = {};
        searchHistory.forEach(term => {
            searchCounts[term] = (searchCounts[term] || 0) + 1;
        });
        return Object.entries(searchCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([term]) => term);
    };

    // Generar sugerencias inteligentes
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        const term = searchTerm.toLowerCase();
        const matches = products
            .filter(product => {
                const nameMatch = product.name.toLowerCase().includes(term);
                const skuMatch = product.sku?.toLowerCase().includes(term);
                const categoryMatch = product.category?.toLowerCase().includes(term);
                const barcodeMatch = product.barcode?.includes(term);
                
                return nameMatch || skuMatch || categoryMatch || barcodeMatch;
            })
            .slice(0, 10)
            .map(product => ({
                ...product,
                relevance: calculateRelevance(product, term)
            }))
            .sort((a, b) => b.relevance - a.relevance);

        setSuggestions(matches);
    }, [searchTerm, products]);

    const calculateRelevance = (product, term) => {
        let score = 0;
        const nameLower = product.name.toLowerCase();
        const termLower = term.toLowerCase();

        // Coincidencia exacta en nombre
        if (nameLower === termLower) score += 100;
        // Empieza con el término
        else if (nameLower.startsWith(termLower)) score += 50;
        // Contiene el término
        else if (nameLower.includes(termLower)) score += 25;

        // SKU exacto
        if (product.sku?.toLowerCase() === termLower) score += 80;
        // Código de barras exacto
        if (product.barcode === term) score += 90;

        // Stock disponible aumenta relevancia
        if (product.stock > 0) score += 10;

        return score;
    };

    const handleSelect = (product) => {
        // Guardar en historial
        if (searchTerm && !searchHistory.includes(searchTerm)) {
            const newHistory = [searchTerm, ...searchHistory].slice(0, 20);
            setSearchHistory(newHistory);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        }

        if (onSelectProduct) {
            onSelectProduct(product);
        }
        setSearchTerm('');
        if (onClose) onClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            handleSelect(suggestions[0]);
        }
    };

    const frequentlySearched = getFrequentlySearched();

    return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar productos, SKU, código de barras..."
                        className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {searchTerm.length === 0 && (
                    <div className="p-4">
                        {frequentlySearched.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <TrendingUp size={16} />
                                    Búsquedas Frecuentes
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {frequentlySearched.map((term, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSearchTerm(term)}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {searchHistory.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock size={16} />
                                    Búsquedas Recientes
                                </h4>
                                <div className="space-y-1">
                                    {searchHistory.slice(0, 5).map((term, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSearchTerm(term)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {searchTerm.length > 0 && suggestions.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <p>No se encontraron productos</p>
                    </div>
                )}

                {suggestions.length > 0 && (
                    <div className="p-2">
                        {suggestions.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors mb-1"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            {product.sku && <span>SKU: {product.sku}</span>}
                                            {product.category && <span>• {product.category}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">${product.priceUSD?.toFixed(2) || '0.00'}</p>
                                        <p className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock} disp.
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartSearch;

