import React, { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { Select } from "./select";
import { Button } from "./button";
import { updateCartItemQuantity } from "@/actions/updateCartItem";


interface CartItemProps {
  item: {
    id: number;
    product_id: string;
    main_image_url: string;
    products_list: { name: string | null } | { name: any }[];
    color: string;
    product_name: string;
    size_name: string;
    sizes?: { size_name: string };
    size_id: string;
    quantity: number;
    price: number;
    cart_item_id: string;
    cumPrice: number;
    cart_id: string;
  };
  onDelete: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onDelete }) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleQuantityChange = (quantity: number) => {
    setSelectedQuantity(quantity);
    setShowConfirmation(true);
  };

  const handleUpdate = async (qty: number, mainCartId: string, cartItemId: string, cartItemPrice: number) => {
    console.log("Hello Update", qty, "Main Cart Id: ", mainCartId, "Cart Item Id: ", cartItemId);

    try {
        updateCartItemQuantity(qty, mainCartId, cartItemId, cartItemPrice);
    } catch (error) {
        console.error(error);
        console.log(error);
    }
    alert("Quantity successfully changed");
  };

  const handleCancel = () => {
    setSelectedQuantity(null);
    setShowConfirmation(false);
  };

  return (
    <div>
        <div className="flex items-center space-x-4 p-4 border-b">
            <img src={item.main_image_url} alt={item.product_name} width={150} height={150} className="rounded" />
            <div className="flex-1">
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-sm text-gray-500">Color: {item.color}</p>
                <p className="text-sm text-gray-500">Size: {item.size_name}</p>
                <div className="flex items-center space-x-2 mt-2">
                    <label htmlFor={`quantity-${item.id}`} className="text-sm">
                        Qty:
                    </label>
                    <Select
                        id={`quantity-${item.id}`}
                        value={selectedQuantity ?? item.quantity}
                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                        className="border rounded px-2 py-1 md:w-1/6"
                    >
                        {[1, 2, 3, 4, 5].map((qty) => (
                            <option key={qty} value={qty}>
                                {qty}
                            </option>
                        ))}
                    </Select>
                </div>
            
            </div>
            <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
            <button onClick={onDelete} className="text-black">
                <AiOutlineDelete size={24} />
            </button>

            {showConfirmation && (
                <div className="flex items-center space-x-2 mt-2">
                    <Button onClick={() => handleUpdate(Number(selectedQuantity), item.cart_id, item.cart_item_id, Number(item.price.toFixed(2)))} className="px-4 py-2 text-white rounded">
                        Update
                    </Button>
                    <Button onClick={handleCancel} className="px-4 py-2 bg-gray-300 rounded">
                        Cancel
                    </Button>
                </div>
            )}
            </div>
    </div>
    
  );
};

export default CartItem;
