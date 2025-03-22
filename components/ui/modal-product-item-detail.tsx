import React, { useState } from 'react';
import SizeSelect from './size-select';
import addItemToUserCart from '@/actions/add-item-to-user-cart';
import Image from 'next/image';
import { Button } from './button';
import SuccessModal from '../modals/success-modal';
import ModalBackdrop from '../modals/modal-backdrop';

interface ProductItemProps {
    productId: string;
    productName: string;
    productPrice: number;
    mainImage: string;
    thumbnails: string[];
}

interface Size {
    size_id: string;
    quantity: number;
    name: string;
}

const ModalProductItem: React.FC<ProductItemProps> = ({ productId, productName, productPrice, mainImage, thumbnails }) => {
    const productImages = [mainImage, ...thumbnails];
    const [selectedImage, setSelectedImage] = useState(mainImage);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [successModal, setSuccessModal] = useState(false);

    const handleModalClose = async () => {
        setSuccessModal(false);
    }

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert("Please select a size first.");
            return;
        }

        const item = {
            productId,
            sizeId: selectedSize.size_id,
            quantity: 1,
            price: productPrice,
            productName,
        };

        try {
            await addItemToUserCart(item);
            setSuccessModal(true);
        } catch (error) {
            console.error("Error adding item to cart:", error);
            alert("Failed to add item to cart. Please try again.");
        }
    };

    return (
        <div className="h-3/4 w-3/4 flex flex-col overflow-auto mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left Section */}
                <div className="lg:basis-3/5 flex flex-col items-center p-4">
                    <div className="flex justify-center h-full max-h-96 w-full">
                        <Image
                            src={selectedImage}
                            alt="Main Product"
                            className="object-contain max-h-full max-w-full"
                            height={400}
                            width={400}
                        />
                    </div>
                    <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
                        {productImages.map((image, index) => (
                            <div
                                key={index}
                                className="cursor-pointer border-2 border-transparent hover:border-gray-400 rounded-md overflow-hidden relative h-20 w-20"
                                onClick={() => setSelectedImage(image)}
                            >
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="object-contain h-full w-full"
                                    height={80}
                                    width={80}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Section */}
                <div className="lg:basis-2/5 flex flex-col justify-between p-4 bg-white rounded-lg shadow-md">
                    <div>
                        <h1 className="text-lg font-bold mb-2">{productName}</h1>
                        <p className="text-gray-600 mb-4">${productPrice}</p>
                        <SizeSelect productId={productId} onSelectSize={setSelectedSize} />
                    </div>
                    <div>
                        <Button
                            onClick={handleAddToCart}
                            className="w-full py-2 px-4 text-white rounded-lg  transition"
                        >
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
            {successModal && (
                <>
                    <ModalBackdrop/>
                    <SuccessModal
                        successMessage={productName + " has been added to your cart."}
                        onCancel={handleModalClose}
                    />
                </>
                
            )}
        </div>
    );
};

export default ModalProductItem;
