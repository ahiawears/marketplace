import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { X, BarChart2, ShoppingCart, DollarSign, Users } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface CouponWithStats {
    id: string;
    name: string;
    code: string;
    stats: {
        totalUses: number;
        totalRevenue: number;
        avgOrderValue: number;
        recentOrders: {
            orderId: string;
            customerName: string;
            date: string;
            amount: number;
        }[];
    };
}

interface CouponStatsModalProps {
    coupon: CouponWithStats | null;
    onClose: () => void;
    currency?: string;
}

const CouponStatsModal = ({ coupon, onClose, currency = "$" }: CouponStatsModalProps) => {
    useBodyScrollLock(true);

    if (!coupon) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl bg-white rounded-none shadow-2xl border-2 max-h-[90vh] flex flex-col">
                <CardHeader className="flex flex-row justify-between items-center border-b-2 p-4 bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <BarChart2 className="h-6 w-6 text-gray-700" />
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-800">Coupon Statistics</CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                                Performance for: <span className="font-semibold">{coupon.name} ({coupon.code})</span>
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200">
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6 overflow-y-auto">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-100 border-2">
                            <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{coupon.stats.totalUses}</p>
                            <p className="text-sm text-gray-500">Total Uses</p>
                        </div>
                        <div className="p-4 bg-gray-100 border-2">
                            <DollarSign className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{currency} {coupon.stats.totalRevenue.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                        </div>
                        <div className="p-4 bg-gray-100 border-2">
                            <Users className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{currency} {coupon.stats.avgOrderValue.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Avg. Order Value</p>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
                        <div className="border-2">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y-2 divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y-2 divide-gray-200">
                                        {coupon.stats.recentOrders.length > 0 ? (
                                            coupon.stats.recentOrders.map(order => (
                                                <tr key={order.orderId}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-gray-700">{order.orderId}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{order.customerName}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right font-semibold">{currency}{order.amount.toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-sm text-gray-500">No recent orders found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CouponStatsModal;
