import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FetchBrandProducts } from "@/actions/get-products-list/fetchBrandProducts";
import LookbookClient, { LookbookListItem } from "@/components/brand-dashboard/lookbook-client";

export const metadata: Metadata = {
    title: "Lookbooks",
}

// TODO: Implement this server action to fetch lookbooks for the brand
async function GetLookbooks(): Promise<{ success: boolean, data?: LookbookListItem[], message?: string }> {
    const sampleLookbooks: LookbookListItem[] = [
        {
            id: '1',
            title: 'Summer 2024 Collection',
            is_published: true,
            created_at: new Date().toISOString(),
            cover_image_url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop',
            item_count: 12,
        },
        {
            id: '2',
            title: 'Autumn Essentials (Draft)',
            is_published: false,
            created_at: new Date().toISOString(),
            cover_image_url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop',
            item_count: 8,
        }
    ];
    return { success: true, data: sampleLookbooks };
}

export default async function LookbooksPage () {
    const supabase = await createClient();
    
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            redirect("/login-brand");
        }
        const userId = user.id;

        // Fetch brand products, which will be needed for tagging items in the lookbook editor
        const brandProductsResult = await FetchBrandProducts(userId);
        if (!brandProductsResult.success) {
             return (
                <div className="p-4">
                    <div className="bg-red-50 border border-red-200 p-4">
                        <h2 className="text-lg font-semibold text-red-800">Error Loading Products</h2>
                        <p className="text-red-600">
                            We couldn't load your products, which are required to create or manage lookbooks. 
                            Please try refreshing the page. If the problem persists, contact support.
                        </p>
                    </div>
                </div>
            );
        } else if (brandProductsResult.success && brandProductsResult.data === null) {
            return (
                <div className="p-4">
                    <div className="bg-red-50 border border-red-200 p-4">
                        <h2 className="text-lg font-semibold text-red-800">No Products Found</h2>
                        <p>
                            You need to upload products before you can create a lookbook.
                        </p>
                    </div>
                </div>
            )
        }
        const products = brandProductsResult.data;

        // Fetch existing lookbooks for the brand
        const lookbooksResult = await GetLookbooks();
        if (!lookbooksResult.success) {
            throw new Error(lookbooksResult.message);
        }
        const lookbookList = lookbooksResult.data || [];

        return (
            <div className="p-4">
                <LookbookClient 
                    userId={userId}
                    lookbookList={lookbookList}
                    brandProducts={products || []}
                />
            </div>
        )
    } catch (error) {
        console.error("Error in Lookbooks page:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-red-800">Error</h2>
                    <p className="text-red-600">{`Failed to load lookbooks: ${errorMessage}`}</p>
                </div>
            </div>
        );
    }
}
