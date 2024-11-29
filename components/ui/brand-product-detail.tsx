import Image from "next/image";
import React, { useState } from "react";

interface ProductItemProps {
    productId: string;
    productName: string;
    productPrice: number;
    mainImage: string;
    thumbnails: string[];
    description: string;
}

interface Size {
    size_id: string;
    quantity: number;
    name: string;
}

const BrandProductItem: React.FC<ProductItemProps> = ({ productId, productName, productPrice, mainImage, thumbnails, description }) => {
    const productImages = [
        mainImage,
        ...thumbnails
    ];
    const [selectedImage, setSelectedImage] = useState(mainImage);

    return (
        <div>
            <div className="container mx-auto py-10 flex flex-col lg:flex-row">
                <div className="lg:basis-3/5 p-4">
                    <div className="flex justify-center mb-4 relative h-[700px] w-[600px]">
                        <Image
                            src={selectedImage}
                            alt="Main Product"
                            height={700}
                            width={600}
                            priority
                            style={{objectFit:"contain"}}
                            //className="w-[600px] h-[700px] object-cover rounded-lg"
                        />
                        
                    </div>
                    <div className="flex justify-center gap-4 ">
                        {productImages.map((image, index) => (
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
                                    // className="w-20 h-20 object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BrandProductItem;
