import React from 'react';
import { AiOutlineDelete } from 'react-icons/ai';

interface CartItemProps {
    item: {
        id: number;
        product_id: string;
        main_image_url: string;
        products_list: { name: string | null } | { name: any }[];
        color: string;
        product_name: string;
        size_name: string;
        sizes?: {size_name: string}
        size_id: string;
        quantity: number;
        price: number;
        cart_item_id: string;
        cumPrice: number;
    };
    onDelete: () => void;
    onQuantityChange: (id: number, quantity: number, cart_item_id: string, cumPrice: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onDelete, onQuantityChange }) => {
    return (
        <div className="flex items-center space-x-4 p-4 border-b">
            <img src={item.main_image_url} alt={item.product_name} width={150} height={150} className="rounded" />
            <div className="flex-1">
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-sm text-gray-500">Color: {item.color}</p>
                <p className="text-sm text-gray-500">Size: {item.size_name}</p>
                <div className="flex items-center space-x-2 mt-2">
                    <label htmlFor={`quantity-${item.id}`} className="text-sm">Qty:</label>
                    <select
                        id={`quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(e) => onQuantityChange(item.id, Number(e.target.value), item.cart_item_id, item.cumPrice)}
                        className="border rounded px-2 py-1"
                    >
                        {[1, 2, 3, 4, 5].map((qty) => (
                            <option key={qty} value={qty}>{qty}</option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
            <button onClick={onDelete} className="text-black">
                <AiOutlineDelete size={24} />
            </button>
        </div>
    );
};

export default CartItem;
