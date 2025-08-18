import React from "react";
import AddProductForm from "../../../components/ui/add-product-form"

export const metadata = {
    title: "Add Product",
    description: "Carefully fill the form to add a new product"
}

const AddProduct = () => {
    return (
        <div>
            <div className="mx-auto shadow-2xl">
                <div className="mx-auto max-w-7xl border-2">
                    <AddProductForm />  
                </div>
            </div>
        </div>  
    )
}


export default AddProduct;