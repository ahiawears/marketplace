import { CouponListItem } from "@/components/brand-dashboard/coupon-client";
import { CountryData } from "@/lib/country-data";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

interface GetCouponResponse {
    success: boolean;
    message: string;
    data: CouponListItem[] | null;
}
export async function GetCoupons (): Promise<GetCouponResponse> {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            redirect('/login-brand');
        }
        const brandId = user.id;

        const { data: coupons, error: couponsError } = await supabase
            .from('coupons')
            .select('*')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false });

        if (couponsError) {
            return {
                success: false,
                message: couponsError.message,
                data: null
            }
        }

        if (!coupons || coupons.length === 0) {
            return {
                success: true,
                message: 'No coupons found',
                data: []
            }
        }

        const couponIds = coupons.map(coupon => coupon.id);

        //Fetch related data from other tables
        const [
            { data: countriesData },
            { data: productsData },
            { data: categoriesData }
        ] = await Promise.all([
            supabase
                .from('coupon_countries')
                .select('coupon_id, country_code')
                .in('coupon_id', couponIds),
            supabase
                .from('coupon_products')
                .select('coupon_id, products_list(name)')
                .in('coupon_id', couponIds),
            supabase
                .from('coupon_categories')
                .select('coupon_id, categories(name)')
                .in('coupon_id', couponIds)
        ]);

        // Process related data into maps for efficient lookup
        const countriesByCouponId = new Map<string, string[]>();
        countriesData?.forEach(item => {
            if (!countriesByCouponId.has(item.coupon_id)) {
                countriesByCouponId.set(item.coupon_id, []);
            }
            countriesByCouponId.get(item.coupon_id)!.push(item.country_code);
        });

        const productsByCouponId = new Map<string, string[]>();
        productsData?.forEach(item => {
            if (Array.isArray(item.products_list)) {
                if (!productsByCouponId.has(item.coupon_id)) {
                    productsByCouponId.set(item.coupon_id, []);
                }
                item.products_list.forEach(product => {
                    if (product.name) {
                        productsByCouponId.get(item.coupon_id)!.push(product.name);
                    }
                });
            }
        });

        const categoriesByCouponId = new Map<string, string[]>();
        categoriesData?.forEach(item => {
            if (Array.isArray(item.categories)) {
                if (!categoriesByCouponId.has(item.coupon_id)) {
                    categoriesByCouponId.set(item.coupon_id, []);
                }
                item.categories.forEach(category => {
                    if (category.name) {
                        categoriesByCouponId.get(item.coupon_id)!.push(category.name);
                    }
                });
            }
        });

        // Transform the raw coupon data into the desired CouponListItem format
        const transformedCoupons: CouponListItem[] = coupons.map(coupon => {
            // TODO: Fetch real stats for each coupon. For now, using default values.
            const defaultStats = {
                totalUses: 0,
                totalRevenue: 0,
                avgOrderValue: 0,
                recentOrders: [],
            };

            return {
                id: coupon.id,
                name: coupon.name,
                code: coupon.code,
                discountType: coupon.discount_type,
                discountValue: coupon.discount_value || 0,
                baseCurrencyDiscountValue: coupon.base_currency_discount_value,
                startDate: coupon.start_date,
                endDate: coupon.end_date,
                isActive: coupon.is_active,
                created_at: coupon.created_at,
                stats: defaultStats,
            };
        });

        console.log("Transformed Coupons:", transformedCoupons);

        return {
            success: true,
            message: "Coupons fetched successfully",
            data: transformedCoupons
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching coupons:", errorMessage);
        return {
            success: false,
            message: errorMessage,
            data: null
        }
    }
}