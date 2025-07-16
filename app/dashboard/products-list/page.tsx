"use client";

import { useRouter } from "next/navigation";
import ProductTable from "@/components/ui/list-product-table";
import { ProductTableType } from "@/lib/types";
import { useEffect, useState } from "react";
import LoadContent from "@/app/load-content/page";
import { Button } from "@/components/ui/button";
import UploadProductSvg from "@/components/svg/upload-product-svg";
import { useAuth } from "@/hooks/useAuth";
import { useFetchAllProductsBrand } from "@/hooks/useFetchAllProductsBrand";

const ProductsPage = () => { 
	const { products: brandProducts, loading, error, resetError } = useFetchAllProductsBrand();
	const router = useRouter();
	//const [products, setProducts] = useState<ProductTableType[]>([]);
	const [products, setProducts] = useState<ProductTableType[]>([]);

	const handleHideProduct = (id: string) => {
		console.log(`Hide product with id: ${id}`);
	};
	
	const handleEditProduct = (id: string) => {
		router.push(`./edit-product/${id}`);
		console.log(`Edit product with id: ${id}`);
	};
	
	const handleDeleteProduct = (id: string) => {
		console.log(`Delete product with id: ${id}`); 
	};

	const handleOnPreviewProduct = (id: string) => {
		console.log(`Preview product with id: , ${id}`);
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
		<div className=" mx-auto">
			{products.length > 0 ? (
				<div className="">
					<div className="p-4">
						<ProductTable
							products={products}
							onHideProduct={handleHideProduct}
							onEditProduct={handleEditProduct}
							onDeleteProduct={handleDeleteProduct}
							onPreviewProduct={handleOnPreviewProduct}
						/>
					</div>
				</div>
			) : (
				<div className="mx-auto max-w-2xl lg:max-w-7xl w-full">
					<div className="w-full p-8 text-center transform transition-all relative"> 
						<div className="mx-auto">
							<UploadProductSvg className="w-64 h-64 mx-auto" width={256} height={256} />
							<p className="font-bold my-4">You have no product uploaded</p>

							<div className="flex w-full flex-col md:flex-row mx-auto">
								<div className="mx-auto">
									<Button>
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
