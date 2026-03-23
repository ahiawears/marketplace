'use client';
import { FC, useEffect, useMemo, useState } from "react";
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
    currencyCode?: string;
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

const CouponClient: FC<CouponClientProps> = ({
    userId,
    currency,
    couponList,
    couponFormDetails,
    brandProducts,
}) => {
    const [currentComponent, setCurrentComponent] = useState<ComponentItems>("couponList");
    const [couponsList, setCouponsList] = useState<CouponClientProps["couponList"]>(couponList);
    const [filter, setFilter] = useState<CouponFilterStatus>('active');

    const [couponToEdit, setCouponToEdit] = useState<CouponFormDetails | null>(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [couponForStats, setCouponForStats] = useState<typeof couponsList[0] | null>(null);

    useEffect(() => {
        setCouponsList(couponList);
    }, [couponList]);

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
