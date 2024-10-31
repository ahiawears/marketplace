// components/CartItem.tsx
import React from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Image from 'next/image';

interface CartItemProps {
    item: {
        id: number;
        image: string;
        name: string;
        color: string;
        size: string;
        quantity: number;
        price: number;
    };
    onDelete: (id: number) => void;
    onQuantityChange: (id: number, quantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onDelete, onQuantityChange }) => {
    return (
        <div className="flex items-center space-x-4 p-4 border-b">
            <Image src={item.image} alt={item.name} width={150} height={150} className="rounded" />
            <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">Color: {item.color}</p>
                <p className="text-sm text-gray-500">Size: {item.size}</p>
                <div className="flex items-center space-x-2 mt-2">
                    <label htmlFor={`quantity-${item.id}`} className="text-sm">Qty:</label>
                    <select
                        id={`quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(e) => onQuantityChange(item.id, Number(e.target.value))}
                        className="border rounded px-2 py-1"
                    >
                        {[1, 2, 3, 4, 5].map((qty) => (
                            <option key={qty} value={qty}>{qty}</option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
            <button onClick={() => onDelete(item.id)} className="text-black">
                <AiOutlineDelete size={24} />
            </button>
        </div>
    );
};

export default CartItem;
