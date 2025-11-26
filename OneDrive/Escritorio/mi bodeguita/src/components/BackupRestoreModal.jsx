import React, { useState } from 'react';
import { X, Download, Upload, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { backupService } from '../services/backupService';

const BackupRestoreModal = ({ onClose }) => {
    const exportData = useStore((state) => state.exportData);
    const importData = useStore((state) => state.importData);
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreFile, setRestoreFile] = useState(null);
    const [error, setError] = useState(null);

    const handleExport = () => {
        const data = exportData();
        backupService.exportData(data);
        alert('Backup exportado exitosamente');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRestoreFile(file);
            setError(null);
        }
    };

    const handleRestore = async () => {
        if (!restoreFile) {
            setError('Seleccione un archivo de backup');
            return;
        }

        if (!window.confirm('¿Está seguro? Esta acción reemplazará todos los datos actuales.')) {
            return;
        }

        setIsRestoring(true);
        setError(null);

        try {
            const data = await backupService.importData(restoreFile);
            
            if (!backupService.validateData(data)) {
                throw new Error('El archivo no tiene un formato válido');
            }

            importData(data);
            alert('Datos restaurados exitosamente. Recargue la página.');
            onClose();
        } catch (err) {
            setError(err.message || 'Error al restaurar los datos');
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Backup y Restauración</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Exportar */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Exportar Datos</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Cree una copia de seguridad de todos sus datos (productos, ventas, clientes, etc.)
                        </p>
                        <button
                            onClick={handleExport}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Download size={20} />
                            <span>Exportar Backup</span>
                        </button>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Restaurar */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Restaurar Datos</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Importe un archivo de backup para restaurar todos los datos. Esta acción reemplazará los datos actuales.
                        </p>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                <AlertCircle size={18} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="space-y-3">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileSelect}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {restoreFile && (
                                <p className="text-sm text-gray-600">
                                    Archivo seleccionado: {restoreFile.name}
                                </p>
                            )}
                            <button
                                onClick={handleRestore}
                                disabled={!restoreFile || isRestoring}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload size={20} />
                                <span>{isRestoring ? 'Restaurando...' : 'Restaurar Backup'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupRestoreModal;

