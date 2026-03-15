import React, { useEffect, useState, useTransition } from 'react';
import SizeSelect from './size-select';
import Image from 'next/image';
import { Button } from './button';
import SuccessModal from '../modals/success-modal';
import ModalBackdrop from '../modals/modal-backdrop';
import { checkVariantStock } from '@/actions/user-actions/userCartActions/checkVariantStock';
import { upsertCart } from '@/actions/user-actions/userCartActions/upsertCart';
import { strictSerialize } from '@/lib/serialization';

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

interface ProductSizesResponse {
    data?: {
        sizes: Size[];
    };
}

const ModalProductItem: React.FC<ProductItemProps> = ({ productId, productName, productPrice, mainImage, thumbnails }) => {
    const productImages = [mainImage, ...thumbnails];
    const [selectedImage, setSelectedImage] = useState(mainImage);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [sizeError, setSizeError] = useState<string | null>(null);
    const [successModal, setSuccessModal] = useState(false);
    const [isCartPending, startCartTransition] = useTransition();

    useEffect(() => {
        const fetchSizes = async () => {
            try {
                setSizeError(null);
                const response = await fetch(`/api/getProductSizes/${productId}`);
                const data: ProductSizesResponse = await response.json();

                if (!response.ok) {
                    throw new Error("Failed to fetch product sizes.");
                }

                setSizes(data.data?.sizes ?? []);
            } catch (error) {
                console.error("Error fetching sizes:", error);
                setSizeError(error instanceof Error ? error.message : "Failed to fetch product sizes.");
                setSizes([]);
            }
        };

        if (productId) {
            fetchSizes();
        }
    }, [productId]);

    const handleModalClose = async () => {
        setSuccessModal(false);
    }

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert("Please select a size first.");
            return;
        }

        startCartTransition(async () => {
            try {
                const userResponse = await fetch('/api/getUserDetails');
                const userPayload = await userResponse.json();
                const user = userPayload?.data?.user;

                if (!userResponse.ok || !user?.id) {
                    throw new Error("Please log in to add items to your cart.");
                }

                const verifiedInput = strictSerialize({
                    variantId: productId,
                    size: selectedSize.name,
                    quantity: 1,
                });

                const stockResult = await checkVariantStock(
                    verifiedInput.variantId,
                    verifiedInput.size,
                    verifiedInput.quantity
                );

                const verifiedStock = strictSerialize(stockResult);
                if (!verifiedStock.success || !verifiedStock.sizeId) {
                    throw new Error(verifiedStock.error || "Unable to verify stock.");
                }

                const cartData = strictSerialize({
                    variantId: productId,
                    sizeId: verifiedStock.sizeId,
                    quantity: 1,
                    isAnonymous: false,
                    userId: user.id,
                });

                const cartResult = await upsertCart(cartData);
                const verifiedCart = strictSerialize(cartResult);

                if (!verifiedCart.success) {
                    throw new Error(verifiedCart.error || "Failed to add item to cart.");
                }

                setSuccessModal(true);
            } catch (error) {
                console.error("Error adding item to cart:", error);
                alert(error instanceof Error ? error.message : "Failed to add item to cart. Please try again.");
            }
        });
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
                        {sizeError ? (
                            <p className="text-sm text-red-600 mb-4">{sizeError}</p>
                        ) : (
                            <SizeSelect sizes={sizes} onSelectSize={setSelectedSize} />
                        )}
                    </div>
                    <div>
                        <Button
                            onClick={handleAddToCart}
                            disabled={isCartPending || sizes.length === 0}
                            className="w-full py-2 px-4 text-white rounded-lg  transition"
                        >
                            {isCartPending ? "Adding..." : "Add to Cart"}
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
