'use client';
import { FC, useMemo, useState } from "react";
import BrandCouponList from "./brand-coupons-list";
import CouponStatsModal from "../modals/coupon-stats-modal";
import { toast } from "sonner";
import AddCouponForm from "./add-coupon-form";
import { BrandProductListItem } from "@/actions/get-products-list/fetchBrandProducts";
import { GetCouponDetails } from "@/actions/brand-actions/get-coupon-details";

type ComponentItems = "addCoupon" | "couponList";
type CouponFilterStatus = 'all' | 'active' | 'inactive' | 'expired';
export interface CouponFormDetails {
    // Section 1: Basic Information
    id?: string;
    name: string;
    code: string;
    description?: string;

    discountType: "percentage" | "fixed" | "free_shipping";
    discountValue?: number;
    baseCurrencyDiscountValue?: number;
    currencyCode: string; 

    // Section 3: Restrictions and Limits
    usageLimit: number;
    singleUsePerCustomer: "active" | "inactive";
    minOrderAmount: number;

    //Setion 4: Validity and status
    startDate: string;
    endDate: string;
    isActive: "active" | "inactive";
    autoApply: "active" | "inactive";

    //Section 5: Eligibility
    appliesTo: "entire_store" | "products" | "categories";
    includedProductNames?: string[] | null;
    eligibleCustomers: 'all_customers' | 'new_customers' | 'returning_customers' | 'specific_customers';
    allowedCountries?: string[];
    includeSaleItems: "active" | "inactive";
    includedCategoryNames?: string[];
}

export type CouponListItem = {
    id: string;
    name: string;
    code: string;
    discountType: string;
    discountValue: number;
    baseCurrencyDiscountValue?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    created_at: string;
    stats: {
        totalUses: number;
        totalRevenue: number;
        avgOrderValue: number;
        recentOrders: any[];
    };
};

export interface CouponClientProps {
    userId: string;
    currency: string;
    couponList: CouponListItem[];
    couponFormDetails: CouponFormDetails;
    brandProducts: BrandProductListItem[];  
}

// Sample Data for demonstration
const sampleCoupons = [
    {
        id: '1',
        name: 'Summer Sale 20%',
        code: 'SUMMER20',
        discountType: 'percentage',
        discountValue: 20,
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-08-31T23:59:59Z',
        isActive: true,
        created_at: '2024-05-15T10:00:00Z',
        stats: {
            totalUses: 152,
            totalRevenue: 4560.50,
            avgOrderValue: 30.00,
            recentOrders: [
                { orderId: 'ORD-123', customerName: 'Jane Doe', date: '2024-07-20T10:00:00Z', amount: 50.00 },
                { orderId: 'ORD-124', customerName: 'John Smith', date: '2024-07-20T11:30:00Z', amount: 25.50 },
                { orderId: 'ORD-125', customerName: 'Alice Johnson', date: '2024-07-19T15:00:00Z', amount: 75.00 },
                { orderId: 'ORD-126', customerName: 'Bob Brown', date: '2024-07-19T09:00:00Z', amount: 15.00 },
            ]
        }
    },
    {
        id: '2',
        name: '$10 Off First Order',
        code: 'WELCOME10',
        discountType: 'fixed',
        discountValue: 10,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '',
        isActive: true,
        created_at: '2024-01-01T09:00:00Z',
        stats: {
            totalUses: 540,
            totalRevenue: 5400.00,
            avgOrderValue: 10.00,
            recentOrders: []
        }
    },
    {
        id: '3',
        name: 'Free Shipping Weekend',
        code: 'FREESHIP',
        discountType: 'free_shipping',
        discountValue: 0,
        startDate: '2024-07-12T00:00:00Z',
        endDate: '2024-07-14T23:59:59Z',
        isActive: false,
        created_at: '2024-07-10T11:00:00Z',
        stats: {
            totalUses: 88,
            totalRevenue: 0,
            avgOrderValue: 0,
            recentOrders: []
        }
    },
];

