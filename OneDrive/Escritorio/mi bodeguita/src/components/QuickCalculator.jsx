import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';

const QuickCalculator = ({ onClose, onCalculate }) => {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState(null);
    const [operation, setOperation] = useState(null);

    const handleNumber = (num) => {
        if (display === '0') {
            setDisplay(num.toString());
        } else {
            setDisplay(display + num);
        }
    };

    const handleOperation = (op) => {
        if (previousValue === null) {
            setPreviousValue(parseFloat(display));
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
        if (previousValue === null || operation === null) return parseFloat(display);

        const current = parseFloat(display);
        switch (operation) {
            case '+':
                return previousValue + current;
            case '-':
                return previousValue - current;
            case '*':
                return previousValue * current;
            case '/':
                return previousValue / current;
            default:
                return current;
        }
    };

    const handleEquals = () => {
        const result = calculate();
        setDisplay(result.toString());
        setPreviousValue(null);
        setOperation(null);
        if (onCalculate) {
            onCalculate(result);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Calculator size={20} />
                        Calculadora
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                        <div className="text-right text-2xl font-bold text-gray-800 min-h-[2rem]">
                            {display}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={handleClear}
                            className="col-span-2 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600"
                        >
                            C
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

                        {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map(num => (
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
                            onClick={() => handleOperation('+')}
                            className="bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
                        >
                            +
                        </button>
                        <button
                            onClick={handleEquals}
                            className="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                        >
                            =
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickCalculator;

