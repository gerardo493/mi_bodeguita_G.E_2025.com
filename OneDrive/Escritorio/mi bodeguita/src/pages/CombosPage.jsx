import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useStore } from '../store/useStore';

const CombosPage = () => {
    const combos = useStore((state) => state.combos);
    const products = useStore((state) => state.products);
    const addCombo = useStore((state) => state.addCombo);
    const updateCombo = useStore((state) => state.updateCombo);
    const deleteCombo = useStore((state) => state.deleteCombo);
    const addToCart = useStore((state) => state.addToCart);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priceUSD: '',
        priceBS: '',
        products: [],
        discount: 0
    });
    
    const handleAddProduct = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product && !formData.products.find(p => p.id === productId)) {
            setFormData({
                ...formData,
                products: [...formData.products, { ...product, comboQuantity: 1 }]
            });
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCombo) {
            updateCombo(editingCombo.id, formData);
        } else {
            addCombo(formData);
        }
        setIsFormOpen(false);
        setEditingCombo(null);
        setFormData({ name: '', description: '', priceUSD: '', priceBS: '', products: [], discount: 0 });
    };
    
    const handleAddComboToCart = (combo) => {
        // Agregar todos los productos del combo al carrito
        combo.products.forEach(product => {
            for (let i = 0; i < (product.comboQuantity || 1); i++) {
                addToCart(product);
            }
        });
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Combos y Packs</h2>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nuevo Combo</span>
                </button>
            </div>
            
            {combos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                    <Package className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-500">No hay combos creados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {combos.map(combo => (
                        <div key={combo.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800">{combo.name}</h3>
                                    {combo.description && (
                                        <p className="text-sm text-gray-500 mt-1">{combo.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingCombo(combo);
                                            setFormData(combo);
                                            setIsFormOpen(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('¿Eliminar este combo?')) {
                                                deleteCombo(combo.id);
                                            }
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-1">Incluye:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {combo.products.map((product, idx) => (
                                        <li key={idx}>
                                            {product.comboQuantity || 1}x {product.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <div>
                                    <p className="text-lg font-bold text-gray-900">${combo.priceUSD?.toFixed(2) || '0.00'}</p>
                                    {combo.discount > 0 && (
                                        <p className="text-xs text-green-600">Descuento: {combo.discount}%</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAddComboToCart(combo)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {editingCombo ? 'Editar Combo' : 'Nuevo Combo'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Combo *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio USD *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.priceUSD}
                                        onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Productos del Combo</label>
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleAddProduct(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {products.filter(p => !formData.products.find(cp => cp.id === p.id)).map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - ${product.priceUSD.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                
                                <div className="mt-3 space-y-2">
                                    {formData.products.map((product, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm">{product.name}</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={product.comboQuantity || 1}
                                                    onChange={(e) => {
                                                        const updated = [...formData.products];
                                                        updated[idx].comboQuantity = parseInt(e.target.value) || 1;
                                                        setFormData({ ...formData, products: updated });
                                                    }}
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            products: formData.products.filter((_, i) => i !== idx)
                                                        });
                                                    }}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setEditingCombo(null);
                                        setFormData({ name: '', description: '', priceUSD: '', priceBS: '', products: [], discount: 0 });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={formData.products.length === 0}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {editingCombo ? 'Guardar' : 'Crear Combo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombosPage;

