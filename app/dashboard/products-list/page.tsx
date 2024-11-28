"use client";


import { useRouter } from "next/navigation";
import PageLoading from "@/components/pageLoading";
import ProductTable from "@/components/ui/list-product-table";
import { ProductTableType } from "@/lib/types";
import { useEffect, useState } from "react";


const ProductsPage = () => {

	const router = useRouter();
	const [products, setProducts] = useState<ProductTableType[]>([]);
	const [loading, setLoading] = useState(true);

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

	useEffect(() => {
        const fetchProducts = async () => {
            try {    
                const response = await fetch('/api/brandProductsList');
                const data = await response.json();

                if (response.ok) {
                    setProducts(data.data); 
                } else {
                    console.error("Failed to fetch product items:", data.error);
                }
            } catch (error) {
                console.error("Error fetching product items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

	if (loading) {
		return <PageLoading />; //add the page loading page
	}
	return (
		<div>
			<div className="hidden lg:block">
				<div className="p-4">
					<ProductTable 
						products={products}
						onHideProduct={handleHideProduct}
						onEditProduct={handleEditProduct}
						onDeleteProduct={handleDeleteProduct}
					/>
				</div>
			</div>
			<div className="w-full py-10 lg:hidden">
                <ProductTable
					products={products}
					onHideProduct={handleHideProduct}
					onEditProduct={handleEditProduct}
					onDeleteProduct={handleDeleteProduct}
				/>
            </div>
		</div>
	);
};

export default ProductsPage;
