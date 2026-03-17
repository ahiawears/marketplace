"use client";

import { useRouter } from "next/navigation";
import ProductTable from "@/components/ui/list-product-table";
import { ProductTableType } from "@/lib/types";
import { useEffect, useState } from "react";
import LoadContent from "@/app/load-content/page";
import { Button } from "@/components/ui/button";
import UploadProductSvg from "@/components/svg/upload-product-svg";
import { useFetchAllProductsBrand } from "@/hooks/useFetchAllProductsBrand";
import { toast } from "sonner";

const ProductsPage = () => { 
	const { products: brandProducts, loading } = useFetchAllProductsBrand();
	const router = useRouter();
	//const [products, setProducts] = useState<ProductTableType[]>([]);
	const [products, setProducts] = useState<ProductTableType[]>([]);

	const handleHideProduct = (productId: string, variantId: string) => {
		const product = products.find((entry) => entry.id === productId);
		const variant = product?.variants.find((entry) => entry.id === variantId);
		if (!variant) {
			toast.error("Variant not found.");
			return;
		}

		const nextStatus = variant.status === "active" ? "inactive" : "active";
		const loadingToast = toast.loading(nextStatus === "inactive" ? "Archiving variant..." : "Reactivating variant...");

		fetch("/api/products/manage-variant", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				variantId,
				status: nextStatus,
			}),
		})
			.then(async (response) => {
				const result = await response.json();
				if (!response.ok || !result.success) {
					throw new Error(result.message || "Failed to update variant status.");
				}

				setProducts((prev) =>
					prev.map((productEntry) =>
						productEntry.id === productId
							? {
									...productEntry,
									variants: productEntry.variants.map((variantEntry) =>
										variantEntry.id === variantId
											? { ...variantEntry, status: nextStatus }
											: variantEntry
									),
							  }
							: productEntry
					)
				);

				toast.success(
					nextStatus === "inactive" ? "Variant archived." : "Variant reactivated.",
					{ id: loadingToast }
				);
			})
			.catch((error) => {
				toast.error(error instanceof Error ? error.message : "Failed to update variant status.", {
					id: loadingToast,
				});
			});
	};
	
	const handleEditProduct = (productId: string, variantId: string) => {
		console.log(`Edit product ${productId} from variant ${variantId}`);
		router.push(`./edit-product/${productId}`);
		
	};
	
	const handleDeleteProduct = async (productId: string, variantId: string) => {
		const loadingToast = toast.loading("Deleting variant...");

		try {
			const response = await fetch(`/api/products/manage-variant?variantId=${variantId}`, {
				method: "DELETE",
			});
			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || "Failed to delete variant.");
			}

			setProducts((prev) =>
				prev
					.map((productEntry) =>
						productEntry.id === productId
							? {
									...productEntry,
									variantCount: Math.max(0, productEntry.variantCount - 1),
									variants: productEntry.variants.filter((variantEntry) => variantEntry.id !== variantId),
							  }
							: productEntry
					)
					.filter((productEntry) => productEntry.variants.length > 0)
			);

			toast.success("Variant deleted.", { id: loadingToast });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete variant.";
			toast.error(message, {
				id: loadingToast,
			});
			throw error instanceof Error ? error : new Error(message);
		}
	};

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
