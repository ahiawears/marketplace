import { Button } from "./button";


interface PublishProductProps {
    onPublishClick: () => void;
}

const PublishProduct: React.FC<PublishProductProps> = ({ onPublishClick }) => {
    return (
        <div className="absolute">
            <div className="p-6 border-2 rounded-lg shadow-sm mx-auto fixed">
                <Button 
                    className="w-full"
                    onClick={onPublishClick}    
                >
                    Publish Product
                </Button>
            </div>
        </div>
    
    )
}

export default PublishProduct;