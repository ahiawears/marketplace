import React, { useState } from 'react';
import SizeSelect from "./size-select";
import Image from 'next/image';
import { Button } from './button';
import { HeartIcon } from 'lucide-react';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import SizeGuideModal from '../modals/size-guide';
import { useAuth } from '@/hooks/useAuth'
import { getClientAnonymousId } from "@/lib/anon_user/client";


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
  tags: Tag[];
}

interface ProductItemProps {
  variantData: VariantData;
}

const ProductItem: React.FC<ProductItemProps> = ({ variantData }) => {
    const { userId } = useAuth();
    const mainImage = variantData.product_images.find(img => img.is_main) || variantData.product_images[0];
    const [selectedImage, setSelectedImage] = useState(mainImage?.image_url);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const [ likeClicked, setLikeClicked ] = useState<boolean>(false);
    const [ isSizeGuideOpen, setIsSizeGuideOpen ] = useState<boolean>(false);

    const availableSizes = Object.keys(variantData.sizes || {}).map(sizeName => ({
        size_id: sizeName,
        name: sizeName,
        quantity: variantData.sizes[sizeName].quantity
    }));

    // Prepare size data for the modal
    const sizeGuideData = Object.entries(variantData.sizes || {}).reduce((acc, [sizeName, sizeDetails]) => {
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
        setLikeClicked(!likeClicked)
    }

    const handleShowSizeGuide = () => {
        setIsSizeGuideOpen(!isSizeGuideOpen);
    }

    const handleAddToCart = async () => {
        const userIdentifier = userId || getClientAnonymousId();
        const isAnonymous = !userId;

        console.log("isAnonymous? ", isAnonymous, " userIdentifier", userIdentifier);

        const variant = variantData.id;
        const choosenSize = selectedSize;

        console.log("The variant added is ", variant, " and the size selected is ", choosenSize);

        const response = await fetch(`/api/addToCart?${userId ? `userType=user&Id=${userIdentifier}` : `userType=anonymous&Id=${userIdentifier}`}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                variantId: variantData.id,
                size: selectedSize,
                quantity: 1
            })
        });

        const result = await response.json();


        if (!response.ok) {
            throw new Error(result.error || 'Failed to add to cart');
        }

        console.log(result);
        //show confirmation
    }
    return (
        <div className="container mx-auto py-10">
            {/* Image Gallery and Product Info Container */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Image Gallery - Reordered for mobile first */}
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-3/5">
                    {/* Thumbnails - Vertical on desktop, horizontal on mobile */}
                    <div className="flex flex-row mx-auto lg:flex-col gap-2 order-1 lg:order-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                        {variantData.product_images.map((image) => (
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

                    {/* Main Image */}
                    <div className="flex-1 order-2 lg:order-2">
                        {selectedImage ? (
                            <div className="relative aspect-square w-full max-w-[600px] mx-auto">
                                <Image
                                    src={selectedImage}
                                    alt={variantData.name}
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

                {/* Product Info */}
                <div className="w-full lg:w-2/5">
                    <div className="px-6 bg-white rounded-lg shadow-lg py-4 border-2">
                        <h1 className="text-2xl font-bold mb-4">{variantData.name}</h1>
                        
                        <div className="mb-4">
                            <span className="text-2xl font-semibold">${variantData.price.toFixed(2)}</span>
                            {variantData.base_currency_price && (
                                <span className="text-sm text-gray-500 ml-2">
                                    (≈ ${variantData.base_currency_price.toFixed(2)})
                                </span>
                            )}
                        </div>

                        {variantData.color_id && (
                            <div className="mb-4 flex items-center">
                                <span className="mr-2">Color:</span>
                                <div 
                                    className="w-6 h-6 border-2"
                                    style={{ backgroundColor: variantData.color_id.hex_code }}
                                    title={variantData.color_id.name}
                                />
                                <span className="ml-2">{variantData.color_id.name}</span>
                            </div>
                        )}


                        {/* Size Selector */}
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
                                    onClick={()=> handleAddToCart()}
                                    className="w-full py-3 bg-black text-white transition-colors disabled:bg-gray-400"
                                    disabled={!selectedSize}
                                >
                                    Add to Cart
                                </Button>
                            </div>
                            <button 
                                onClick={() => handleLikeClicked()}
                                className="w-[28px] flex justify-center py-2 hover:cursor-pointer transition-colors duration-300 ease-in-out rounded-full" 
                            >
                                {likeClicked ? (
                                    <AiFillHeart size={26} className="text-black outline-2 hover:opacity-100"/>
                                ) : (   
                                    <AiOutlineHeart size={26} className="text-black outline-2 hover:opacity-100"/>
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            </div>

            {isSizeGuideOpen && (
                <SizeGuideModal
                    onCancel={handleShowSizeGuide}
                    sizeData={Object.entries(variantData.sizes || {}).reduce((acc, [sizeName, sizeDetails]) => ({
                        ...acc,
                        [sizeName]: {
                        measurements: sizeDetails.measurements.map(m => ({
                            type: m.type,
                            value: m.value.toString(),
                            unit: m.unit
                        }))
                        }
                    }), {})}
                />
            )}
        </div>
    );
};

export default ProductItem;