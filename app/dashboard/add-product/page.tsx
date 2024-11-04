import AddProductForm from "@/components/ui/add-product-form"

const AddProduct = () => {
    return (
        <div>
            <div className="container">
                <div className="hidden lg:block">
					<div className="p-4"> 
						<AddProductForm />
					</div>
				</div>
				<div className="w-full p-3 px-10 py-10 lg:hidden">
					<AddProductForm />
				</div>
            </div>
        </div>
    )
}


export default AddProduct;