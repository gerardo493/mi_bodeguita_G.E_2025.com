import React from 'react';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import RealTimeStats from '../components/RealTimeStats';

const POSPage = () => {
    return (
        <div className="space-y-4">
            <RealTimeStats />
            <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)] flex flex-col md:flex-row gap-4">
                <div className="flex-1 h-1/2 md:h-full overflow-hidden">
                    <ProductGrid />
                </div>
                <div className="w-full md:w-96 h-1/2 md:h-full">
                    <Cart />
                </div>
            </div>
        </div>
    );
};

export default POSPage;
