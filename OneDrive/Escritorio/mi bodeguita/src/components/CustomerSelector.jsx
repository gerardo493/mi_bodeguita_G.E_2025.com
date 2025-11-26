import React, { useState } from 'react';
import { X, Plus, Search, User } from 'lucide-react';
import { useStore } from '../store/useStore';

const CustomerSelector = ({ onClose }) => {
    const customers = useStore((state) => state.customers);
    const selectedCustomer = useStore((state) => state.selectedCustomer);
    const setSelectedCustomer = useStore((state) => state.setSelectedCustomer);
    const addCustomer = useStore((state) => state.addCustomer);

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        onClose();
    };

    const handleAddCustomer = (e) => {
        e.preventDefault();
        if (newCustomer.name.trim()) {
            addCustomer(newCustomer);
            setSelectedCustomer({ ...newCustomer, id: customers.length + 1 });
            setNewCustomer({ name: '', phone: '', email: '', address: '' });
            setIsAddingNew(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Seleccionar Cliente</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {!isAddingNew ? (
                        <>
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="w-full mb-4 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                            >
                                <Plus size={20} />
                                <span>Nuevo Cliente</span>
                            </button>

                            {filteredCustomers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <User size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No se encontraron clientes</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredCustomers.map((customer) => (
                                        <button
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                selectedCustomer?.id === customer.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="font-medium text-gray-800">{customer.name}</div>
                                            {customer.phone && (
                                                <div className="text-sm text-gray-500">Tel: {customer.phone}</div>
                                            )}
                                            {customer.email && (
                                                <div className="text-sm text-gray-500">Email: {customer.email}</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleAddCustomer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newCustomer.phone}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingNew(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Agregar
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {selectedCustomer && (
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => {
                                setSelectedCustomer(null);
                                onClose();
                            }}
                            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                            Quitar Cliente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerSelector;

