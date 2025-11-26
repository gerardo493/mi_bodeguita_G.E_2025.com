import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';

const QuickStockAdjust = ({ product, onClose }) => {
    const increaseStock = useStore((state) => state.increaseStock);
    const decreaseStock = useStore((state) => state.decreaseStock);
    const [adjustment, setAdjustment] = useState('');
    const [reason, setReason] = useState('adjustment');
    const [notes, setNotes] = useState('');

    const handleAdjust = (type) => {
        const quantity = parseInt(adjustment) || 0;
        if (quantity <= 0) {
            alert('Ingrese una cantidad válida');
            return;
        }

        if (type === 'increase') {
            increaseStock(product.id, quantity, reason, notes || 'Ajuste manual desde inventario');
        } else {
            if (quantity > product.stock) {
                alert('No se puede disminuir más stock del disponible');
                return;
            }
            decreaseStock(product.id, quantity, reason, notes || 'Ajuste manual desde inventario');
        }

        setAdjustment('');
        setNotes('');
        alert('Stock ajustado exitosamente');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Ajustar Stock</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Producto</p>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">Stock actual: {product.stock}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                            placeholder="0"
                            value={adjustment}
                            onChange={(e) => setAdjustment(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Razón</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="adjustment">Ajuste manual</option>
                            <option value="purchase">Compra</option>
                            <option value="return">Devolución</option>
                            <option value="damage">Daño/Pérdida</option>
                            <option value="transfer">Transferencia</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="2"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Agregar nota sobre el ajuste..."
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            onClick={() => handleAdjust('increase')}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                        >
                            <Plus size={20} />
                            Aumentar
                        </button>
                        <button
                            onClick={() => handleAdjust('decrease')}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
                        >
                            <Minus size={20} />
                            Disminuir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickStockAdjust;

