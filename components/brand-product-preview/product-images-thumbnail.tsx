import Image from "next/image"
import { MdOutlineModeEdit } from "react-icons/md"
import { Button } from "../ui/button"
import { FC, useEffect } from "react"
import { Product } from "@/lib/types"

interface ProductImagesProps {
    productId: string;
}

export const ProductsImagesThumbnailEdit: FC <ProductImagesProps> = (productId)=> {

    useEffect(() => {
        if (productId) {
            try {

            } catch (error) {
                
            }
        }
    })
    
    return (
        <div>
            <div className="flex relative m-5 overflow-hidden group h-[550px] w-[500px]">
                <Image
                    width={500}
                    height={550}
                    priority
                    style={
                        {
                            objectFit: "contain"
                        }
                    }
                    src="https://placehold.co/600x700.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"
                    alt="product name"
                />
                <Button
                    className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 transition"
                >
                    <MdOutlineModeEdit className="text-black" />
                </Button>
            </div>
        </div>
    )
}