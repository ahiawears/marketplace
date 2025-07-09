import { ProductUploadData } from "@/lib/types";
import { Button } from "./button";

interface PublishProductProps {
    isAllDetailsSaved: boolean;
    isAllVariantsSaved: boolean;
    productData: ProductUploadData;
    onPublishClick: () => void;
}

const PublishProduct: React.FC<PublishProductProps> = ({ isAllDetailsSaved, isAllVariantsSaved, onPublishClick }) => {
    return (
        <>

            <div className="absolute">
                <div className="p-6 border-2 rounded-lg shadow-sm mx-auto fixed">
                    <Button 
                        className="w-full flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        onClick={onPublishClick}   
                        disabled={!isAllDetailsSaved || !isAllVariantsSaved} 
                    >
                        Review & Publish
                    </Button>
                </div>
            </div>
        </>
    
    )
}

export default PublishProduct;