const CouponClient: FC<CouponClientProps> = ({
    userId,
    currency,
    couponList,
    couponFormDetails,
    brandProducts,
}) => {
    const [currentComponent, setCurrentComponent] = useState<ComponentItems>("couponList");
    const [couponsList, setCouponsList] = useState<CouponClientProps["couponList"]>(couponList.length > 0 ? couponList : sampleCoupons);
    const [filter, setFilter] = useState<CouponFilterStatus>('active');

    const [couponToEdit, setCouponToEdit] = useState<CouponFormDetails | null>(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [couponForStats, setCouponForStats] = useState<typeof couponsList[0] | null>(null);
    const fetchCoupons = async () => {
        const toastId = toast.info("Refreshing coupon list...");
        
        try {
            const response = await fetch('/api/get-brand-coupons', {
                cache: 'no-store',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch coupons');
            }
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch coupons');
            }

            setCouponsList(data.data || []);
            toast.success("Coupons refreshed!", { id: toastId });
        } catch (error) {
            let errorMessage;
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = "An unknown error occurred.";
            }
            toast.error("Failed to refresh coupons: " + errorMessage + ". Please refresh the page.", { id: toastId });
        }
    }

    const couponCounts = useMemo(() => {
        const now = new Date();
        const counts = {
            all: couponsList.length,
            active: 0,
            inactive: 0,
            expired: 0,
        };

        couponsList.forEach(coupon => {
            const endDate = coupon.endDate ? new Date(coupon.endDate) : null;
            const isExpired = endDate ? endDate < now : false;

            if (isExpired) {
                counts.expired++;
            } else if (coupon.isActive) {
                counts.active++;
            } else {
                counts.inactive++;
            }
        });
        return counts;
    }, [couponsList]);

    const filteredCoupons = useMemo(() => {
        const now = new Date();
        if (filter === 'all') return couponsList;

        return couponsList.filter(coupon => {
            const endDate = coupon.endDate ? new Date(coupon.endDate) : null;
            const isExpired = endDate ? endDate < now : false;

            if (filter === 'active') return coupon.isActive && !isExpired;
            if (filter === 'inactive') return !coupon.isActive && !isExpired;
            if (filter === 'expired') return isExpired;
            return true;
        });
    }, [filter, couponsList]);

    const handleUpdateCoupon = async (couponId: string) => {
        const editToastId = toast.loading("Loading coupon for editing...");
        try {
            const result = await GetCouponDetails(couponId);
            if (!result.success || !result.data) {
                throw new Error(result.message || "Failed to load coupon details.");
            }
            setCouponToEdit(result.data);
            setCurrentComponent("addCoupon");
            toast.success("Coupon loaded.", { id: editToastId });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Error: ${errorMessage}`, { id: editToastId });
        }
    };

    const handleViewStats = (couponId: string) => {
        const coupon = couponsList.find(c => c.id === couponId);
        if (coupon) {
            setCouponForStats(coupon);
            setIsStatsModalOpen(true);
        }
    };

    const handleCloseStatsModal = () => setIsStatsModalOpen(false);

    const handleUpdateCouponStatus = async (couponId: string, isActive: boolean) => {
        const statusToastId = toast.loading(`Updating coupon status...`);

        try {
            const response = await fetch('/api/upsert-coupon', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ couponId, isActive }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to update coupon status');
            }

            setCouponsList(prev =>
                prev.map(c => (c.id === couponId ? { ...c, isActive } : c))
            );
            toast.success(`Coupon is now ${isActive ? 'active' : 'inactive'}.`, { id: statusToastId });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Error: ${errorMessage}`, { id: statusToastId });
        }
    };

    const renderComponent = () => {
        if (currentComponent === "addCoupon") {
            return <AddCouponForm
                onBack={() =>{
                        setCouponToEdit(null); // Clear the coupon being edited
                        setCurrentComponent("couponList")
                        fetchCoupons();
                    }}
                currency={currency}
                initialFormData={couponToEdit || couponFormDetails}
                products={brandProducts}
            />; 
        }
        if (currentComponent === "couponList") {
            return (
                <BrandCouponList
                    onAddCouponDetails={() => setCurrentComponent("addCoupon")}
                    data={filteredCoupons}
                    onUpdateCoupon={handleUpdateCoupon}
                    onUpdateCouponStatus={handleUpdateCouponStatus}
                    onViewStats={handleViewStats}
                    activeFilter={filter}
                    onFilterChange={setFilter}
                    couponCounts={couponCounts}
                />
            );
        }
    };

    return (
        <>
            {renderComponent()}

            {isStatsModalOpen && (
                <CouponStatsModal 
                    coupon={couponForStats}
                    onClose={handleCloseStatsModal}
                    currency={currency}
                />
            )}
        </>
    )
}

export default CouponClient