import { TicketPercent, Edit, BarChart2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { CouponSwitch } from "../ui/coupon-switch";
import { cn } from "@/lib/utils";
import { CouponListItem } from "./coupon-client";

interface CouponsListProps {
    onAddCouponDetails: () => void;
    data: CouponListItem[];
    onUpdateCoupon: (couponId: string) => void;
    onUpdateCouponStatus: (couponId: string, isActive: boolean) => void;
    onViewStats: (couponId: string) => void;
    activeFilter: 'all' | 'active' | 'inactive' | 'expired';
    onFilterChange: (filter: 'all' | 'active' | 'inactive' | 'expired') => void;
    couponCounts: {
        all: number;
        active: number;
        inactive: number;
        expired: number;
    };
}

const ClientFormattedDate = ({ dateString }: { dateString: string }) => {
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        if (dateString) {
            setFormattedDate(new Date(dateString).toLocaleDateString());
        }
    }, [dateString]);

    // Render a loading state or the final date
    return <>{formattedDate || '...'}</>;
};

const formatDiscount = (type: string, value: number, currency: string = "$") => {
    switch (type) {
        case 'percentage':
            return `${value}% off`;
        case 'fixed':
            return `${currency}${value.toFixed(2)} off`;
        case 'free_shipping':
            return 'Free Shipping';
        default:
            return `${value}`;
    }
}

const BrandCouponList = ({ onAddCouponDetails, data, onUpdateCoupon, onUpdateCouponStatus, onViewStats, activeFilter, onFilterChange, couponCounts }: CouponsListProps) => {
    const filterTabs = [
        { label: 'All', value: 'all', count: couponCounts.all },
        { label: 'Active', value: 'active', count: couponCounts.active },
        { label: 'Inactive', value: 'inactive', count: couponCounts.inactive },
        { label: 'Expired', value: 'expired', count: couponCounts.expired },
    ] as const;

    return (
        <div className="container mx-auto border-2 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center my-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 shrink-0">Coupons</h1>
                <Button onClick={onAddCouponDetails} className="text-white transition-colors duration-200 rounded-none">
                    Add New Coupon
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="border-b-2 border-gray-200 mb-6">
                <div className="flex space-x-1 sm:space-x-4 overflow-x-auto">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => onFilterChange(tab.value)}
                            className={cn(
                                "py-2 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                activeFilter === tab.value
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            )}
                        >
                            {tab.label} <span className="ml-1 sm:ml-2 bg-black text-white px-2 py-0.5 text-xs">{tab.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {data.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 border-2 shadow-inner">
                    <TicketPercent className="h-12 w-12 mx-auto" />
                    <p className="my-4 text-lg text-gray-600">{couponCounts.all === 0 ? "No coupons added yet." : "No coupons match the current filter."}</p>
                    {couponCounts.all === 0 && <p className="text-sm text-gray-500 mt-2">Click the button above to add your first coupon.</p>}
                </div>
            ) : (
                <div>
                    <div className="space-y-4">
                        {data.map((coupon) => (
                            <Card key={coupon.id} className="hover:shadow-lg border-2 transition-shadow duration-300 rounded-none">
                                <CardHeader className="bg-gray-50 p-4 border-b-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                                                <span className="break-words text-left">{coupon.name}</span>
                                            </CardTitle>
                                            <CardDescription className="text-sm text-gray-600 pt-2">
                                                Code: <span className="font-mono bg-gray-200 px-2 py-1 rounded-sm">{coupon.code}</span>
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center space-x-1 sm:space-x-2 self-end sm:self-center shrink-0">
                                            <div className="hidden sm:flex items-center space-x-2">
                                                <CouponSwitch
                                                    status={coupon.isActive ? "active" : "inactive"}
                                                    onStatusChange={(newStatus) => onUpdateCouponStatus(coupon.id, newStatus === "active")}
                                                    className="flex items-center space-x-2"
                                                />
                                            </div>
                                            <Button size="icon" variant="ghost" className="hover:text-blue-600" onClick={() => onViewStats(coupon.id)}>
                                                <BarChart2 className="h-5 w-5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="hover:text-gray-700" onClick={() => onUpdateCoupon(coupon.id)}>
                                                <Edit className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <p className="text-sm font-medium text-gray-500">Discount</p>
                                        <p className="text-lg font-semibold text-gray-800">{formatDiscount(coupon.discountType, coupon.discountValue)}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-sm font-medium text-gray-500">Validity</p>
                                        <p className="text-sm text-gray-700">
                                            <ClientFormattedDate dateString={coupon.startDate} /> - {coupon.endDate ? <ClientFormattedDate dateString={coupon.endDate} /> : 'No expiry'}
                                        </p>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <div className={`px-3 py-1 text-xs font-semibold w-fit h-fit ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </CardContent>

                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default BrandCouponList;