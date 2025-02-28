import Image from "next/image"
import { MdOutlineModeEdit } from "react-icons/md"
import { Button } from "../ui/button"
import { FC, useEffect, useState } from "react"
import { ProductInformation } from "@/lib/types"


export const ProductsImagesThumbnailEdit: FC <ProductInformation["variantImages"]> = (variantImagesData)=> {

    const [mainImage, setMainImage] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(mainImage);

    const [imagesArray, setImagesArray] = useState<ProductInformation["variantImages"] | null>(null);
    
    useEffect(() => {
        if (variantImagesData && typeof variantImagesData === "object") {
            try {                
                // Convert the object to an array of its values
                setImagesArray(Object.values(variantImagesData));
                
            } catch (error) {
                console.error(error);
            }
        }
    }, [variantImagesData]);

    useEffect(() => {
        if (imagesArray) {
            //console.log("Updated product data:", productData);
            setMainImage(imagesArray[0].image_url);
        }
    }, [imagesArray]);
    

    if (!mainImage) {
        return <p>No main image found</p>;
    }

    if (!imagesArray) {
        return <p>No images found</p>;
    }
    
    return (
        <div className="h-fit">
            <div className="flex relative group h-[650px] max-w-[510px]">
                <Image
                    width={510}
                    height={650}
                    priority
                    style={
                        {
                            objectFit: "cover"
                        }
                    }
                    src={ selectedImage || mainImage }
                    alt="product name"
                    className="border-2"
                />
                <Button
                    className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 transition"
                >
                    <MdOutlineModeEdit className="text-black" />
                </Button>
            </div>
            {/* thumbnails */}

            <div className="flex gap-4 mt-4">
                
                {variantImagesData && imagesArray.map((image, index) => (
                    <div
                        key={index}
                        className="cursor-pointer hover:border-gray-400 rounded-md relative max-h-[110px] w-[80px]"
                        onClick={() => setSelectedImage(image.image_url)}
                    >
                        <Image
                            src={image.image_url}
                            alt={`Thumbnail ${index + 1}`}
                            height={110}
                            width={80}
                            style={{ objectFit: "cover" }}
                            className="border-2"
                        />
                    </div>
                ))}
                
            </div>
        </div>
    )
}