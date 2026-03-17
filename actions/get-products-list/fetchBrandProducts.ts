"use server";
import { createClient } from "@/supabase/server";

export interface BrandProductVariantListItem {
    id: string;
    name: string;
    sku: string;
}

export interface BrandProductListItem {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    season: string;
    variants: BrandProductVariantListItem[];
}

type ProductRow = {
    id: string;
    name: string;
    category_id: { name: string | null } | { name: string | null }[] | null;
    subcategory_id: { name: string | null } | { name: string | null }[] | null;
    season_id: { name: string | null } | { name: string | null }[] | null;
    product_variants:
        | {
              id: string;
              name: string | null;
              sku: string | null;
          }[]
        | null;
};

function getRelationName(
    relation: { name: string | null } | { name: string | null }[] | null
): string {
    if (Array.isArray(relation)) {
        return relation[0]?.name || "";
    }

    return relation?.name || "";
}

export async function FetchBrandProducts(brandId: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('products_list')
            .select('id, name, category_id(name), subcategory_id(name), season_id(name), product_variants(id, name, sku)')
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

        const dataToReturn: BrandProductListItem[] = ((data || []) as unknown as ProductRow[]).map((product) => ({
            id: product.id,
            name: product.name,
            category: getRelationName(product.category_id),
            subcategory: getRelationName(product.subcategory_id),
            season: getRelationName(product.season_id),
            variants: (product.product_variants || []).map((variant) => ({
                id: variant.id,
                name: variant.name || "",
                sku: variant.sku || "",
            })),
        }));

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
