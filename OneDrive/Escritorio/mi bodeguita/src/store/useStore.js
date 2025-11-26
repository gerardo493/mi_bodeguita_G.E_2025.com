import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
    persist(
        (set, get) => ({
            // Inventario
            products: [],
            addProduct: (product) => {
                const exchangeRate = get().exchangeRate;
                const newProduct = {
                    ...product,
                    id: crypto.randomUUID(),
                    sku: product.sku || `SKU-${Date.now()}`,
                    barcode: product.barcode || null,
                    priceBS: product.priceBS || (product.priceUSD ? product.priceUSD * exchangeRate : 0),
                    purchasePriceUSD: product.purchasePriceUSD || 0,
                    purchasePriceBS: product.purchasePriceBS || 0,
                    image: product.image || null,
                    expirationDate: product.expirationDate || null,
                    supplierId: product.supplierId || null,
                    priceHistory: [],
                    stockMovements: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                set((state) => ({ products: [...state.products, newProduct] }));
                
                // Registrar movimiento de stock inicial
                if (product.stock > 0) {
                    get().addStockMovement(newProduct.id, product.stock, 'initial', 'Stock inicial');
                }
            },
            updateProduct: (id, updatedProduct) => {
                const exchangeRate = get().exchangeRate;
                const state = get();
                const product = state.products.find(p => p.id === id);
                
                // Guardar historial de cambios de precio
                const priceHistory = product?.priceHistory || [];
                if (updatedProduct.priceUSD && product?.priceUSD !== updatedProduct.priceUSD) {
                    priceHistory.push({
                        priceUSD: product?.priceUSD,
                        priceBS: product?.priceBS,
                        date: new Date().toISOString()
                    });
                }

                set((state) => ({
                    products: state.products.map((p) => {
                        if (p.id === id) {
                            return {
                                ...p,
                                ...updatedProduct,
                                priceBS: updatedProduct.priceBS || (updatedProduct.priceUSD ? updatedProduct.priceUSD * exchangeRate : p.priceBS),
                                priceHistory: priceHistory.length > 0 ? priceHistory : p.priceHistory,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return p;
                    })
                }));
            },
            deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
            duplicateProduct: (product) => {
                const exchangeRate = get().exchangeRate;
                const newProduct = {
                    ...product,
                    id: crypto.randomUUID(),
                    sku: product.sku || `SKU-${Date.now()}`,
                    barcode: null, // No duplicar código de barras
                    priceBS: product.priceBS || (product.priceUSD ? product.priceUSD * exchangeRate : 0),
                    priceHistory: [],
                    stockMovements: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                set((state) => ({ products: [...state.products, newProduct] }));
            },
            
            // Descontar stock al vender
            decreaseStock: (productId, quantity, reason = 'sale', notes = '') => {
                set((state) => ({
                    products: state.products.map((p) => 
                        p.id === productId 
                            ? { ...p, stock: Math.max(0, p.stock - quantity) }
                            : p
                    )
                }));
                get().addStockMovement(productId, -quantity, reason, notes);
            },
            
            // Aumentar stock
            increaseStock: (productId, quantity, reason = 'purchase', notes = '') => {
                set((state) => ({
                    products: state.products.map((p) => 
                        p.id === productId 
                            ? { ...p, stock: (p.stock || 0) + quantity }
                            : p
                    )
                }));
                get().addStockMovement(productId, quantity, reason, notes);
            },

            // Historial de movimientos de stock
            addStockMovement: (productId, quantity, type, notes = '') => {
                const movement = {
                    id: crypto.randomUUID(),
                    productId,
                    quantity,
                    type, // 'sale', 'purchase', 'return', 'adjustment', 'transfer', 'initial'
                    notes,
                    date: new Date().toISOString(),
                    userId: get().currentUser?.id || 'system'
                };
                
                set((state) => ({
                    products: state.products.map((p) => {
                        if (p.id === productId) {
                            return {
                                ...p,
                                stockMovements: [...(p.stockMovements || []), movement]
                            };
                        }
                        return p;
                    })
                }));
            },

            // Carrito
            cart: [],
            addToCart: (product, customPrice = null) => {
                const state = get();
                if (product.stock <= 0) return;
                
                const existing = state.cart.find((p) => p.id === product.id);
                const priceToUse = customPrice !== null ? customPrice : product.priceUSD;
                
                if (existing) {
                    if (existing.quantity + 1 > product.stock) return;
                    set({
                        cart: state.cart.map((p) => 
                            p.id === product.id 
                                ? { ...p, quantity: p.quantity + 1, priceUSD: priceToUse, priceBS: priceToUse * state.exchangeRate }
                                : p
                        )
                    });
                } else {
                    set({ 
                        cart: [...state.cart, { 
                            ...product, 
                            quantity: 1, 
                            priceUSD: priceToUse,
                            priceBS: priceToUse * state.exchangeRate,
                            notes: ''
                        }] 
                    });
                }
            },
            removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((p) => p.id !== id) })),
            updateCartQuantity: (id, quantity) => {
                const state = get();
                const product = state.products.find(p => p.id === id);
                if (product && quantity > product.stock) quantity = product.stock;
                set({
                    cart: state.cart.map((p) => p.id === id ? { ...p, quantity: Math.max(1, quantity) } : p)
                });
            },
            updateCartItemPrice: (id, newPrice) => {
                const state = get();
                set({
                    cart: state.cart.map((p) => 
                        p.id === id 
                            ? { ...p, priceUSD: newPrice, priceBS: newPrice * state.exchangeRate }
                            : p
                    )
                });
            },
            updateCartItemNotes: (id, notes) => {
                set((state) => ({
                    cart: state.cart.map((p) => p.id === id ? { ...p, notes } : p)
                }));
            },
            clearCart: () => set({ cart: [] }),

            // Ventas suspendidas
            suspendedCarts: [],
            suspendCart: (name = '') => {
                const state = get();
                const suspendedCart = {
                    id: crypto.randomUUID(),
                    name: name || `Venta ${new Date().toLocaleString()}`,
                    cart: state.cart,
                    customer: state.selectedCustomer,
                    discount: state.discount,
                    discountType: state.discountType,
                    date: new Date().toISOString()
                };
                set({
                    suspendedCarts: [...state.suspendedCarts, suspendedCart],
                    cart: [],
                    selectedCustomer: null,
                    discount: 0,
                    discountType: 'percentage'
                });
                return suspendedCart.id;
            },
            restoreCart: (suspendedCartId) => {
                const state = get();
                const suspendedCart = state.suspendedCarts.find(sc => sc.id === suspendedCartId);
                if (suspendedCart) {
                    set({
                        cart: suspendedCart.cart,
                        selectedCustomer: suspendedCart.customer,
                        discount: suspendedCart.discount,
                        discountType: suspendedCart.discountType
                    });
                    return true;
                }
                return false;
            },
            deleteSuspendedCart: (id) => set((state) => ({
                suspendedCarts: state.suspendedCarts.filter(sc => sc.id !== id)
            })),

            // Productos favoritos
            favoriteProducts: [],
            addFavorite: (productId) => {
                const state = get();
                if (!state.favoriteProducts.includes(productId)) {
                    set({ favoriteProducts: [...state.favoriteProducts, productId] });
                }
            },
            removeFavorite: (productId) => set((state) => ({
                favoriteProducts: state.favoriteProducts.filter(id => id !== productId)
            })),
            isFavorite: (productId) => {
                const state = get();
                return state.favoriteProducts.includes(productId);
            },

            // Productos más vendidos (calculado dinámicamente)
            getTopSellingProducts: (limit = 10) => {
                const state = get();
                const productSales = {};
                state.sales.forEach(sale => {
                    sale.items.forEach(item => {
                        if (!productSales[item.id]) {
                            productSales[item.id] = { id: item.id, name: item.name, count: 0 };
                        }
                        productSales[item.id].count += item.quantity;
                    });
                });
                return Object.values(productSales)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, limit)
                    .map(p => state.products.find(prod => prod.id === p.id))
                    .filter(Boolean);
            },

            // Descuentos
            discount: 0,
            discountType: 'percentage',
            setDiscount: (discount, type = 'percentage') => set({ discount, discountType: type }),
            clearDiscount: () => set({ discount: 0, discountType: 'percentage' }),

            // Cupones
            coupons: [],
            addCoupon: (coupon) => set((state) => ({ 
                coupons: [...state.coupons, { ...coupon, id: crypto.randomUUID(), createdAt: new Date().toISOString() }] 
            })),
            updateCoupon: (id, updatedCoupon) => set((state) => ({
                coupons: state.coupons.map((c) => c.id === id ? { ...c, ...updatedCoupon } : c)
            })),
            deleteCoupon: (id) => set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) })),
            validateCoupon: (code) => {
                const state = get();
                const coupon = state.coupons.find(c => c.code === code && !c.used && 
                    (!c.expiryDate || new Date(c.expiryDate) > new Date()) &&
                    (c.usageLimit === null || c.usageCount < c.usageLimit));
                return coupon || null;
            },

            // Combos/Packs
            combos: [],
            addCombo: (combo) => set((state) => ({ 
                combos: [...state.combos, { ...combo, id: crypto.randomUUID(), createdAt: new Date().toISOString() }] 
            })),
            updateCombo: (id, updatedCombo) => set((state) => ({
                combos: state.combos.map((c) => c.id === id ? { ...c, ...updatedCombo } : c)
            })),
            deleteCombo: (id) => set((state) => ({ combos: state.combos.filter((c) => c.id !== id) })),

            // Configuración
            exchangeRate: 36.5,
            exchangeRateLastUpdate: null,
            setExchangeRate: (rate) => set({ 
                exchangeRate: rate,
                exchangeRateLastUpdate: Date.now()
            }),

            // Clientes
            customers: [],
            selectedCustomer: null,
            addCustomer: (customer) => set((state) => ({ 
                customers: [...state.customers, { ...customer, id: crypto.randomUUID(), createdAt: new Date().toISOString() }] 
            })),
            updateCustomer: (id, updatedCustomer) => set((state) => ({
                customers: state.customers.map((c) => c.id === id ? { ...c, ...updatedCustomer, updatedAt: new Date().toISOString() } : c)
            })),
            deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
            setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

            // Proveedores
            suppliers: [],
            addSupplier: (supplier) => set((state) => ({ 
                suppliers: [...state.suppliers, { ...supplier, id: crypto.randomUUID(), createdAt: new Date().toISOString() }] 
            })),
            updateSupplier: (id, updatedSupplier) => set((state) => ({
                suppliers: state.suppliers.map((s) => s.id === id ? { ...s, ...updatedSupplier } : s)
            })),
            deleteSupplier: (id) => set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) })),

            // Historial
            sales: [],
            saleCounter: 1, // Contador de tickets
            addSale: (sale) => {
                const state = get();
                const saleNumber = state.saleCounter;
                sale.items.forEach(item => {
                    state.decreaseStock(item.id, item.quantity, 'sale', `Venta ${sale.id}`);
                });
                const saleWithNumber = {
                    ...sale,
                    saleNumber,
                    ticketNumber: `TKT-${String(saleNumber).padStart(6, '0')}`
                };
                set((state) => ({ 
                    sales: [saleWithNumber, ...state.sales],
                    saleCounter: state.saleCounter + 1
                }));
            },
            deleteSale: (id) => {
                const state = get();
                const sale = state.sales.find(s => s.id === id);
                if (sale) {
                    sale.items.forEach(item => {
                        state.increaseStock(item.id, item.quantity, 'return', `Devolución venta ${id}`);
                    });
                }
                set((state) => ({ sales: state.sales.filter((s) => s.id !== id) }));
            },

            // Devoluciones
            returns: [],
            addReturn: (returnData) => {
                const state = get();
                returnData.items.forEach(item => {
                    state.increaseStock(item.productId, item.quantity, 'return', `Devolución ${returnData.id}`);
                });
                set((state) => ({ returns: [returnData, ...state.returns] }));
            },

            // Cortes de caja
            cashRegisters: [],
            currentCashRegister: null,
            openCashRegister: (initialAmount) => {
                const register = {
                    id: crypto.randomUUID(),
                    openDate: new Date().toISOString(),
                    closeDate: null,
                    initialAmount,
                    finalAmount: initialAmount,
                    sales: [],
                    returns: [],
                    expectedAmount: initialAmount,
                    difference: 0,
                    status: 'open'
                };
                set({ 
                    currentCashRegister: register,
                    cashRegisters: [...get().cashRegisters, register]
                });
                return register;
            },
            closeCashRegister: (finalAmount) => {
                const state = get();
                const register = state.currentCashRegister;
                if (!register) return;

                const todaySales = state.sales.filter(s => {
                    const saleDate = new Date(s.date);
                    const registerDate = new Date(register.openDate);
                    return saleDate >= registerDate && (!register.closeDate || saleDate <= new Date(register.closeDate));
                });

                const totalSales = todaySales.reduce((sum, s) => sum + s.totalUSD, 0);
                const expectedAmount = register.initialAmount + totalSales;
                const difference = finalAmount - expectedAmount;

                const updatedRegister = {
                    ...register,
                    closeDate: new Date().toISOString(),
                    finalAmount,
                    expectedAmount,
                    difference,
                    status: 'closed',
                    sales: todaySales
                };

                set({
                    currentCashRegister: null,
                    cashRegisters: state.cashRegisters.map(r => r.id === register.id ? updatedRegister : r)
                });

                return updatedRegister;
            },

            // Transferencias de stock
            stockTransfers: [],
            addStockTransfer: (transfer) => {
                const state = get();
                // Disminuir stock en origen
                state.decreaseStock(transfer.fromProductId, transfer.quantity, 'transfer', `Transferencia a ${transfer.toLocation}`);
                // Aumentar stock en destino (si el producto existe en destino)
                const toProduct = state.products.find(p => p.id === transfer.toProductId);
                if (toProduct) {
                    state.increaseStock(transfer.toProductId, transfer.quantity, 'transfer', `Transferencia desde ${transfer.fromLocation}`);
                }
                set((state) => ({ 
                    stockTransfers: [{ ...transfer, id: crypto.randomUUID(), date: new Date().toISOString() }, ...state.stockTransfers] 
                }));
            },

            // Notificaciones
            notifications: [],
            addNotification: (notification) => set((state) => ({ 
                notifications: [{ ...notification, id: crypto.randomUUID(), date: new Date().toISOString(), read: false }, ...state.notifications] 
            })),
            markNotificationAsRead: (id) => set((state) => ({
                notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
            })),
            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            })),
            clearNotifications: () => set({ notifications: [] }),

            // Configuración avanzada
            settings: {
                lowStockThreshold: 10,
                taxRate: 0,
                printerName: '',
                autoPrint: false,
                currencySymbol: '$',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h',
                soundEnabled: true,
                soundVolume: 0.5,
                dashboardLayout: 'default',
                offlineMode: false,
                scaleIntegration: false,
                scalePort: '',
                voiceSearchEnabled: false
            },
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            // Usuario actual (para auditoría)
            currentUser: { id: 'default', name: 'Usuario' },
            setCurrentUser: (user) => set({ currentUser: user }),

            // Backup/Restore
            exportData: () => {
                const state = get();
                return {
                    products: state.products,
                    sales: state.sales,
                    customers: state.customers,
                    suppliers: state.suppliers,
                    coupons: state.coupons,
                    combos: state.combos,
                    cashRegisters: state.cashRegisters,
                    returns: state.returns,
                    stockTransfers: state.stockTransfers,
                    settings: state.settings,
                    exportDate: new Date().toISOString()
                };
            },
            importData: (data) => {
                if (data.products) set({ products: data.products });
                if (data.sales) set({ sales: data.sales });
                if (data.customers) set({ customers: data.customers });
                if (data.suppliers) set({ suppliers: data.suppliers });
                if (data.coupons) set({ coupons: data.coupons });
                if (data.combos) set({ combos: data.combos });
                if (data.cashRegisters) set({ cashRegisters: data.cashRegisters });
                if (data.returns) set({ returns: data.returns });
                if (data.stockTransfers) set({ stockTransfers: data.stockTransfers });
                if (data.settings) set({ settings: { ...get().settings, ...data.settings } });
            },
        }),
        {
            name: 'bodeguita-storage',
        }
    )
);
