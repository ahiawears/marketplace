import { ProductListItemsDataType } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { AiFillHeart } from "react-icons/ai";

interface ProductVariantCardProps {
  variant: ProductListItemsDataType["product_variants"][0];
  product: ProductListItemsDataType;
}

export const ProductCard = ({variant, product}: ProductVariantCardProps) => {
	const [imageError, setImageError] = useState(false);
	const mainImage = variant.product_images.find(img => img.is_main) || variant.product_images[0];

	return (
		<div className="overflow-hidden hover:shadow-lg transition-shadow">
			<div className="relative aspect-square bg-gray-100 group-hover:opacity-75 overflow-hidden">
				{mainImage && !imageError ? (
					<>	
						<Image
							src={mainImage.image_url}
							alt={variant.name || product.name}
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
						<Button
							className="absolute top-2 right-2 p-2 cursor-pointer z-50 text-white group-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out"
						>
							<AiFillHeart size={24} className="z-100"/>
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
				<Button className="px-3 py-1 bg-black text-white transition">
					Add to Cart
				</Button>
				</div>
			</div>
		</div>
	);
};
