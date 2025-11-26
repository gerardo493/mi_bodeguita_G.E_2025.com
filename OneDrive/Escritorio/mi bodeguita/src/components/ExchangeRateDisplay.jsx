import React, { useState, useEffect } from 'react';
import { RefreshCw, DollarSign, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getBCVExchangeRate } from '../services/bcvService';

const ExchangeRateDisplay = () => {
    const exchangeRate = useStore((state) => state.exchangeRate);
    const setExchangeRate = useStore((state) => state.setExchangeRate);
    const lastUpdate = useStore((state) => state.exchangeRateLastUpdate);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const updateExchangeRate = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const rate = await getBCVExchangeRate();
            
            if (rate && rate > 0) {
                setExchangeRate(rate);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            } else {
                throw new Error('No se pudo obtener una tasa válida');
            }
        } catch (err) {
            setError('Error al obtener la tasa del BCV. Verifica tu conexión.');
            console.error('Error al actualizar tasa:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar automáticamente al cargar
    useEffect(() => {
        // Solo actualizar si no hay una actualización reciente (últimos 5 minutos)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (!lastUpdate || lastUpdate < fiveMinutesAgo) {
            updateExchangeRate();
        }
    }, []);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <DollarSign size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-600 font-medium">Tasa BCV</div>
                        <div className="text-lg font-bold text-blue-700">
                            {exchangeRate.toFixed(2)} Bs/$
                        </div>
                        {lastUpdate && (
                            <div className="text-xs text-gray-500">
                                Actualizado: {new Date(lastUpdate).toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={updateExchangeRate}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        isLoading
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : success
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    title="Actualizar tasa del BCV"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    <span className="text-sm font-medium">
                        {isLoading ? 'Actualizando...' : 'Actualizar'}
                    </span>
                </button>
            </div>
            {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                    ✓ Tasa actualizada correctamente
                </div>
            )}
        </div>
    );
};

export default ExchangeRateDisplay;

