import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductPreviewProps {
    productData: {
        generalDetails: {
            productName: string;
            category: string;
            currency: string;
        };
        productInformation: {
            main_image_url: string;
            price?: string;
            variantName?: string;
            images?: string[];
        };
        productVariants: {
            main_image_url: string;
            variantName: string;
        }[];
    };
    selectedVariant: {
        main_image_url: string;
        price?: string;
        variantName?: string;
        images?: string[];
    } | null;
    onVariantClick: (variant: any) => void;
  }
  
const ProductPreview: React.FC<ProductPreviewProps> = ({ productData, selectedVariant, onVariantClick, }) => {
    const mainPreview = selectedVariant || productData.productInformation;
    const [selectedImage, setSelectedImage] = useState(mainPreview.main_image_url);
    

    const blobLoader = ({ src }: { src: string }) => {
        if (src.startsWith("blob:")) {
            return src; 
        }
        return src;
    };

    return (
        <div>
            <div className="mx-auto flex flex-col lg:flex-row">
                <div className="lg:basis-3/5 p-4">
                    <div className="flex justify-center mb-4 h-[500px] w-[300px]">
                        <Image
                            src={ selectedImage }
                            height={500}
                            width={300}
                            priority
                            style={{objectFit:"contain"}}
                            alt={mainPreview.variantName || productData.generalDetails.productName}
                        />
                    </div>
                    {/* Thumbnails */}
                    <div className="flex justify-center gap-4">
                        {mainPreview.images && mainPreview.images.map((image, index) => (
                            <div
                                key={index}
                                className="cursor-pointer border-2 border-transparent hover:border-gray-400 rounded-md overflow-hidden relative h-[80px] w-[80px]"
                                onClick={() => setSelectedImage(image)}
                            >
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    height={80}
                                    width={80}
                                    style={{objectFit:"contain"}}
                                    //className="w-20 h-20 object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:basis-2/5 p-4">
                    <div className="px-6 bg-white rounded-lg shadow-lg py-4">
                        <div className="flex justify-between mb-4">
                            <span>{mainPreview.variantName || productData.generalDetails.productName}</span>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
        // <div>
        //     {/* Main Product Preview */}
        //     <div className="flex flex-col items-center">
        //         <Image 
        //             src={
        //                 mainPreview.main_image_url || "https://placehold.co/250x500.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
        //             }
        //             width={250}
        //             height={600}
        //             alt={mainPreview.variantName || productData.generalDetails.productName}
        //             loader={blobLoader}
        //             priority
        //             className="mx-auto mt-4 align-middle"
        //         />
        //         <h2 className="text-lg font-bold">
        //             {mainPreview.variantName || productData.generalDetails.productName}
        //         </h2>
        //         <p className="text-gray-700">
        //             {mainPreview.price
        //                 ? `${productData.generalDetails.currency} ${mainPreview.price}`
        //                 : productData.generalDetails.category
        //             }
        //         </p>
        //     </div>
  
        //     {/* Variant List */}
        //     {productData.productVariants.length > 0 && (
        //         <div className="mt-6">
        //             <h3 className="text-md font-semibold mb-2">Variants</h3>
        //             <div className="flex flex-wrap gap-4">
        //                 {productData.productVariants.map((variant, index) => (
        //                     <div
        //                         key={index}
        //                         className={`p-2 border rounded-md cursor-pointer ${
        //                             selectedVariant === variant
        //                             ? 'border-blue-500'
        //                             : 'border-gray-300'
        //                         }`}
        //                         onClick={() => onVariantClick(variant)}
        //                     >

        //                         <Image
        //                             src={
        //                                 variant.main_image_url || "https://placehold.co/250x500.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
        //                             }
        //                             alt={variant.variantName}
        //                             loader={blobLoader}
        //                             width={250}
        //                             height={600}
        //                             priority
        //                             className="mx-auto"
        //                         />
        //                         <p className="text-sm mt-2 text-center">{variant.variantName}</p>
        //                     </div>
        //                 ))}
        //             </div>
        //         </div>
        //     )}
        // </div>
    );
};
  
export default ProductPreview;
  