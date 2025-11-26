import { useEffect, useRef } from 'react';
import { syncService } from '../services/syncService';
import { useStore } from '../store/useStore';

// Hook para sincronización automática
export const useAutoSync = () => {
    const exportData = useStore((state) => state.exportData);
    const importData = useStore((state) => state.importData);
    const syncTimeoutRef = useRef(null);
    const isInitializedRef = useRef(false);
    const lastSyncRef = useRef(null);

    useEffect(() => {
        // Inicializar sincronización si está configurada
        const initializeSync = async () => {
            const savedConfig = localStorage.getItem('firebase-config');
            const savedUserId = localStorage.getItem('firebase-user-id');

            if (savedConfig && savedUserId && !isInitializedRef.current) {
                try {
                    const config = JSON.parse(savedConfig);
                    const initialized = await syncService.initialize(config);
                    
                    if (initialized) {
                        await syncService.enableSync(savedUserId, (cloudData) => {
                            // Cuando hay cambios en la nube, actualizar local
                            if (cloudData && Object.keys(cloudData).length > 0) {
                                importData(cloudData);
                            }
                        });
                        isInitializedRef.current = true;
                    }
                } catch (error) {
                    console.error('Error inicializando sincronización:', error);
                }
            }
        };

        initializeSync();

        // Función para sincronizar datos
        const syncData = async () => {
            const status = syncService.getStatus();
            if (status.syncEnabled && !status.isSyncing) {
                const data = exportData();
                await syncService.uploadToCloud(data);
                lastSyncRef.current = Date.now();
            }
        };

        // Interceptar cambios en localStorage (donde Zustand guarda los datos)
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.apply(this, arguments);
            
            // Si es nuestro store y la sincronización está activa
            if (key === 'bodeguita-storage') {
                if (syncTimeoutRef.current) {
                    clearTimeout(syncTimeoutRef.current);
                }

                syncTimeoutRef.current = setTimeout(() => {
                    syncData();
                }, 2000); // Esperar 2 segundos después del último cambio
            }
        };

        // Sincronizar periódicamente (cada 30 segundos)
        const periodicSync = setInterval(() => {
            syncData();
        }, 30000);

        // Sincronizar al cargar la página
        setTimeout(() => {
            syncData();
        }, 5000);

        return () => {
            clearInterval(periodicSync);
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            // Restaurar localStorage.setItem original
            localStorage.setItem = originalSetItem;
        };
    }, [exportData, importData]);
};

