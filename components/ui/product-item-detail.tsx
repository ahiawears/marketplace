"use client";
import React, { useState, useTransition, useMemo } from 'react';
import SizeSelect from "./size-select";
import Image from 'next/image';
import { Button } from './button';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import SizeGuideModal from '../modals/size-guide';
// The useAuth hook is no longer needed here as user info is passed via props
// import { useAuth } from '@/hooks/useAuth'
// getClientAnonymousId is no longer needed here
// import { getClientAnonymousId } from "@/lib/anon_user/client";
import { saveProduct } from '@/actions/user-actions/userSavedProductActions/save-product'
import { checkVariantStock } from '@/actions/user-actions/userCartActions/checkVariantStock';
import { upsertCart } from '@/actions/user-actions/userCartActions/upsertCart';
import { strictSerialize } from '@/lib/serialization';

interface Color {
  id: string;
  name: string;
  hex_code: string;
}

interface ProductImage {
  id: string;
  image_url: string;
  is_main: boolean;
}

interface SizeDetails {
  quantity: number;
  measurements: {
    type: string;
    value: number;
    unit: string;
  }[];
}

interface Tag {
  tag_id: {
    name: string;
  };
}

interface VariantData {
  id: string;
  main_product_id: string;
  name: string;
  color_id: Color;
  sku: string;
  price: number;
  base_currency_price: number;
  product_code: string;
  color_description: string;
  images_description: string;
  product_images: ProductImage[];
  relatedVariantIds: string[];
  sizes: Record<string, SizeDetails>;
  tags: Tag[] | null;
}

interface ProductItemProps {
    variantData: VariantData;
    initialIsSaved: boolean;
    serverUserIdentifier: string;
    isAnonymous: boolean;
}

function deserializeVariantData(data: VariantData): VariantData {
    return {
        ...data,
        product_images: Array.isArray(data.product_images) 
            ? data.product_images.map((img: ProductImage) => ({ ...img })) 
            : [],
        sizes: data.sizes ? Object.fromEntries(
            Object.entries(data.sizes).map(([sizeName, sizeDetails]) => [
                sizeName,
                {
                    quantity: sizeDetails.quantity,
                    measurements: Array.isArray(sizeDetails.measurements)
                        ? sizeDetails.measurements.map((m) => ({ ...m }))
                        : []
                }
            ])
        ) : {},
        tags: Array.isArray(data.tags) 
            ? data.tags.map((tag: Tag) => ({ tag_id: { ...tag.tag_id } })) 
            : null
    };
}

