"use client";

import { useRouter } from "next/navigation";
import ProductTable from "@/components/ui/list-product-table";
import { ProductTableType } from "@/lib/types";
import { useEffect, useState } from "react";
import LoadContent from "@/app/load-content/page";
import { Button } from "@/components/ui/button";
import UploadProductSvg from "@/components/svg/upload-product-svg";
import { useFetchAllProductsBrand } from "@/hooks/useFetchAllProductsBrand";

const ProductsPage = () => { 
	const { products: brandProducts, loading } = useFetchAllProductsBrand();
	const router = useRouter();
	//const [products, setProducts] = useState<ProductTableType[]>([]);
	const [products, setProducts] = useState<ProductTableType[]>([]);

	const handleHideProduct = (productId: string, variantId: string) => {
		console.log(`Hide variant ${variantId} for product ${productId}`);
	};
	
	const handleEditProduct = (productId: string, variantId: string) => {
		console.log(`Edit product ${productId} from variant ${variantId}`);
		router.push(`./edit-product/${productId}`);
		
	};
	
	const handleDeleteProduct = (productId: string, variantId: string) => {
		console.log(`Delete variant ${variantId} from product ${productId}`); 
	}

	useEffect(() => {
		if (brandProducts && loading === false) {
			setProducts(brandProducts);
		}
	}, [brandProducts, loading])

	if (loading) {
		return <LoadContent />; 
	}
	return (
		<div className="mx-auto min-w-0 max-w-full overflow-x-hidden">
			{products.length > 0 ? (
				<div className="min-w-0 max-w-full">
					<div className="min-w-0 p-0">
						<ProductTable
							products={products}
							onHideProduct={handleHideProduct}
							onEditProduct={handleEditProduct}
							onDeleteProduct={handleDeleteProduct}
						/>
					</div>
				</div>
			) : (
				<div className="mx-auto w-full max-w-2xl lg:max-w-7xl">
					<div className="w-full p-8 text-center transform transition-all relative"> 
						<div className="mx-auto">
							<UploadProductSvg className="w-64 h-64 mx-auto" width={256} height={256} />
							<p className="font-bold my-4">You have no product uploaded</p>

							<div className="flex w-full flex-col md:flex-row mx-auto">
								<div className="mx-auto">
									<Button onClick={() => router.push("./add-product")}>
										Upload a product
									</Button>
								</div>
								
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductsPage;
