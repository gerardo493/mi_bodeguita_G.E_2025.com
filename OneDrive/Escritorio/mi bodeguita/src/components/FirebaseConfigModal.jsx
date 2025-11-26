import React, { useState, useEffect } from 'react';
import { X, Cloud, CloudOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { syncService } from '../services/syncService';
import { useStore } from '../store/useStore';

const FirebaseConfigModal = ({ onClose }) => {
    const [config, setConfig] = useState({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
    });
    const [userId, setUserId] = useState('');
    const [status, setStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const exportData = useStore((state) => state.exportData);
    const importData = useStore((state) => state.importData);

    useEffect(() => {
        // Cargar configuración guardada
        const savedConfig = localStorage.getItem('firebase-config');
        const savedUserId = localStorage.getItem('firebase-user-id');
        
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error('Error cargando configuración:', e);
            }
        }
        
        if (savedUserId) {
            setUserId(savedUserId);
        }

        // Verificar estado actual
        const currentStatus = syncService.getStatus();
        setIsConnected(currentStatus.isInitialized && currentStatus.syncEnabled);
    }, []);

    const handleSave = async () => {
        if (!config.apiKey || !config.projectId) {
            alert('Por favor, completa al menos API Key y Project ID');
            return;
        }

        if (!userId) {
            alert('Por favor, ingresa un ID de usuario (puede ser tu email o un ID único)');
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            // Guardar configuración
            localStorage.setItem('firebase-config', JSON.stringify(config));
            localStorage.setItem('firebase-user-id', userId);

            // Inicializar Firebase
            const initialized = await syncService.initialize(config);
            
            if (!initialized) {
                throw new Error('No se pudo inicializar Firebase. Verifica tu configuración.');
            }

            // Habilitar sincronización
            await syncService.enableSync(userId, (cloudData) => {
                // Cuando hay cambios en la nube, actualizar local
                if (cloudData && Object.keys(cloudData).length > 0) {
                    importData(cloudData);
                    setStatus({ type: 'success', message: 'Datos sincronizados desde la nube' });
                }
            });

            // Subir datos actuales a la nube
            const currentData = exportData();
            await syncService.uploadToCloud(currentData);

            setIsConnected(true);
            setStatus({ type: 'success', message: 'Firebase configurado y sincronizado correctamente' });
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Error al configurar Firebase' });
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = () => {
        syncService.disableSync();
        localStorage.removeItem('firebase-config');
        localStorage.removeItem('firebase-user-id');
        setIsConnected(false);
        setStatus({ type: 'info', message: 'Sincronización deshabilitada' });
    };

    const handleForceSync = async () => {
        setIsLoading(true);
        setStatus(null);

        try {
            const currentData = exportData();
            const success = await syncService.forceSync(currentData);
            
            if (success) {
                setStatus({ type: 'success', message: 'Datos sincronizados exitosamente' });
            } else {
                throw new Error('Error al sincronizar');
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Error al sincronizar' });
        } finally {
            setIsLoading(false);
        }
    };

    const currentStatus = syncService.getStatus();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {isConnected ? <Cloud className="text-green-600" size={20} /> : <CloudOff className="text-gray-400" size={20} />}
                        Configuración de Sincronización en la Nube
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Estado actual */}
                    {isConnected && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="text-green-600" size={20} />
                                <span className="font-semibold text-green-800">Sincronización Activa</span>
                            </div>
                            <p className="text-sm text-green-700">
                                Tus datos se están sincronizando automáticamente con la nube.
                            </p>
                            {currentStatus.lastSyncTime && (
                                <p className="text-xs text-green-600 mt-2">
                                    Última sincronización: {new Date(currentStatus.lastSyncTime).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Instrucciones */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">¿Cómo obtener la configuración de Firebase?</h4>
                        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                            <li>Ve a <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                            <li>Crea un nuevo proyecto o selecciona uno existente</li>
                            <li>Ve a "Configuración del proyecto" (ícono de engranaje)</li>
                            <li>En "Tus aplicaciones", haz clic en el ícono web (&lt;/&gt;)</li>
                            <li>Copia la configuración y pégala aquí</li>
                            <li>Habilita Firestore Database en el menú lateral</li>
                        </ol>
                    </div>

                    {/* ID de Usuario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID de Usuario *
                        </label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="tu-email@ejemplo.com o un-id-unico"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este ID identifica tus datos en la nube. Usa el mismo ID en todos tus dispositivos para sincronizar.
                        </p>
                    </div>

                    {/* Configuración de Firebase */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Configuración de Firebase</h4>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
                            <input
                                type="text"
                                value={config.apiKey}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                placeholder="AIza..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Auth Domain</label>
                            <input
                                type="text"
                                value={config.authDomain}
                                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                                placeholder="tu-proyecto.firebaseapp.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project ID *</label>
                            <input
                                type="text"
                                value={config.projectId}
                                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                                placeholder="tu-proyecto-id"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Storage Bucket</label>
                            <input
                                type="text"
                                value={config.storageBucket}
                                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                                placeholder="tu-proyecto.appspot.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Messaging Sender ID</label>
                            <input
                                type="text"
                                value={config.messagingSenderId}
                                onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                                placeholder="123456789"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
                            <input
                                type="text"
                                value={config.appId}
                                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                                placeholder="1:123456789:web:abc123"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Mensaje de estado */}
                    {status && (
                        <div className={`p-4 rounded-lg flex items-start gap-2 ${
                            status.type === 'success' ? 'bg-green-50 border border-green-200' :
                            status.type === 'error' ? 'bg-red-50 border border-red-200' :
                            'bg-blue-50 border border-blue-200'
                        }`}>
                            {status.type === 'success' ? (
                                <CheckCircle className="text-green-600 mt-0.5" size={20} />
                            ) : status.type === 'error' ? (
                                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                            ) : (
                                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                            )}
                            <p className={`text-sm ${
                                status.type === 'success' ? 'text-green-700' :
                                status.type === 'error' ? 'text-red-700' :
                                'text-blue-700'
                            }`}>
                                {status.message}
                            </p>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                        {isConnected ? (
                            <>
                                <button
                                    onClick={handleForceSync}
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="animate-spin" size={18} />
                                    ) : (
                                        <RefreshCw size={18} />
                                    )}
                                    <span>Sincronizar Ahora</span>
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                                >
                                    Desconectar
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar y Activar Sincronización'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirebaseConfigModal;