const ProductItem: React.FC<ProductItemProps> = ({ 
    variantData, 
    initialIsSaved,
    serverUserIdentifier,
    isAnonymous
}) => {
    
    // Deserialize the data on the client side
    const processedVariantData = useMemo(() => deserializeVariantData(variantData), [variantData]);
    
    const mainImage = processedVariantData.product_images.find(img => img.is_main) || processedVariantData.product_images[0];
    const [selectedImage, setSelectedImage] = useState(mainImage?.image_url);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(initialIsSaved);
    
    const [isCartPending, startCartTransition] = useTransition();
    const [isLikePending, startLikeTransition] = useTransition();

    const [hasBeenAdded, setHasBeenAdded] = useState(false);

    const availableSizes = Object.keys(processedVariantData.sizes || {}).map(sizeName => ({
        size_id: sizeName,
        name: sizeName,
        quantity: processedVariantData.sizes[sizeName].quantity
    }));

    const sizeGuideData = Object.entries(processedVariantData.sizes || {}).reduce((acc, [sizeName, sizeDetails]) => {
        acc[sizeName] = {
            measurements: sizeDetails.measurements.map(m => ({
                type: m.type,
                value: m.value.toString(), 
                unit: m.unit
            }))
        };
        return acc;
    }, {} as Record<string, { measurements: Array<{ type: string; value: string; unit: string }> }>);

    const handleLikeClicked = () => {

        let size;
        if (!selectedSize) {
            size = "";
        } else {
            size = selectedSize;
        }

        if (!processedVariantData.id) {
            return;
        }
        
        console.log("The user identifier is: ", serverUserIdentifier, " and isAnonymous: ", isAnonymous);
        console.log("The size is ", size);
        
        // Optimistic UI update: Flip the saved state immediately
        setIsSaved(prevIsSaved => !prevIsSaved);

        startLikeTransition(async () => {
            try {
                const result = await saveProduct({
                    variantId: processedVariantData.id,
                    size: size,
                    isAnonymous,
                    userId: serverUserIdentifier,
                    path: 'productsPage'
                });

                // If the server action failed, revert the UI state
                if (!result.success) {
                    setIsSaved(initialIsSaved);
                    console.error("Failed to save product:", result.error);
                }
            } catch (error) {
                // Catch any unexpected errors from the server action
                console.error("Unexpected error in saveProduct:", error);
                setIsSaved(initialIsSaved);
            }
        });
    };

    const handleShowSizeGuide = () => {
        setIsSizeGuideOpen(!isSizeGuideOpen);
    }
    
    const handleAddToCart = async () => {
        const quantity = 1;

        if (!processedVariantData.id || !selectedSize) return;

        startCartTransition(async () => {
            try {
                const verifiedInput = strictSerialize({
                    variantId: processedVariantData.id,
                    size: selectedSize,
                    quantity
                });

                const stockResult = await checkVariantStock(
                    verifiedInput.variantId,
                    verifiedInput.size,
                    verifiedInput.quantity
                );

                const verifiedStock = strictSerialize(stockResult);
                if (!verifiedStock.success) throw new Error(verifiedStock.error);

                if (verifiedStock.sizeId === null) {
                    throw new Error("Size ID was not returned from stock check.");
                }
                
                const cartData = strictSerialize({
                    variantId: processedVariantData.id,
                    sizeId: verifiedStock.sizeId,
                    quantity,
                    isAnonymous,
                    userId: serverUserIdentifier
                });

                const cartResult = await upsertCart(cartData);
                const verifiedCart = strictSerialize(cartResult);
                
                if (!verifiedCart.success) throw new Error(verifiedCart.error);
                
                console.log("Success! Cart updated");
                setHasBeenAdded(true);
                setTimeout(() => setHasBeenAdded(false), 3000); 
            } catch (error) {
                console.error("Nuclear error handling:", {
                    message: error instanceof Error ? error.message : String(error),
                    input: { variantId: processedVariantData.id, size: selectedSize },
                });
            }
        });
    };

    const getCartButtonText = () => {
        if (isCartPending) return "Adding...";
        if (hasBeenAdded) return "Added to Cart!";
        return "Add to Cart";
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-3/5">
                    <div className="flex flex-row mx-auto lg:flex-col gap-2 order-1 lg:order-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                        {processedVariantData.product_images.map((image) => (
                            <div
                                key={image.id}
                                className={`flex-shrink-0 cursor-pointer border-2 rounded-md overflow-hidden relative h-[80px] w-[80px] ${
                                selectedImage === image.image_url 
                                    ? 'border-2' 
                                    : 'border-transparent hover:border-gray-400'
                                }`}
                                onClick={() => setSelectedImage(image.image_url)}
                            >
                                <Image
                                    src={image.image_url}
                                    alt={`Thumbnail ${image.id}`}
                                    height={80}
                                    width={80}
                                    style={{ objectFit: "contain" }}
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    priority
                                    unoptimized={true}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 order-2 lg:order-2">
                        {selectedImage ? (
                            <div className="relative aspect-square w-full max-w-[600px] mx-auto">
                                <Image
                                    src={selectedImage}
                                    alt={processedVariantData.name}
                                    height={550}
                                    width={500}
                                    priority
                                    style={{ objectFit: "contain" }}
                                    className="rounded-lg border-2"
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    unoptimized={true}
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
                                <span>No image available</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-2/5">
                    <div className="px-6 bg-white rounded-lg shadow-lg py-4 border-2">
                        <h1 className="text-2xl font-bold mb-4">{processedVariantData.name}</h1>
                        
                        <div className="mb-4">
                            <span className="text-2xl font-semibold">${processedVariantData.price.toFixed(2)}</span>
                            {processedVariantData.base_currency_price && (
                                <span className="text-sm text-gray-500 ml-2">
                                    (≈ ${processedVariantData.base_currency_price.toFixed(2)})
                                </span>
                            )}
                        </div>

                        {processedVariantData.color_id && (
                            <div className="mb-4 flex items-center">
                                <span className="mr-2">Color:</span>
                                <div 
                                    className="w-6 h-6 border-2"
                                    style={{ backgroundColor: processedVariantData.color_id.hex_code }}
                                    title={processedVariantData.color_id.name}
                                />
                                <span className="ml-2">{processedVariantData.color_id.name}</span>
                            </div>
                        )}

                        {availableSizes.length > 0 && (
                            <>
                                <div className="my-2">
                                    <SizeSelect 
                                        sizes={availableSizes} 
                                        onSelectSize={(size) => setSelectedSize(size.size_id)}
                                    />
                                </div>
                                <div className="my-2">
                                    <span
                                        onClick={handleShowSizeGuide}
                                        className="hover:cursor-pointer text-black hover:text-gray-500"
                                    >
                                        Show size guide
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="flex flex-row gap-2">
                            <div className="w-full">
                                <Button
                                    onClick={handleAddToCart}
                                    className={`w-full py-3 text-white transition-colors disabled:bg-gray-400 ${hasBeenAdded ? 'bg-green-500' : 'bg-black'}`}
                                    disabled={!selectedSize || isCartPending || hasBeenAdded}
                                >
                                    {getCartButtonText()}
                                </Button>
                            </div>
                            <button 
                                onClick={handleLikeClicked}
                                disabled={isLikePending}
                                className="w-[28px] flex justify-center py-2 hover:cursor-pointer transition-colors duration-300 ease-in-out rounded-full" 
                            >
                                {isSaved ? (
                                    <AiFillHeart size={26} className="text-black outline-2 hover:opacity-100"/>
                                ) : (   
                                    <AiOutlineHeart size={26} className="text-gray-500 outline-2 hover:opacity-100"/>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isSizeGuideOpen && (
                <SizeGuideModal
                    onCancel={handleShowSizeGuide}
                    sizeData={sizeGuideData}
                />
            )}
        </div>
    );
};

export default ProductItem;
