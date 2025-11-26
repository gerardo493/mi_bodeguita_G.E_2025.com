import React, { useState } from 'react';
import { Download, Upload, Save, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { exportData, importData } from '../services/backupService';

const SettingsPage = () => {
    const settings = useStore((state) => state.settings);
    const updateSettings = useStore((state) => state.updateSettings);
    const exportDataStore = useStore((state) => state.exportData);
    const importDataStore = useStore((state) => state.importData);
    
    const [localSettings, setLocalSettings] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = () => {
        updateSettings(localSettings);
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 2000);
    };
    
    const handleExport = () => {
        const data = exportDataStore();
        exportData(data);
    };
    
    const handleImport = async () => {
        if (!window.confirm('¿Está seguro? Esto reemplazará todos los datos actuales.')) {
            return;
        }
        
        try {
            const data = await importData();
            importDataStore(data);
            alert('Datos importados correctamente');
            window.location.reload();
        } catch (error) {
            alert('Error al importar: ' + error.message);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Save size={18} />
                    <span>Guardar Cambios</span>
                </button>
            </div>
            
            {isSaving && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                    Configuración guardada correctamente
                </div>
            )}
            
            {/* Backup y Restauración */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings size={20} />
                    Backup y Restauración
                </h3>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Download size={18} />
                            <span>Exportar Datos</span>
                        </button>
                        <button
                            onClick={handleImport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Upload size={18} />
                            <span>Importar Datos</span>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">
                        Exporte todos sus datos (productos, ventas, clientes, etc.) o restaure desde un backup anterior.
                    </p>
                </div>
            </div>
            
            {/* Configuración General */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración General</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Umbral de Stock Bajo
                        </label>
                        <input
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={localSettings.lowStockThreshold}
                            onChange={(e) => setLocalSettings({ ...localSettings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tasa de Impuesto (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={localSettings.taxRate}
                            onChange={(e) => setLocalSettings({ ...localSettings, taxRate: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Habilitar Sonidos</label>
                            <p className="text-xs text-gray-500">Reproducir sonidos al realizar acciones</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={localSettings.enableSounds}
                            onChange={(e) => setLocalSettings({ ...localSettings, enableSounds: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Impresión Automática</label>
                            <p className="text-xs text-gray-500">Imprimir ticket automáticamente al completar venta</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={localSettings.autoPrint}
                            onChange={(e) => setLocalSettings({ ...localSettings, autoPrint: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
            
            {/* Configuración de Facturación */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Facturación</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Factura</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={localSettings.invoiceNumber}
                            onChange={(e) => setLocalSettings({ ...localSettings, invoiceNumber: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={localSettings.invoiceSeries}
                            onChange={(e) => setLocalSettings({ ...localSettings, invoiceSeries: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            
            {/* Ubicaciones */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubicaciones</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ubicaciones Disponibles</label>
                    <div className="space-y-2">
                        {localSettings.locations.map((location, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => {
                                        const locations = [...localSettings.locations];
                                        locations[idx] = e.target.value;
                                        setLocalSettings({ ...localSettings, locations });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {localSettings.locations.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const locations = localSettings.locations.filter((_, i) => i !== idx);
                                            setLocalSettings({ ...localSettings, locations });
                                        }}
                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            setLocalSettings({
                                ...localSettings,
                                locations: [...localSettings.locations, 'nueva ubicación']
                            });
                        }}
                        className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        + Agregar Ubicación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

