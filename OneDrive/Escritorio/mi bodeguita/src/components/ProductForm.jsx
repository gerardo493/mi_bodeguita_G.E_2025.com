import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { X, Upload, Image as ImageIcon, XCircle } from 'lucide-react';

const ProductForm = ({ onClose, editingProduct = null }) => {
    const addProduct = useStore((state) => state.addProduct);
    const updateProduct = useStore((state) => state.updateProduct);
    const exchangeRate = useStore((state) => state.exchangeRate);
    const suppliers = useStore((state) => state.suppliers);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        priceUSD: '',
        priceBS: '',
        purchasePriceUSD: '',
        purchasePriceBS: '',
        stock: '',
        category: '',
        expirationDate: '',
        image: null,
        supplierId: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageMethod, setImageMethod] = useState('url'); // 'url' o 'upload'
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editingProduct) {
            const image = editingProduct.image || null;
            setFormData({
                name: editingProduct.name || '',
                sku: editingProduct.sku || '',
                barcode: editingProduct.barcode || '',
                priceUSD: editingProduct.priceUSD || '',
                priceBS: editingProduct.priceBS || (editingProduct.priceUSD ? (editingProduct.priceUSD * exchangeRate).toFixed(2) : ''),
                purchasePriceUSD: editingProduct.purchasePriceUSD || '',
                purchasePriceBS: editingProduct.purchasePriceBS || '',
                stock: editingProduct.stock || '',
                category: editingProduct.category || '',
                expirationDate: editingProduct.expirationDate ? editingProduct.expirationDate.split('T')[0] : '',
                image: image,
                supplierId: editingProduct.supplierId || ''
            });
            // Determinar si es URL o base64
            if (image) {
                setImageMethod(image.startsWith('data:') ? 'upload' : 'url');
                setImagePreview(image);
            }
        } else {
            // Generar SKU automático si no hay producto en edición
            setFormData(prev => ({
                ...prev,
                sku: prev.sku || `SKU-${Date.now()}`
            }));
        }
    }, [editingProduct, exchangeRate]);

    const handlePriceUSDChange = (value) => {
        const usd = parseFloat(value) || 0;
        const bs = (usd * exchangeRate).toFixed(2);
        setFormData({ ...formData, priceUSD: value, priceBS: bs });
    };

    const handlePriceBSChange = (value) => {
        const bs = parseFloat(value) || 0;
        const usd = (bs / exchangeRate).toFixed(2);
        setFormData({ ...formData, priceBS: value, priceUSD: usd });
    };

    const compressImage = (file, maxWidth = 800, quality = 0.8) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedDataUrl);
                };
            };
        });
    };

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, seleccione un archivo de imagen válido (JPG, PNG, GIF, etc.)');
            return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen es demasiado grande. Por favor, seleccione una imagen menor a 5MB.');
            return;
        }

        try {
            const compressedImage = await compressImage(file);
            setFormData({ ...formData, image: compressedImage });
            setImagePreview(compressedImage);
            setImageMethod('upload');
        } catch (error) {
            console.error('Error procesando imagen:', error);
            alert('Error al procesar la imagen. Por favor, intente nuevamente.');
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const removeImage = () => {
        setFormData({ ...formData, image: null });
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const productData = {
            ...formData,
            priceUSD: parseFloat(formData.priceUSD) || 0,
            priceBS: parseFloat(formData.priceBS) || (parseFloat(formData.priceUSD) * exchangeRate),
            purchasePriceUSD: parseFloat(formData.purchasePriceUSD) || 0,
            purchasePriceBS: parseFloat(formData.purchasePriceBS) || (parseFloat(formData.purchasePriceUSD) * exchangeRate),
            stock: parseInt(formData.stock) || 0,
            sku: formData.sku || `SKU-${Date.now()}`,
            barcode: formData.barcode || null,
            expirationDate: formData.expirationDate || null,
            image: formData.image || null,
            supplierId: formData.supplierId || null
        };

        if (editingProduct) {
            updateProduct(editingProduct.id, productData);
        } else {
            addProduct(productData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto my-4">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Harina PAN"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Código</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="SKU-001"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            placeholder="1234567890123"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ingrese el código de barras del producto</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta (USD) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.priceUSD}
                                onChange={(e) => handlePriceUSDChange(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta (Bs) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.priceBS}
                                onChange={(e) => handlePriceBSChange(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra (USD)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.purchasePriceUSD}
                                onChange={(e) => {
                                    const usd = parseFloat(e.target.value) || 0;
                                    const bs = (usd * exchangeRate).toFixed(2);
                                    setFormData({ ...formData, purchasePriceUSD: e.target.value, purchasePriceBS: bs });
                                }}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra (Bs)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.purchasePriceBS}
                                onChange={(e) => {
                                    const bs = parseFloat(e.target.value) || 0;
                                    const usd = (bs / exchangeRate).toFixed(2);
                                    setFormData({ ...formData, purchasePriceBS: e.target.value, purchasePriceUSD: usd });
                                }}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {formData.purchasePriceUSD && formData.priceUSD && parseFloat(formData.purchasePriceUSD) > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">
                                Margen de ganancia: {((parseFloat(formData.priceUSD) - parseFloat(formData.purchasePriceUSD)) / parseFloat(formData.purchasePriceUSD) * 100).toFixed(2)}%
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
                            <input
                                type="number"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex items-end">
                            <p className="text-xs text-gray-500">
                                Tasa: {exchangeRate.toFixed(2)} Bs/$
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría (Opcional)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="Ej. Víveres"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor (Opcional)</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.supplierId}
                            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        >
                            <option value="">Seleccionar proveedor...</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                        {suppliers.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                No hay proveedores registrados. <a href="/suppliers" className="text-blue-600 hover:underline">Agregar proveedor</a>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
                        
                        {/* Selector de método */}
                        <div className="flex gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setImageMethod('upload')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    imageMethod === 'upload'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Upload size={16} className="inline mr-2" />
                                Subir Archivo
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageMethod('url')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    imageMethod === 'url'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <ImageIcon size={16} className="inline mr-2" />
                                Desde URL
                            </button>
                        </div>

                        {/* Subir archivo */}
                        {imageMethod === 'upload' && (
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                    dragActive
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                }`}
                            >
                                {imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-w-full max-h-48 rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-600 mb-2">
                                            Arrastra una imagen aquí o haz clic para seleccionar
                                        </p>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Formatos: JPG, PNG, GIF (máx. 5MB)
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            Seleccionar Archivo
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileInput}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* Desde URL */}
                        {imageMethod === 'url' && (
                            <div>
                                <input
                                    type="url"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''}
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        setFormData({ ...formData, image: url || null });
                                        setImagePreview(url || null);
                                    }}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                                {imagePreview && !imagePreview.startsWith('data:') && (
                                    <div className="mt-3 relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-w-full max-h-48 rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                alert('No se pudo cargar la imagen desde la URL. Verifique que la URL sea correcta.');
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Vista previa mejorada */}
                        {imagePreview && imageMethod === 'upload' && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">
                                    ✓ Imagen cargada correctamente
                                </p>
                                <p className="text-xs text-gray-500">
                                    La imagen será comprimida automáticamente para optimizar el almacenamiento.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
