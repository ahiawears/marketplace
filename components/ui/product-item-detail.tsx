import React, { useState } from 'react';

interface ProductItemProps {
    productId: string;
    productName: string;
    productPrice: number;
    mainImage: string;
}

const ProductItem: React.FC<ProductItemProps> = ({ productId, productName, productPrice, mainImage }) => {
    const productImages = [
        mainImage,
        'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg',
        'https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-02.jpg',
    ];

    // Set the main image to the first thumbnail initially
    const [selectedImage, setSelectedImage] = useState(mainImage);

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
                    <div className="px-6 bg-white rounded-lg shadow-lg">
                        <div className="flex justify-between mb-4">
                            <span>{productName}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span>${productPrice}</span>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
    );
};

export default ProductItem;
