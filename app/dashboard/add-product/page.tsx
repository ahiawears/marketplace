import AddProductForm from "@/components/ui/add-product-form"

const AddProduct = () => {
    return (
        <div>
            <div className="hidden lg:block">
                <div className="p-4"> 
                    <AddProductForm />
                </div>
            </div>
            <div className="w-full py-10 lg:hidden">
                <AddProductForm />
            </div>
        </div>  
    )
}


export default AddProduct;