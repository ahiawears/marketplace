import React, { useState } from 'react';
import SizeSelect from './size-select';
import addItemToUserCart from '@/actions/add-item-to-user-cart';

interface ProductItemProps {
    productId: string;
    productName: string;
    productPrice: number;
    mainImage: string;
    description: string;
    
}

interface Size {
    size_id: string;
    quantity: number;
    name: string;
}

const ProductItem: React.FC<ProductItemProps> = ({ productId, productName, productPrice, mainImage, description }) => {
    const productImages = [
        mainImage,
        'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
        'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-02.jpg',
    ];

    const [selectedImage, setSelectedImage] = useState(mainImage);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert("Please select a size first.");
            return;
        }
    
        const item = {
            productId,
            sizeId: selectedSize.size_id, // Correctly accessing size_id
            quantity: 1, // Default quantity
            price: productPrice,
        };
    
        try {
            await addItemToUserCart(item); // Call the action with the correct item
            alert("Item added to cart!");
        } catch (error) {
            console.error("Error adding item to cart:", error);
            alert("Failed to add item to cart. Please try again.");
        }
    };

    return (
        <div>
            <div className="container mx-auto py-10 flex flex-col lg:flex-row">
                <div className="lg:basis-3/5 p-4">
                    <div className="flex justify-center mb-4">
                        <img
                            src={selectedImage}
                            alt="Main Product"
                            className="w-full max-w-xl object-cover rounded-lg"
                        />
                    </div>
                    {/* Thumbnails */}
                    <div className="flex justify-center gap-4">
                        {productImages.map((image, index) => (
                            <div
                                key={index}
                                className="cursor-pointer border-2 border-transparent hover:border-gray-400 rounded-md overflow-hidden"
                                onClick={() => setSelectedImage(image)}
                            >
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-20 h-20 object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:basis-2/5 p-4">
                    <div className="px-6 bg-white rounded-lg shadow-lg py-4">
                        <div className="flex justify-between mb-4">
                            <span>{productName}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span>${productPrice}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span>{description}</span>
                        </div>
                        {/* sizes select menu goes here */}
                        <SizeSelect productId={productId} onSelectSize={setSelectedSize}/>
                        <div className="text-sm">
                            <button
                                //formAction={brandLogin}
                                onClick={handleAddToCart}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
    );
};

export default ProductItem;
