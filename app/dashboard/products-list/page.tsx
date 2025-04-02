"use client";

import { useRouter } from "next/navigation";
import ProductTable from "@/components/ui/list-product-table";
import { ProductTableType } from "@/lib/types";
import { useEffect, useState } from "react";
import LoadContent from "@/app/load-content/page";
import { Button } from "@/components/ui/button";
import UploadProductSvg from "@/components/svg/upload-product-svg";

// Example Products Data with Image URLs
const exampleProducts: ProductTableType[] = [
	{
	  id: "product-1",
	  name: "Elegant Silk Scarf",
	  main_image_url: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Silk Scarf
	  category_name: "Accessories",
	  sku: "SCARF-SILK-001",
	},
	{
	  id: "product-2",
	  name: "Classic Leather Handbag",
	  main_image_url: "https://images.unsplash.com/photo-1587303954914-0534a750816a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Leather Handbag
	  category_name: "Handbags",
	  sku: "HANDBAG-LEATHER-002",
	},
	{
	  id: "product-3",
	  name: "Modern Minimalist Watch",
	  main_image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Minimalist Watch
	  category_name: "Watches",
	  sku: "WATCH-MINIMAL-003",
	},
	{
	  id: "product-4",
	  name: "Cozy Wool Sweater",
	  main_image_url: "https://images.unsplash.com/photo-1512327642304-99d3560873ea?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Wool Sweater
	  category_name: "Clothing",
	  sku: "SWEATER-WOOL-004",
	},
	{
	  id: "product-5",
	  name: "Stylish Denim Jeans",
	  main_image_url: "https://images.unsplash.com/photo-1595388188939-005048465432?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Denim Jeans
	  category_name: "Clothing",
	  sku: "JEANS-DENIM-005",
	},
	{
	  id: "product-6",
	  name: "Comfortable Running Shoes",
	  main_image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Running Shoes
	  category_name: "Shoes",
	  sku: "SHOES-RUNNING-006",
	},
	{
	  id: "product-7",
	  name: "Wireless Bluetooth Headphones",
	  main_image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Bluetooth Headphones
	  category_name: "Electronics",
	  sku: "HEADPHONES-WIRELESS-007",
	},
	{
	  id: "product-8",
	  name: "Portable Bluetooth Speaker",
	  main_image_url: "https://images.unsplash.com/photo-1564424224827-cd24b8915874?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Bluetooth Speaker
	  category_name: "Electronics",
	  sku: "SPEAKER-BLUETOOTH-008",
	},
	{
	  id: "product-9",
	  name: "Gourmet Coffee Beans",
	  main_image_url: "https://images.unsplash.com/photo-1512568426133-3515090c5d2a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Coffee Beans
	  category_name: "Food & Drink",
	  sku: "COFFEE-GOURMET-009",
	},
	{
	  id: "product-10",
	  name: "Organic Green Tea",
	  main_image_url: "https://images.unsplash.com/photo-1519996529931-28324d5a63f7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Green Tea
	  category_name: "Food & Drink",
	  sku: "TEA-GREEN-010",
	},
];
  
const ProductsPage = () => {  
	const router = useRouter();
	//const [products, setProducts] = useState<ProductTableType[]>([]);
	const [products, setProducts] = useState<ProductTableType[]>(exampleProducts);
	const [loading, setLoading] = useState(false);

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
	// useEffect(() => {
    //     const fetchProducts = async () => {
    //         try {    
    //             const response = await fetch('/api/brandProductsList');
    //             const data = await response.json();

    //             if (response.ok) {
    //                 setProducts(data.data); 
    //             } else {
    //                 console.error("Failed to fetch product items:", data.error);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching product items:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchProducts();
    // }, []);

	// if (loading) {
	// 	return <LoadContent />; //add the page loading page
	// }
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
