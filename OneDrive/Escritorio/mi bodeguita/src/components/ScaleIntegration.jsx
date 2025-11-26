import React, { useState, useEffect } from 'react';
import { Scale, X, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

const ScaleIntegration = ({ onClose, onWeightReceived }) => {
    const settings = useStore((state) => state.settings);
    const [weight, setWeight] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Simulación de conexión con balanza
        // En producción, esto se conectaría a un puerto serial o USB
        if (settings.scaleIntegration && settings.scalePort) {
            // Simular lectura de peso cada 2 segundos
            const interval = setInterval(() => {
                // Simular peso aleatorio entre 0.1 y 5.0 kg
                const simulatedWeight = (Math.random() * 4.9 + 0.1).toFixed(3);
                setWeight(parseFloat(simulatedWeight));
                setIsConnected(true);
            }, 2000);

            return () => clearInterval(interval);
        } else {
            setIsConnected(false);
            setError('Balanza no configurada. Configure el puerto en Configuración.');
        }
    }, [settings.scaleIntegration, settings.scalePort]);

    const handleUseWeight = () => {
        if (weight > 0 && onWeightReceived) {
            onWeightReceived(weight);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Scale size={20} />
                        Lectura de Balanza
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="text-center mb-6">
                        <div className="bg-gray-50 p-8 rounded-lg mb-4">
                            {isConnected ? (
                                <>
                                    <div className="text-5xl font-bold text-gray-900 mb-2">
                                        {weight.toFixed(3)}
                                    </div>
                                    <div className="text-sm text-gray-500">kg</div>
                                    <div className="mt-2 flex items-center justify-center gap-2 text-green-600">
                                        <CheckCircle size={16} />
                                        <span className="text-xs">Conectado</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-400">
                                    <Scale size={48} className="mx-auto mb-2" />
                                    <p>Esperando conexión...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Estado de la Balanza</p>
                            <p className="text-sm font-medium">
                                {isConnected ? 'Conectada' : 'Desconectada'}
                            </p>
                            {settings.scalePort && (
                                <p className="text-xs text-gray-500 mt-1">Puerto: {settings.scalePort}</p>
                            )}
                        </div>

                        {isConnected && weight > 0 && (
                            <button
                                onClick={handleUseWeight}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                            >
                                Usar Peso: {weight.toFixed(3)} kg
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScaleIntegration;

