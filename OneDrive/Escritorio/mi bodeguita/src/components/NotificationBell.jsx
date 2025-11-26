import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const NotificationBell = () => {
    const notifications = useStore((state) => state.notifications);
    const markNotificationAsRead = useStore((state) => state.markNotificationAsRead);
    const removeNotification = useStore((state) => state.removeNotification);
    const clearNotifications = useStore((state) => state.clearNotifications);
    
    const [isOpen, setIsOpen] = useState(false);
    const [visibleNotifications, setVisibleNotifications] = useState(new Set());
    const [fadingNotifications, setFadingNotifications] = useState(new Set());
    const dropdownRef = useRef(null);
    const timersRef = useRef(new Map());

    const unreadCount = notifications.filter(n => !n.read).length;

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Manejar desvanecimiento automático de notificaciones (solo cuando el dropdown está cerrado)
    useEffect(() => {
        if (isOpen) return; // No auto-eliminar cuando está abierto

        notifications.forEach(notification => {
            if (!timersRef.current.has(notification.id)) {
                setVisibleNotifications(prev => new Set(prev).add(notification.id));
                
                const fadeTimer = setTimeout(() => {
                    setFadingNotifications(prev => new Set(prev).add(notification.id));
                }, 5000);

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

        const currentNotificationIds = new Set(notifications.map(n => n.id));
        timersRef.current.forEach((timers, id) => {
            if (!currentNotificationIds.has(id)) {
                clearTimeout(timers.fadeTimer);
                clearTimeout(timers.removeTimer);
                timersRef.current.delete(id);
            }
        });
    }, [notifications, removeNotification, isOpen]);

    const getIcon = (severity) => {
        switch (severity) {
            case 'error':
                return <AlertTriangle className="text-red-600" size={18} />;
            case 'warning':
                return <AlertTriangle className="text-yellow-600" size={18} />;
            case 'success':
                return <CheckCircle className="text-green-600" size={18} />;
            default:
                return <Info className="text-blue-600" size={18} />;
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

    const handleMarkAsRead = (id) => {
        markNotificationAsRead(id);
    };

    const handleRemove = (id) => {
        removeNotification(id);
        setVisibleNotifications(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        setFadingNotifications(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        if (timersRef.current.has(id)) {
            const timers = timersRef.current.get(id);
            clearTimeout(timers.fadeTimer);
            clearTimeout(timers.removeTimer);
            timersRef.current.delete(id);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Notificaciones"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Bell size={20} className="text-gray-600" />
                            <h3 className="font-semibold text-gray-800">
                                Notificaciones
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        ({unreadCount} sin leer)
                                    </span>
                                )}
                            </h3>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={() => {
                                    if (window.confirm('¿Eliminar todas las notificaciones?')) {
                                        clearNotifications();
                                    }
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                                Limpiar todas
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm">No hay notificaciones</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => {
                                    const isFading = fadingNotifications.has(notification.id);
                                    
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 transition-all duration-300 ${
                                                isFading ? 'opacity-0' : 'opacity-100'
                                            } ${notification.read ? 'bg-gray-50' : 'bg-white'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getIcon(notification.severity)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                                                {notification.title}
                                                                {!notification.read && (
                                                                    <span className="ml-2 inline-block h-2 w-2 bg-blue-600 rounded-full"></span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(notification.date).toLocaleString('es-VE', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                                    title="Marcar como leída"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleRemove(notification.id)}
                                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    notifications.forEach(n => {
                                        if (!n.read) {
                                            markNotificationAsRead(n.id);
                                        }
                                    });
                                }}
                                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Marcar todas como leídas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

