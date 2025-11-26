// Servicio de sincronización con Firebase Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

class SyncService {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.syncEnabled = false;
        this.userId = null;
        this.unsubscribe = null;
        this.isSyncing = false;
        this.lastSyncTime = null;
    }

    // Inicializar Firebase
    async initialize(firebaseConfig) {
        try {
            if (!firebaseConfig || !firebaseConfig.apiKey) {
                console.warn('Firebase no configurado. La sincronización estará deshabilitada.');
                return false;
            }

            const app = initializeApp(firebaseConfig);
            this.db = getFirestore(app);
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Error inicializando Firebase:', error);
            return false;
        }
    }

    // Configurar usuario (puede ser un ID único o email)
    setUserId(userId) {
        this.userId = userId || 'default-user';
    }

    // Habilitar sincronización
    async enableSync(userId, onDataChange) {
        if (!this.isInitialized || !this.db) {
            throw new Error('Firebase no está inicializado. Configura Firebase primero.');
        }

        this.setUserId(userId);
        this.syncEnabled = true;

        // Escuchar cambios en la nube
        const userDocRef = doc(this.db, 'users', this.userId);
        
        this.unsubscribe = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists() && !this.isSyncing) {
                const cloudData = snapshot.data();
                if (cloudData && cloudData.lastModified) {
                    // Solo actualizar si los datos de la nube son más recientes
                    if (!this.lastSyncTime || cloudData.lastModified > this.lastSyncTime) {
                        this.isSyncing = true;
                        onDataChange(cloudData.data || {});
                        this.lastSyncTime = cloudData.lastModified;
                        this.isSyncing = false;
                    }
                }
            }
        }, (error) => {
            console.error('Error en sincronización:', error);
        });

        return true;
    }

    // Deshabilitar sincronización
    disableSync() {
        this.syncEnabled = false;
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    // Subir datos a la nube
    async uploadToCloud(data) {
        if (!this.isInitialized || !this.db || !this.syncEnabled || !this.userId) {
            return false;
        }

        try {
            this.isSyncing = true;
            const userDocRef = doc(this.db, 'users', this.userId);
            
            await setDoc(userDocRef, {
                data: data,
                lastModified: serverTimestamp(),
                userId: this.userId,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            this.lastSyncTime = Date.now();
            this.isSyncing = false;
            return true;
        } catch (error) {
            console.error('Error subiendo a la nube:', error);
            this.isSyncing = false;
            return false;
        }
    }

    // Descargar datos de la nube
    async downloadFromCloud() {
        if (!this.isInitialized || !this.db || !this.userId) {
            return null;
        }

        try {
            const userDocRef = doc(this.db, 'users', this.userId);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                this.lastSyncTime = data.lastModified?.toMillis() || Date.now();
                return data.data || {};
            }
            return null;
        } catch (error) {
            console.error('Error descargando de la nube:', error);
            return null;
        }
    }

    // Sincronización manual (forzar)
    async forceSync(data) {
        return await this.uploadToCloud(data);
    }

    // Obtener estado de sincronización
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            syncEnabled: this.syncEnabled,
            isSyncing: this.isSyncing,
            lastSyncTime: this.lastSyncTime,
            userId: this.userId
        };
    }
}

export const syncService = new SyncService();

