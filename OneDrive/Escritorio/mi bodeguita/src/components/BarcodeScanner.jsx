import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { barcodeService } from '../services/barcodeService';
import { soundService } from '../services/soundService';

const BarcodeScanner = ({ onProductFound, onClose }) => {
    const products = useStore((state) => state.products);
    const addToCart = useStore((state) => state.addToCart);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [lastScanned, setLastScanned] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleBarcodeInput = (value) => {
        setBarcodeInput(value);
        
        // Si el código tiene al menos 8 caracteres, buscar automáticamente
        if (value.length >= 8) {
            handleScan(value);
        }
    };

    const handleScan = (barcode) => {
        const product = barcodeService.findProductByBarcode(barcode, products);
        
        if (product) {
            if (product.stock > 0) {
                addToCart(product);
                soundService.playScan();
                setLastScanned({ product, success: true });
                setBarcodeInput('');
                
                if (onProductFound) {
                    onProductFound(product);
                }
            } else {
                soundService.playError();
                setLastScanned({ product, success: false, message: 'Sin stock' });
            }
        } else {
            soundService.playError();
            setLastScanned({ success: false, message: 'Producto no encontrado' });
        }
        
        // Limpiar después de 2 segundos
        setTimeout(() => {
            setLastScanned(null);
            setBarcodeInput('');
            if (inputRef.current) inputRef.current.focus();
        }, 2000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && barcodeInput.length >= 3) {
            handleScan(barcodeInput);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Search size={20} />
                    Escanear Código de Barras
                </h3>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono"
                    placeholder="Escanee o ingrese código de barras..."
                    value={barcodeInput}
                    onChange={(e) => handleBarcodeInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                />

                {lastScanned && (
                    <div className={`p-3 rounded-lg ${
                        lastScanned.success 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        {lastScanned.success ? (
                            <div>
                                <p className="font-medium text-green-800">
                                    ✓ {lastScanned.product.name} agregado al carrito
                                </p>
                                <p className="text-sm text-green-600">
                                    Stock: {lastScanned.product.stock} unidades
                                </p>
                            </div>
                        ) : (
                            <p className="font-medium text-red-800">
                                ✗ {lastScanned.message || 'Error al escanear'}
                            </p>
                        )}
                    </div>
                )}

                <p className="text-xs text-gray-500 text-center">
                    Presione Enter o espere a que se detecte automáticamente
                </p>
            </div>
        </div>
    );
};

export default BarcodeScanner;

