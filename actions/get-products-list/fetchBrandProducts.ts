"use server";
import { createClient } from "@/supabase/server";

export interface BrandProductListItem {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    season: string;
}[];
export async function FetchBrandProducts(brandId: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('products_list')
            .select('id, name, category_id(name), subcategory_id(name), season_id(name)')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false });

        if (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: error.message,
            }
        }

        if (!data || data.length === 0) {
            console.log("No products found for the brand.");
            return {
                success: true,
                data: null,
                message: "No products found for the brand.",
            }
        }

        const dataToReturn: BrandProductListItem[] = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            category: product.category_id?.name,
            subcategory: product.subcategory_id?.name,
            season: product.season_id?.name,
        }))

        return {
            success: true,
            data: dataToReturn,
            message: "Products fetched successfully.",
        };
    } catch (error) {
        let errorMessage;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unknown error occurred.";
        }
        return {
            success: false,
            data: null,
            message: errorMessage,
        }
    }
}