"use client";

import ProductTable from "@/components/ui/list-product-table";
const placeholderThumbnail = "https://placehold.co/600x400?text=Hello+World"; 
const products = [
	{
		id: "1",
		name: "Sample Product 1",
		thumbnail: placeholderThumbnail,
		category: "Electronics",
	},
	{
			id: "2",
			name: "Sample Product 2",
			thumbnail: placeholderThumbnail,
			category: "Apparel",
	},
];

const handleHideProduct = (id: string) => {
	console.log(`Hide product with id: ${id}`);
};

const handleEditProduct = (id: string) => {
	console.log(`Edit product with id: ${id}`);
};

const handleDeleteProduct = (id: string) => {
	console.log(`Delete product with id: ${id}`);
};


const ProductsPage = () => {
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
