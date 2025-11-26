// Servicio de sincronización con Firebase Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Configuración de Firebase
// Se puede configurar desde localStorage o desde aquí directamente
const getFirebaseConfig = () => {
  // Intentar cargar desde localStorage primero
  try {
    const savedConfig = localStorage.getItem('firebase-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.apiKey && config.projectId) {
        return {
          apiKey: config.apiKey,
          authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
          projectId: config.projectId,
          storageBucket: config.storageBucket || `${config.projectId}.appspot.com`,
          messagingSenderId: config.messagingSenderId || '',
          appId: config.appId || ''
        };
      }
    }
  } catch (error) {
    console.warn('Error al cargar configuración de Firebase desde localStorage:', error);
  }

  // Configuración por defecto (debes reemplazar con tus credenciales)
  return {
    apiKey: "AIzaSyDTwwSsTo169ExWOAZAJ4Thd8rC_887kGo",
    authDomain: "mi-bodeguita-624e2.firebaseapp.com",
    projectId: "mi-bodeguita-624e2",
    storageBucket: "mi-bodeguita-624e2.firebasestorage.app",
    messagingSenderId: "840086476676",
    appId: "1:840086476676:web:2923216f279f2e58adafd1"
  };
};

const firebaseConfig = getFirebaseConfig();

// Inicializar Firebase
let app = null;
let db = null;
let auth = null;

const initializeFirebase = async () => {
  try {
    const config = getFirebaseConfig();
    if (!config.apiKey || !config.projectId || config.apiKey === "TU_API_KEY") {
      return false;
    }
    
    // Si ya está inicializado, no reinicializar
    if (app) {
      return true;
    }
    
    app = initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Intentar autenticación anónima (ayuda con las reglas)
    try {
      await signInAnonymously(auth);
      console.log('✅ Autenticación anónima exitosa');
    } catch (authError) {
      console.warn('⚠️ No se pudo autenticar anónimamente:', authError.message);
      // Continuar de todas formas, las reglas pueden permitir acceso sin auth
    }
    
    return true;
  } catch (error) {
    console.warn('Error al inicializar Firebase:', error.message);
    return false;
  }
};

// Inicializar al cargar
initializeFirebase();

// Función para reinicializar (útil cuando se actualiza la configuración)
export const reinitializeFirebase = async () => {
  app = null;
  db = null;
  auth = null;
  return await initializeFirebase();
};

// ID único para este dispositivo/usuario
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device-id');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device-id', deviceId);
  }
  return deviceId;
};

export const firebaseService = {
  isConfigured: () => {
    const config = getFirebaseConfig();
    if (config.apiKey === "TU_API_KEY" || !config.apiKey || !config.projectId) {
      return false;
    }
    // Intentar inicializar si no está inicializado
    if (!db) {
      return initializeFirebase();
    }
    return !!db;
  },

  // Guardar datos en Firebase
  saveToCloud: async (data) => {
    if (!this.isConfigured()) {
      return false;
    }

    if (!db) {
      console.warn('Firebase no inicializado');
      return false;
    }

    try {
      const deviceId = getDeviceId();
      const dataRef = doc(db, 'bodeguitas', deviceId);
      
      // Preparar datos para guardar (sin funciones)
      const dataToSave = {
        products: data.products || [],
        sales: data.sales || [],
        customers: data.customers || [],
        suppliers: data.suppliers || [],
        coupons: data.coupons || [],
        combos: data.combos || [],
        cashRegisters: data.cashRegisters || [],
        returns: data.returns || [],
        stockTransfers: data.stockTransfers || [],
        settings: data.settings || {},
        exchangeRate: data.exchangeRate || 36.5,
        exchangeRateLastUpdate: data.exchangeRateLastUpdate || null,
        saleCounter: data.saleCounter || 1,
        favoriteProducts: data.favoriteProducts || [],
        lastSync: new Date().toISOString(),
        deviceId: deviceId
      };
      
      await setDoc(dataRef, dataToSave, { merge: true });

      return true;
    } catch (error) {
      console.error('❌ Error al guardar en Firebase:', error);
      return false;
    }
  },

  // Cargar datos desde Firebase
  loadFromCloud: async () => {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const deviceId = getDeviceId();
      const dataRef = doc(db, 'bodeguitas', deviceId);
      const docSnap = await getDoc(dataRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Eliminar metadatos de Firebase
        const { lastSync, deviceId, ...cleanData } = data;
        return cleanData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error al cargar desde Firebase:', error);
      return null;
    }
  },

  // Escuchar cambios en tiempo real
  subscribeToChanges: (callback) => {
    if (!this.isConfigured()) {
      return () => {}; // Retorna función de limpieza vacía
    }

    try {
      const deviceId = getDeviceId();
      const dataRef = doc(db, 'bodeguitas', deviceId);
      
      const unsubscribe = onSnapshot(dataRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          delete data.lastSync;
          delete data.deviceId;
          callback(data);
        }
      }, (error) => {
        console.error('Error en suscripción de Firebase:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error al suscribirse a cambios:', error);
      return () => {};
    }
  },

  // Verificar estado de conexión
  checkConnection: async () => {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      // Intentar una operación simple
      const deviceId = getDeviceId();
      const dataRef = doc(db, 'bodeguitas', deviceId);
      await getDoc(dataRef);
      return true;
    } catch (error) {
      return false;
    }
  }
};

