interface Order {
    id: string;
    date: string;
    status: string;
    total: number;
    customer: {
        name: string;
        email: string;
        phone: string;
        shippingAddress: string;
    };
    products: {
        image: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    shipping: {
        method: string;
        trackingNumber?: string;
        estimatedDelivery: string;
    };
}

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
    onMarkAsShipped: () => void;
    onCancelOrder: () => void;
}

export const OrderDetailsModal = ({ order, onClose, onMarkAsShipped, onCancelOrder }: OrderDetailsModalProps) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <p><span className="font-medium">Order ID:</span> {order.id}</p>
                        <p><span className="font-medium">Order Date:</span> {order.date}</p>
                        <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded ${order.status === "Shipped" ? "bg-green-100 text-green-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{order.status}</span></p>
                        <p><span className="font-medium">Total Amount:</span> ${order.total.toFixed(2)}</p>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <p><span className="font-medium">Name:</span> {order.customer.name}</p>
                        <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                        <p><span className="font-medium">Phone:</span> {order.customer.phone}</p>
                        <p><span className="font-medium">Shipping Address:</span> {order.customer.shippingAddress}</p>
                    </div>
                </div>

                {/* Product List */}
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Products</h3>
                    {order.products.map((product: { image: string; name: string; quantity: number; price: number }, index: number) => (
                        <div key={index} className="flex items-center border-b py-2">
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mr-4" />
                            <div>
                                <p className="font-medium">{product.name}</p>
                                <p>Quantity: {product.quantity}</p>
                                <p>Price: ${product.price.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Shipping Information */}
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Shipping Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <p><span className="font-medium">Method:</span> {order.shipping.method}</p>
                        <p><span className="font-medium">Tracking Number:</span> {order.shipping.trackingNumber || "Not available"}</p>
                        <p><span className="font-medium">Estimated Delivery:</span> {order.shipping.estimatedDelivery}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                    {order.status === "Processing" && (
                        <button
                            onClick={onMarkAsShipped}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Mark as Shipped
                        </button>
                    )}
                    {order.status !== "Cancelled" && (
                        <button
                            onClick={onCancelOrder}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Cancel Order
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}