import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";
import { getProductWriteErrorStatus, requireAuthenticatedBrandUserId } from "@/actions/add-product/product-write-guards";
import { ProductDraftServiceError, saveVariantDraft } from "@/actions/add-product/product-draft-service";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        let brandId: string;
        try {
            brandId = await requireAuthenticatedBrandUserId(supabase);
        } catch {
            return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
        }

        const formData = await req.formData();
        const variantDetailsRaw = formData.get('variantDetails') as string;
        const productId = formData.get('productId') as string;
        const categoryName = formData.get('categoryName') as string;
        const displayOrderRaw = formData.get('displayOrder') as string;
        const images = formData.getAll('images') as File[];

        if (!variantDetailsRaw || !productId || !categoryName) {
            return NextResponse.json({ success: false, message: "Missing required form data." }, { status: 400 });
        }

        const displayOrder = Number.isNaN(Number(displayOrderRaw)) ? 0 : Number(displayOrderRaw);

        let variantDetails;
        try {
            variantDetails = JSON.parse(variantDetailsRaw);
        } catch {
            return NextResponse.json({ success: false, message: "Invalid JSON format for variant details." }, { status: 400 });
        }

        const result = await saveVariantDraft(supabase, brandId, {
            productId,
            categoryName,
            variantDetails,
            images,
            displayOrder,
        });

        return NextResponse.json({ 
            success: true, 
            message: "Variant saved successfully.",
            variantId: result.variantId,
            slug: result.slug,
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ProductDraftServiceError) {
            return NextResponse.json({
                success: false,
                message: error.message,
                errors: error.errors,
            }, { status: error.status });
        }
        console.error("Error in POST /api/products/upload-variant-details:", error);
        return NextResponse.json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        }, { status: getProductWriteErrorStatus(error) });
    }
}
