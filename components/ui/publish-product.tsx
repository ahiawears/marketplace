import { Button } from "./button";


interface PublishProductProps {
    onPublishClick: () => void;
    isFormValid: boolean;
    isAllVariantsSaved: boolean;
}

const PublishProduct: React.FC<PublishProductProps> = ({ onPublishClick, isFormValid, isAllVariantsSaved }) => {
    return (
        <div className="absolute">
            <div className="p-6 border-2 rounded-lg shadow-sm mx-auto fixed">
                <Button 
                    className="w-full flex justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    onClick={onPublishClick}   
                    disabled={!isFormValid || !isAllVariantsSaved} 
                >
                    Publish Product
                </Button>
            </div>
        </div>
    
    )
}

export default PublishProduct;