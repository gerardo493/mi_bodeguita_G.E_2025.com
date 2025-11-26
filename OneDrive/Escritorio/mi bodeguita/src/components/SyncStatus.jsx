import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { firebaseService } from '../services/firebaseService';

const SyncStatus = () => {
    const syncStatus = useStore((state) => state.syncStatus);
    const syncToCloud = useStore((state) => state.syncToCloud);
    const loadFromCloud = useStore((state) => state.loadFromCloud);
    const updateConnectionStatus = useStore((state) => state.updateConnectionStatus);
    
    const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Verificar si Firebase está configurado
        const configured = firebaseService.isConfigured();
        setIsFirebaseConfigured(configured);

        // Actualizar estado de conexión
        updateConnectionStatus();

        // Escuchar cambios en la conexión
        const handleOnline = () => {
            updateConnectionStatus();
            if (configured) {
                setTimeout(() => syncToCloud(), 1000);
            }
        };
        const handleOffline = () => {
            updateConnectionStatus();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cargar datos desde Firebase al iniciar (si está configurado)
        if (configured) {
            setTimeout(() => loadFromCloud(), 2000);
        }

        // Sincronizar automáticamente cada 5 minutos
        const syncInterval = setInterval(() => {
            if (configured && navigator.onLine) {
                syncToCloud();
            }
        }, 5 * 60 * 1000); // 5 minutos

        // Suscribirse a cambios en tiempo real
        let unsubscribe = () => {};
        if (configured) {
            unsubscribe = firebaseService.subscribeToChanges((cloudData) => {
                // Solo actualizar si los datos de la nube son más recientes
                const localData = useStore.getState();
                const cloudLastSync = cloudData.lastSync;
                const localLastSync = localData.syncStatus?.lastSync;
                
                if (!localLastSync || (cloudLastSync && new Date(cloudLastSync) > new Date(localLastSync))) {
                    useStore.getState().importData(cloudData);
                }
            });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(syncInterval);
            unsubscribe();
        };
    }, []); // Solo ejecutar una vez al montar

    if (!isFirebaseConfigured) {
        return (
            <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg max-w-xs">
                <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">Firebase no configurado</span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                    Los datos solo se guardan localmente. Configura Firebase para sincronización en la nube.
                </p>
            </div>
        );
    }

    const getStatusColor = () => {
        if (syncStatus.isSyncing) return 'text-blue-600';
        if (syncStatus.lastError) return 'text-red-600';
        if (syncStatus.lastSync) return 'text-green-600';
        return 'text-gray-600';
    };

    const getStatusIcon = () => {
        if (!syncStatus.isOnline) return <WifiOff size={16} className="text-red-500" />;
        if (syncStatus.isSyncing) return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
        if (syncStatus.lastError) return <AlertCircle size={16} className="text-red-500" />;
        if (syncStatus.lastSync) return <CheckCircle size={16} className="text-green-500" />;
        return <Cloud size={16} className="text-gray-500" />;
    };

    const formatLastSync = () => {
        if (!syncStatus.lastSync) return 'Nunca';
        const date = new Date(syncStatus.lastSync);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Hace unos segundos';
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
        return date.toLocaleDateString();
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs z-50">
            <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className={`text-sm font-medium ${getStatusColor()}`}>
                        {syncStatus.isSyncing ? 'Sincronizando...' : 
                         syncStatus.lastError ? 'Error de sincronización' :
                         syncStatus.lastSync ? 'Sincronizado' : 'Sin sincronizar'}
                    </span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        syncToCloud();
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Sincronizar ahora"
                >
                    <RefreshCw size={14} className={syncStatus.isSyncing ? 'animate-spin' : ''} />
                </button>
            </div>

            {showDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                            {syncStatus.isOnline ? (
                                <span className="flex items-center gap-1">
                                    <Wifi size={12} /> En línea
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <WifiOff size={12} /> Sin conexión
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Última sync:</span>
                        <span className="text-gray-800">{formatLastSync()}</span>
                    </div>
                    {syncStatus.lastError && (
                        <div className="text-red-600 text-xs mt-1">
                            {syncStatus.lastError}
                        </div>
                    )}
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => {
                                loadFromCloud();
                                setShowDetails(false);
                            }}
                            className="flex-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                        >
                            Cargar desde nube
                        </button>
                        <button
                            onClick={() => {
                                syncToCloud();
                                setShowDetails(false);
                            }}
                            className="flex-1 px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100"
                        >
                            Subir a nube
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyncStatus;

