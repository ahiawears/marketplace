import { useState } from "react";

interface Size {
    size_id: string;
    name: string;
    quantity: number;
}

interface SizeSelectProps {
    sizes: Size[];
    onSelectSize: (size: Size) => void;
    onSizeGuideSelected?: () => void;
}

const SizeSelect: React.FC<SizeSelectProps> = ({ sizes, onSelectSize, onSizeGuideSelected }) => {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const handleSizeSelect = (size: Size) => {
        setSelectedSize(size.size_id);
        onSelectSize(size);
    };

    return (
        <div>
            <h3 className="font-medium mb-2">Select Size:</h3>
            <div className="flex flex-wrap gap-2 mb-1">
                {sizes.map(size => (
                    <button
                        key={size.size_id}
                        className={`px-2 py-1 border-2 text-sm ${
                        selectedSize === size.size_id 
                            ? 'border-black bg-black text-white border-2' 
                            : 'border-gray-300 hover:border-black border-2'
                        } ${
                            size.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleSizeSelect(size)}
                        disabled={size.quantity <= 0}
                    >
                        {size.name.charAt(0).toUpperCase() + size.name.slice(1)}
                        {size.quantity <= 0 && ' (Out of stock)'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SizeSelect;