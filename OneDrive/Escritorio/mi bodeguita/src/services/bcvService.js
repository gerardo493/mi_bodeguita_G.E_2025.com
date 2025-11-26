/**
 * Servicio para obtener la tasa de cambio del BCV (Banco Central de Venezuela)
 * Utiliza múltiples fuentes como respaldo
 */

const BCV_API_ENDPOINTS = [
    // API principal - BCV API
    'https://bcvapi.tech/api/v1/tasa',
    // API alternativa - BCV Exchange Rate
    'https://api.bcv.org.ve/api/exchange',
    // API alternativa - Pydolar Venezuela (si está disponible)
    'https://pydolarve.org/api/v1/dollar',
];

/**
 * Obtiene la tasa de cambio del BCV desde la API
 * @returns {Promise<number>} Tasa de cambio en Bs/$
 */
export const getBCVExchangeRate = async () => {
    // Intentar con la primera API (bcvapi.tech) - Formato común
    try {
        const response = await fetch('https://bcvapi.tech/api/v1/tasa', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            
            // Diferentes formatos posibles de respuesta
            let rate = null;
            
            // Formato 1: { tasa: "36,50" } o { rate: 36.50 }
            if (data.tasa) {
                rate = typeof data.tasa === 'string' 
                    ? parseFloat(data.tasa.replace(',', '.'))
                    : parseFloat(data.tasa);
            }
            
            // Formato 2: { rate: 36.50 }
            if (!rate && data.rate) {
                rate = parseFloat(data.rate);
            }
            
            // Formato 3: { usd: 36.50 }
            if (!rate && data.usd) {
                rate = parseFloat(data.usd);
            }
            
            // Formato 4: { data: { usd: 36.50 } }
            if (!rate && data.data) {
                if (data.data.usd) rate = parseFloat(data.data.usd);
                if (!rate && data.data.tasa) {
                    rate = typeof data.data.tasa === 'string'
                        ? parseFloat(data.data.tasa.replace(',', '.'))
                        : parseFloat(data.data.tasa);
                }
            }
            
            // Formato 5: { result: { tasa: "36,50" } }
            if (!rate && data.result) {
                if (data.result.tasa) {
                    rate = typeof data.result.tasa === 'string'
                        ? parseFloat(data.result.tasa.replace(',', '.'))
                        : parseFloat(data.result.tasa);
                }
            }
            
            if (rate && rate > 0 && rate < 1000000) { // Validación razonable
                return rate;
            }
        }
    } catch (error) {
        console.warn('Error al obtener tasa de BCV API (bcvapi.tech):', error);
    }

    // Intentar con API alternativa - exchangerate.host (VES)
    try {
        const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=VES', {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            if (data.rates && data.rates.VES) {
                const rate = parseFloat(data.rates.VES);
                if (rate > 0 && rate < 1000000) {
                    return rate;
                }
            }
        }
    } catch (error) {
        console.warn('Error al obtener tasa de exchangerate.host:', error);
    }

    // Intentar con API alternativa - exchangerate-api.com
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            if (data.rates && data.rates.VES) {
                const rate = parseFloat(data.rates.VES);
                if (rate > 0 && rate < 1000000) {
                    return rate;
                }
            }
        }
    } catch (error) {
        console.warn('Error al obtener tasa de exchangerate-api.com:', error);
    }

    // Si todas las APIs fallan, retornar null
    return null;
};

/**
 * Obtiene la tasa de cambio con información adicional
 * @returns {Promise<{rate: number, date: string, source: string}>}
 */
export const getBCVExchangeRateWithInfo = async () => {
    const rate = await getBCVExchangeRate();
    
    if (rate) {
        return {
            rate,
            date: new Date().toISOString(),
            source: 'BCV API'
        };
    }

    return null;
};

