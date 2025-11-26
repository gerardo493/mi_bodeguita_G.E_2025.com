import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

const NotificationCenter = () => {
    const notifications = useStore((state) => state.notifications);
    const markNotificationAsRead = useStore((state) => state.markNotificationAsRead);
    const removeNotification = useStore((state) => state.removeNotification);
    const clearNotifications = useStore((state) => state.clearNotifications);
    const products = useStore((state) => state.products);
    const addNotification = useStore((state) => state.addNotification);
    const settings = useStore((state) => state.settings);

    const [visibleNotifications, setVisibleNotifications] = useState(new Set());
    const [fadingNotifications, setFadingNotifications] = useState(new Set());
    const timersRef = useRef(new Map());

    const unreadCount = notifications.filter(n => !n.read).length;

    // Manejar desvanecimiento automático de notificaciones
    useEffect(() => {
        notifications.forEach(notification => {
            // Si la notificación no tiene timer asignado, crear uno
            if (!timersRef.current.has(notification.id)) {
                // Marcar como visible
                setVisibleNotifications(prev => new Set(prev).add(notification.id));
                
                // Programar desvanecimiento después de 5 segundos
                const fadeTimer = setTimeout(() => {
                    setFadingNotifications(prev => new Set(prev).add(notification.id));
                }, 5000);

                // Programar eliminación después de 5.5 segundos (después de la animación)
                const removeTimer = setTimeout(() => {
                    removeNotification(notification.id);
                    setVisibleNotifications(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(notification.id);
                        return newSet;
                    });
                    setFadingNotifications(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(notification.id);
                        return newSet;
                    });
                    timersRef.current.delete(notification.id);
                }, 5500);

                timersRef.current.set(notification.id, { fadeTimer, removeTimer });
            }
        });

        // Limpiar timers de notificaciones que ya no existen
        const currentNotificationIds = new Set(notifications.map(n => n.id));
        timersRef.current.forEach((timers, id) => {
            if (!currentNotificationIds.has(id)) {
                clearTimeout(timers.fadeTimer);
                clearTimeout(timers.removeTimer);
                timersRef.current.delete(id);
            }
        });
    }, [notifications, removeNotification]);

    // Verificar stock bajo y crear notificaciones
    useEffect(() => {
        products.forEach(product => {
            // Verificar stock bajo
            if (product.stock <= settings.lowStockThreshold && product.stock > 0) {
                const existingNotification = notifications.find(
                    n => n.type === 'low_stock' && n.productId === product.id && !n.read
                );
                
                if (!existingNotification) {
                    addNotification({
                        type: 'low_stock',
                        title: 'Stock Bajo',
                        message: `${product.name} tiene solo ${product.stock} unidades disponibles`,
                        productId: product.id,
                        severity: 'warning'
                    });
                }
            } else if (product.stock === 0) {
                const existingNotification = notifications.find(
                    n => n.type === 'out_of_stock' && n.productId === product.id && !n.read
                );
                
                if (!existingNotification) {
                    addNotification({
                        type: 'out_of_stock',
                        title: 'Sin Stock',
                        message: `${product.name} está agotado`,
                        productId: product.id,
                        severity: 'error'
                    });
                }
            }

            // Verificar productos próximos a vencer
            if (product.expirationDate) {
                const expirationDate = new Date(product.expirationDate);
                const daysUntilExpiration = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiration <= 7 && daysUntilExpiration > 0) {
                    const existingNotification = notifications.find(
                        n => n.type === 'expiring_soon' && n.productId === product.id && !n.read
                    );
                    
                    if (!existingNotification) {
                        addNotification({
                            type: 'expiring_soon',
                            title: 'Producto Próximo a Vencer',
                            message: `${product.name} vence en ${daysUntilExpiration} día(s)`,
                            productId: product.id,
                            severity: 'warning'
                        });
                    }
                } else if (daysUntilExpiration <= 0) {
                    const existingNotification = notifications.find(
                        n => n.type === 'expired' && n.productId === product.id && !n.read
                    );
                    
                    if (!existingNotification) {
                        addNotification({
                            type: 'expired',
                            title: 'Producto Vencido',
                            message: `${product.name} está vencido`,
                            productId: product.id,
                            severity: 'error'
                        });
                    }
                }
            }
        });
    }, [products, settings.lowStockThreshold, notifications, addNotification]);

    const getIcon = (severity) => {
        switch (severity) {
            case 'error':
                return <AlertTriangle className="text-red-600" size={20} />;
            case 'warning':
                return <AlertTriangle className="text-yellow-600" size={20} />;
            case 'success':
                return <CheckCircle className="text-green-600" size={20} />;
            default:
                return <Info className="text-blue-600" size={20} />;
        }
    };

    const getBgColor = (severity) => {
        switch (severity) {
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'success':
                return 'bg-green-50 border-green-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full space-y-2">
            {notifications.slice(0, 5).map((notification) => {
                const isFading = fadingNotifications.has(notification.id);
                const isVisible = visibleNotifications.has(notification.id);
                
                if (!isVisible) return null;

                return (
                    <div
                        key={notification.id}
                        className={`${getBgColor(notification.severity)} border rounded-lg p-4 shadow-lg flex items-start gap-3 transition-all duration-500 ${
                            isFading ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
                        } ${notification.read ? 'opacity-60' : ''}`}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon(notification.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.date).toLocaleTimeString()}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                markNotificationAsRead(notification.id);
                                setFadingNotifications(prev => new Set(prev).add(notification.id));
                                setTimeout(() => {
                                    removeNotification(notification.id);
                                    setVisibleNotifications(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(notification.id);
                                        return newSet;
                                    });
                                    setFadingNotifications(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(notification.id);
                                        return newSet;
                                    });
                                }, 500);
                            }}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
            
            {notifications.length > 5 && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600">
                        {notifications.length - 5} notificaciones más
                    </p>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;

