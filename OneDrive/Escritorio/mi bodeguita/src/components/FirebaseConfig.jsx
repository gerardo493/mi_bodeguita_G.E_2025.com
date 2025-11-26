import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { reinitializeFirebase } from '../services/firebaseService';

const FirebaseConfig = ({ onClose }) => {
    const [config, setConfig] = useState({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Cargar configuración existente al abrir
    useEffect(() => {
        try {
            const savedConfig = localStorage.getItem('firebase-config');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                setConfig(parsed);
            }
        } catch (err) {
            console.warn('Error al cargar configuración:', err);
        }
    }, []);

    const handleSave = () => {
        // Validar que todos los campos estén llenos
        if (!config.apiKey || !config.projectId) {
            setError('Por favor, completa al menos API Key y Project ID');
            return;
        }

        // Guardar en localStorage (temporal, en producción usar variables de entorno)
        try {
            localStorage.setItem('firebase-config', JSON.stringify(config));
            
            // Reinicializar Firebase con la nueva configuración
            const reinitialized = reinitializeFirebase();
            if (reinitialized) {
                setSuccess(true);
                setError('');
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                    window.location.reload(); // Recargar para aplicar cambios
                }, 2000);
            } else {
                setError('Error al inicializar Firebase. Verifica las credenciales.');
            }
        } catch (err) {
            setError('Error al guardar la configuración: ' + err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Configurar Firebase</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">📋 Instrucciones:</h4>
                        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                            <li>Ve a <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                            <li>Crea un proyecto o selecciona uno existente</li>
                            <li>Habilita Firestore Database</li>
                            <li>Ve a Configuración del proyecto → Tus aplicaciones</li>
                            <li>Haz clic en el ícono Web (&lt;/&gt;)</li>
                            <li>Copia las credenciales y pégalas abajo</li>
                        </ol>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                            <AlertCircle size={18} className="text-red-600" />
                            <span className="text-sm text-red-700">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-600" />
                            <span className="text-sm text-green-700">Configuración guardada. Recargando...</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={config.apiKey}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                placeholder="AIzaSy..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Auth Domain</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={config.authDomain}
                                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                                placeholder="tu-proyecto.firebaseapp.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project ID *</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={config.projectId}
                                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                                placeholder="tu-proyecto-id"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Storage Bucket</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={config.storageBucket}
                                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                                placeholder="tu-proyecto.appspot.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Messaging Sender ID</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={config.messagingSenderId}
                                onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                                placeholder="123456789"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={config.appId}
                                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                                placeholder="1:123456789:web:abc123"
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-700">
                            ⚠️ <strong>Importante:</strong> Después de guardar, asegúrate de configurar las reglas de Firestore para permitir lectura/escritura. 
                            Ve a Firestore Database → Reglas y usa: <code className="bg-yellow-100 px-1 rounded">allow read, write: if true;</code>
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-2">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        Guardar Configuración
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirebaseConfig;

