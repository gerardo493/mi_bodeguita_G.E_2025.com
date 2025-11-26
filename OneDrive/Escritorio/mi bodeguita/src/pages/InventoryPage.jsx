import React, { useState } from 'react';
import { Plus, Download, ArrowRight, QrCode } from 'lucide-react';
import ProductListEnhanced from '../components/ProductListEnhanced';
import ProductForm from '../components/ProductForm';
import StockTransferModal from '../components/StockTransferModal';
import BulkLabelsQR from '../components/BulkLabelsQR';
import { useStore } from '../store/useStore';
import { generateInventoryPDF } from '../services/pdfService';

const InventoryPage = () => {
  const products = useStore((state) => state.products);
  const exchangeRate = useStore((state) => state.exchangeRate);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBulkLabels, setShowBulkLabels] = useState(false);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => generateInventoryPDF(products, exchangeRate)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Download size={20} />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={() => setShowBulkLabels(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <QrCode size={20} />
            <span>Etiquetas QR</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
          >
            <ArrowRight size={20} />
            <span>Transferir Stock</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <ProductListEnhanced onEdit={handleEdit} />

      {isFormOpen && (
        <ProductForm 
          onClose={handleCloseForm} 
          editingProduct={editingProduct} 
        />
      )}

      {showTransferModal && (
        <StockTransferModal
          onClose={() => setShowTransferModal(false)}
        />
      )}

      {showBulkLabels && (
        <BulkLabelsQR
          onClose={() => setShowBulkLabels(false)}
        />
      )}
    </div>
  );
};

export default InventoryPage;
