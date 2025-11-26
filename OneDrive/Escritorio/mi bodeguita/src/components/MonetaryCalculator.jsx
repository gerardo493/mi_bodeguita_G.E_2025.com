import React, { useState, useEffect } from 'react';
import { Calculator, X, DollarSign, ArrowLeftRight, Copy } from 'lucide-react';
import { useStore } from '../store/useStore';

const MonetaryCalculator = ({ onClose, onResult }) => {
    const exchangeRate = useStore((state) => state.exchangeRate);
    const [display, setDisplay] = useState('0');
    const [currency, setCurrency] = useState('USD'); // USD o BS
    const [previousValue, setPreviousValue] = useState(null);
    const [operation, setOperation] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Convertir entre monedas
    const convertToUSD = (value) => {
        if (currency === 'BS') {
            return value / exchangeRate;
        }
        return value;
    };

    const convertToBS = (value) => {
        if (currency === 'USD') {
            return value * exchangeRate;
        }
        return value;
    };

    const getCurrentValue = () => parseFloat(display) || 0;
    const getValueInUSD = () => convertToUSD(getCurrentValue());
    const getValueInBS = () => convertToBS(getCurrentValue());

    const handleNumber = (num) => {
        if (display === '0') {
            setDisplay(num.toString());
        } else {
            setDisplay(display + num);
        }
    };

    const handleDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const handleOperation = (op) => {
        if (previousValue === null) {
            setPreviousValue(getCurrentValue());
            setDisplay('0');
            setOperation(op);
        } else {
            const result = calculate();
            setPreviousValue(result);
            setDisplay('0');
            setOperation(op);
        }
    };

    const calculate = () => {
        if (previousValue === null || operation === null) return getCurrentValue();

        const current = getCurrentValue();
        let result;
        switch (operation) {
            case '+':
                result = previousValue + current;
                break;
            case '-':
                result = previousValue - current;
                break;
            case '*':
                result = previousValue * current;
                break;
            case '/':
                result = current !== 0 ? previousValue / current : 0;
                break;
            default:
                result = current;
        }
        return result;
    };

    const handleEquals = () => {
        const result = calculate();
        const resultUSD = convertToUSD(result);
        const resultBS = convertToBS(result);
        
        setDisplay(result.toFixed(2));
        setPreviousValue(null);
        setOperation(null);
        
        // Agregar al historial
        const historyEntry = {
            expression: `${previousValue?.toFixed(2) || '0'} ${operation || ''} ${getCurrentValue().toFixed(2)}`,
            result: result.toFixed(2),
            currency,
            resultUSD: resultUSD.toFixed(2),
            resultBS: resultBS.toFixed(2),
            timestamp: new Date().toLocaleTimeString()
        };
        setHistory([historyEntry, ...history].slice(0, 10));
    };

    const handleClear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
    };

    const handleClearEntry = () => {
        setDisplay('0');
    };

    const handleBackspace = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay('0');
        }
    };

    const handleCurrencySwitch = () => {
        const currentValue = getCurrentValue();
        if (currency === 'USD') {
            const bsValue = convertToBS(currentValue);
            setDisplay(bsValue.toFixed(2));
            setCurrency('BS');
        } else {
            const usdValue = convertToUSD(currentValue);
            setDisplay(usdValue.toFixed(2));
            setCurrency('USD');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const quickOperations = [
        { label: '+10%', op: () => setDisplay((getCurrentValue() * 1.1).toFixed(2)) },
        { label: '+20%', op: () => setDisplay((getCurrentValue() * 1.2).toFixed(2)) },
        { label: '+50%', op: () => setDisplay((getCurrentValue() * 1.5).toFixed(2)) },
        { label: '×2', op: () => setDisplay((getCurrentValue() * 2).toFixed(2)) },
        { label: '÷2', op: () => setDisplay((getCurrentValue() / 2).toFixed(2)) },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Calculator size={20} />
                        Calculadora Monetaria
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                            {showHistory ? 'Ocultar' : 'Historial'}
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {showHistory && history.length > 0 && (
                    <div className="p-4 bg-gray-50 border-b border-gray-100 max-h-40 overflow-y-auto">
                        <div className="space-y-2">
                            {history.map((entry, idx) => (
                                <div key={idx} className="bg-white p-2 rounded text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{entry.expression} =</span>
                                        <span className="font-bold">{entry.result} {entry.currency}</span>
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">
                                        ${entry.resultUSD} USD / {entry.resultBS} Bs
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-4">
                    {/* Display principal */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                            <button
                                onClick={handleCurrencySwitch}
                                className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                            >
                                <ArrowLeftRight size={14} />
                                {currency}
                            </button>
                            <div className="text-xs text-gray-500">
                                Tasa: {exchangeRate.toFixed(2)} Bs/$
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900 mb-1 min-h-[2.5rem]">
                                {display}
                            </div>
                            <div className="flex justify-end gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <DollarSign size={14} />
                                    <span>${getValueInUSD().toFixed(2)}</span>
                                </div>
                                <div>
                                    <span>{getValueInBS().toFixed(2)} Bs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operaciones rápidas */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {quickOperations.map((quick, idx) => (
                            <button
                                key={idx}
                                onClick={quick.op}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-medium"
                            >
                                {quick.label}
                            </button>
                        ))}
                    </div>

                    {/* Teclado */}
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={handleClear}
                            className="col-span-2 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600"
                        >
                            C
                        </button>
                        <button
                            onClick={handleClearEntry}
                            className="bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600"
                        >
                            CE
                        </button>
                        <button
                            onClick={handleBackspace}
                            className="bg-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-400"
                        >
                            ⌫
                        </button>

                        <button
                            onClick={() => handleOperation('/')}
                            className="bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
                        >
                            ÷
                        </button>
                        <button
                            onClick={() => handleOperation('*')}
                            className="bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
                        >
                            ×
                        </button>

                        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumber(num)}
                                className="bg-gray-100 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-200"
                            >
                                {num}
                            </button>
                        ))}

                        <button
                            onClick={() => handleOperation('-')}
                            className="bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
                        >
                            −
                        </button>

                        <button
                            onClick={() => handleNumber(0)}
                            className="col-span-2 bg-gray-100 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-200"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDecimal}
                            className="bg-gray-100 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-200"
                        >
                            .
                        </button>
                        <button
                            onClick={() => handleOperation('+')}
                            className="bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
                        >
                            +
                        </button>

                        <button
                            onClick={handleEquals}
                            className="col-span-4 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                        >
                            =
                        </button>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => {
                                if (onResult) {
                                    onResult({
                                        value: getCurrentValue(),
                                        currency,
                                        usd: getValueInUSD(),
                                        bs: getValueInBS()
                                    });
                                }
                                onClose();
                            }}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
                        >
                            Usar Resultado
                        </button>
                        <button
                            onClick={() => copyToClipboard(display)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                        >
                            <Copy size={16} />
                            Copiar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonetaryCalculator;

