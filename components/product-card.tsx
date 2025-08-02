import { ProductListItemsDataType } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Link from "next/link";

interface ProductVariantCardProps {
  variant: ProductListItemsDataType["product_variants"][0];
  product: ProductListItemsDataType;
}

export const ProductCard = ({variant, product}: ProductVariantCardProps) => {
	const [imageError, setImageError] = useState(false);
	const mainImage = variant.product_images.find(img => img.is_main) || variant.product_images[0];
	const [ likeClicked, setLikeClicked ] = useState<boolean>(false);

	const handleLikeClicked = () => {
		setLikeClicked(!likeClicked);
	}


	return (
		<Link href={`/product/${variant.id}`}>
			<div 
				className="overflow-hidden hover:shadow-lg transition-shadow hover:cursor-pointer"
			>
				<div className="group relative bg-gray-100 group-hover:opacity-75 overflow-hidden">
					{mainImage && !imageError ? (
						<>	
							<Image
								src={mainImage.image_url}
								alt={variant.name}
								width={400}
								height={400}
								className="object-cover"
								onError={() => setImageError(true)}
								priority={false}
								sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
								loading="lazy"
								quality={85}
								unoptimized={true}
							/>
							<button
								onClick={() => handleLikeClicked()}
								className="absolute top-2 right-2 p-2 rounded-full cursor-pointer z-200 text-black group-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out hover:shadow-lg"
							>
								{likeClicked ? (
									<AiFillHeart size={24} className="text-black outline-2"/>
								) : (
									<AiOutlineHeart size={24} className="text-black outline-2"/>
								)}
							</button>
							<Button
								className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-black bg-opacity-50 text-white font-medium opacity-0 group-hover:opacity-100 duration-300 ease-in-out z-10 h-[40px] w-[200px]"

							>
								Add to cart
							</Button>
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-gray-200">
							<span className="text-gray-500">No image available</span>
						</div>
					)}
				</div>
		
				<div className="border-b-2 p-2">
					<p className="text-gray-600 font-semibold line-clamp-1">{variant.name}</p>
					
					<div className="mt-2 flex items-center gap-2">
						{variant.color_id && (
							<span 
								className="w-4 h-4 border-2"
								style={{ backgroundColor: variant.color_id.hex_code }}
								title={variant.color_id.name}
							/>
						)}
						<span className="text-sm text-gray-500">
							{variant.color_id?.name}
						</span>
					</div>
					
					<div className="mt-4 flex justify-between items-center">
						<span className="font-bold">${variant.price.toFixed(2)}</span>
					</div>
				</div>
			</div>
		</Link>
		
	);
};
