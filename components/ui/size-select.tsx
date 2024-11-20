import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

interface Size {
    size_id: string;
    quantity: number;
    name: string;
}

interface SizeSelectProps {
    productId: string;
}

const SizeSelect: React.FC<SizeSelectProps> = ({ productId }) => {
    const [sizes, setSizes] = useState<Size[]>([]);
    const [selected, setSelected] = useState<Size | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchSizes = async () => {
            const response = await fetch(`/api/getProductSizes/${productId}`);
            const result = await response.json();

            if (response.ok) {
                setSizes(result.data.sizes);
            } else {
                console.error(result.error);
            }
        };

        fetchSizes();
    }, [productId]);

    const handleSelection = (size: Size) => {
        if (size.quantity > 0) {
            setSelected(size);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative w-full mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">
                SELECT SIZE:
            </label>
            <div
                className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-gray-300 focus:outline-none"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <div className="flex items-center">
                    <span className="ml-3 block truncate">
                        {selected ? selected.name : "Choose a size"}
                    </span>
                </div>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
            </div>

            {isOpen && (
                <ul
                    className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                    {sizes.map((size) => (
                        <li
                            key={size.size_id}
                            className={`relative flex cursor-pointer select-none py-2 pl-3 pr-9 ${
                                size.quantity === 0
                                    ? "text-gray-400"
                                    : "text-gray-900 hover:bg-indigo-100"
                            }`}
                            onClick={() => handleSelection(size)}
                        >
                            <div className="flex items-center">
                                <span
                                    className={`ml-3 block truncate ${
                                        size.quantity === 0 ? "italic" : ""
                                    }`}
                                >
                                    {size.name} {size.quantity === 0 ? "(Out of stock)" : ""}
                                </span>
                            </div>
                            {selected?.size_id === size.size_id && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <Check className="h-5 w-5" aria-hidden="true" />
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SizeSelect;
