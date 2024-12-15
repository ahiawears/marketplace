import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ModalBackdrop from "./modal-backdrop";
import { Product } from '@/lib/types';
import ModalProductItem from "../ui/modal-product-item-detail";


interface AddToCartModalProps {
    productId: string;
    onCancel: () => void;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ productId, onCancel }) => {

    const [product, setProduct] = useState<Product | null>(null);

    const fetchProductDetails = async () => {
        try {
            const response = await fetch(`/api/getProductById/${productId}`);
            const data = await response.json();
            setProduct(data.data);
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchProductDetails();
        }
    }, [productId]);

    if (!product) return <p>Loading...</p>;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none bg-black bg-opacity-50">
            <ModalBackdrop disableInteraction={false} />
            <div className="pointer-events-auto bg-white p-6 rounded-lg shadow-lg w-3/4 overflow-y-scroll">
                {/* Modal Content */}
                <div>
                    <h2>Confirm Add to Cart</h2>
                    
                    <ModalProductItem 
                        productId={productId} 
                        productName={product?.name || "Unknown Product"} 
                        productPrice={product?.price || 0} 
                        mainImage={product?.main_image_url || ""}
                        thumbnails={product?.image_urls || []}
                    />

                    <div className="flex gap-4 float-right bottom-0">
                        
                        <Button onClick={onCancel} className="py-2 px-4 text-white rounded-lg">
                            Cancel
                        </Button>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default AddToCartModal