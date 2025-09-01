'use client';
import { FC, useMemo, useState } from "react";
import BrandCouponList from "./brand-coupons-list";
import AddCouponForm from "../ui/add-coupon-form";
import CouponStatsModal from "../modals/coupon-stats-modal";
import DeleteModal from "../modals/delete-modal";
import { toast } from "sonner";

type ComponentItems = "addCoupon" | "couponList";
type CouponFilterStatus = 'all' | 'active' | 'inactive' | 'expired';
export interface CouponFormDetails {
    // Section 1: Basic Information
    name: string;
    code: string;
    description?: string;


    // Section 2: Discount Type and Value
    discountType: "percentage" | "fixed" | "free_shipping";
    discountValue?: number;
    baseCurrencyDiscountValue?: number;
    currencyCode?: string; 

    // Section 3: Restrictions and Limits
    usageLimit?: number;
    singleUsePerCustomer: boolean;
    minOrderAmount?: number;

    //Setion 4: Validity and status
    startDate: string;
    endDate?: string | null;
    isActive: boolean;

    //Section 5: Eligibility
    appliesTo: "entire_store" | "products" | "categories";
    includedProductIds?: string[];
    excludedProductIds?: string[];
    includedCategoryIds?: string[];
    excludedCategoryIds?: string[];
    eligibleCustomers: 'all_customers' | 'new_customers' | 'returning_customers' | 'specific_customers';
    allowedCountries?: string[];
}

export interface CouponClientProps {
    userId: string;
    currency: string;
    couponList: {
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
            recentOrders: {
                orderId: string;
                customerName: string;
                date: string;
                amount: number;
            }[];
        };
    }[];
    couponFormDetails: CouponFormDetails;
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
    couponFormDetails
}) => {
    const [currentComponent, setCurrentComponent] = useState<ComponentItems>("couponList");
    const [couponsList, setCouponsList] = useState<CouponClientProps["couponList"]>(couponList.length > 0 ? couponList : sampleCoupons);
    const [filter, setFilter] = useState<CouponFilterStatus>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [couponForStats, setCouponForStats] = useState<typeof couponsList[0] | null>(null);

    const fetchCoupons = async () => {
        // Mock fetching coupons
        toast.info("Refreshing coupon list...");
        // In a real app, this would be an API call
        // For now, we just reset to sample data or passed data
        setCouponsList(couponList.length > 0 ? couponList : sampleCoupons);
        toast.success("Coupons refreshed!");
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

    const handleDeleteCoupon = (couponId: string) => {
        setCouponToDelete(couponId);
        setIsModalOpen(true);
    };

    const confirmDeletion = async () => {
        if (!couponToDelete) return;

        setIsModalOpen(false);
        const deletionToastId = toast.loading("Deleting coupon...");

        // Mock API call
        setTimeout(() => {
            setCouponsList(prev => prev.filter(c => c.id !== couponToDelete));
            toast.success("Coupon deleted successfully", { id: deletionToastId });
            setCouponToDelete(null);
        }, 1000);
    };
    
    const cancelDeletion = () => {
        setIsModalOpen(false);
        setCouponToDelete(null);
    };

    const handleUpdateCoupon = (couponId: string) => {
        // Here you would likely navigate to the add/edit form with the coupon's data pre-filled
        console.log("Editing coupon:", couponId);
        // For now, let's just switch to the form view
        setCurrentComponent("addCoupon");
        toast.info(`Loading coupon ${couponId} for editing...`);
    }

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

        // Mock API call to update status
        setTimeout(() => {
            setCouponsList(prev =>
                prev.map(c => (c.id === couponId ? { ...c, isActive } : c))
            );
            toast.success(`Coupon is now ${isActive ? 'active' : 'inactive'}.`, { id: statusToastId });
        }, 500);
    };

    const renderComponent = () => {
        if (currentComponent === "addCoupon") {
            return <AddCouponForm />; // This form needs to be implemented to handle add/edit
        }
        if (currentComponent === "couponList") {
            return (
                <BrandCouponList
                    onAddCouponDetails={() => setCurrentComponent("addCoupon")}
                    data={filteredCoupons}
                    onUpdateCoupon={handleUpdateCoupon}
                    onDeleteCoupon={handleDeleteCoupon}
                    onUpdateCouponStatus={handleUpdateCouponStatus}
                    onViewStats={handleViewStats}
                    activeFilter={filter}
                    onFilterChange={setFilter}
                    couponCounts={couponCounts}
                />
            );
        }
    };

    const couponName = couponsList.find(c => c.id === couponToDelete)?.name || "this coupon";

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

            {isModalOpen && (
                <DeleteModal
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete the coupon "${couponName}"? This action cannot be undone.`}
                    onDelete={confirmDeletion}
                    onCancel={cancelDeletion}
                />
            )}
        </>
    )
}

export default CouponClient