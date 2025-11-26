import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const StockTransferModal = ({ onClose }) => {
    const products = useStore((state) => state.products);
    const addStockTransfer = useStore((state) => state.addStockTransfer);
    
    const [formData, setFormData] = useState({
        fromProductId: '',
        toProductId: '',
        quantity: '',
        fromLocation: '',
        toLocation: '',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.fromProductId || !formData.quantity || parseFloat(formData.quantity) <= 0) {
            alert('Complete todos los campos requeridos');
            return;
        }

        const fromProduct = products.find(p => p.id === formData.fromProductId);
        if (!fromProduct || fromProduct.stock < parseFloat(formData.quantity)) {
            alert('Stock insuficiente para transferir');
            return;
        }

        addStockTransfer({
            fromProductId: formData.fromProductId,
            toProductId: formData.toProductId || formData.fromProductId, // Si no hay destino, es ajuste
            quantity: parseFloat(formData.quantity),
            fromLocation: formData.fromLocation || 'Principal',
            toLocation: formData.toLocation || 'Secundario',
            notes: formData.notes
        });

        alert('Transferencia registrada exitosamente');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Transferencia de Stock</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Producto Origen *</label>
                        <select
                            required
                            value={formData.fromProductId}
                            onChange={(e) => {
                                const product = products.find(p => p.id === e.target.value);
                                setFormData({ ...formData, fromProductId: e.target.value });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccione producto</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (Stock: {product.stock})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            max={products.find(p => p.id === formData.fromProductId)?.stock || 0}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                        {formData.fromProductId && (
                            <p className="text-xs text-gray-500 mt-1">
                                Stock disponible: {products.find(p => p.id === formData.fromProductId)?.stock || 0}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación Origen</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.fromLocation}
                                onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                                placeholder="Principal"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación Destino</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.toLocation}
                                onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                                placeholder="Secundario"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="2"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Transferir
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockTransferModal;

