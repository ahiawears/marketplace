import ProductItem from '@/components/ui/product-item-detail'
import ProductsList from '@/components/ui/productsList'
import React from 'react'

const ProductDetail: React.FC = () => {
    return (
        <div>
            <ProductItem />
            {/* This should query the products table for category with same tag */}
            {/* Featured grids */}
            <h2 className='text-md text-2xl font-bold px-4 lg:px-8 sm:px-6 lg:w-full'>You might also like:</h2>
            <ProductsList />
        </div>
    )
}

export default ProductDetail   