import { getProductWriteErrorStatus, requireAuthenticatedBrandUserId } from '@/actions/add-product/product-write-guards';
import { ProductDraftServiceError, saveGeneralDetailsDraft } from '@/actions/add-product/product-draft-service';
import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

export async function POST (req: Request) {
    try {
        const supabase = await createClient();
        let brandId: string;
        try {
            brandId = await requireAuthenticatedBrandUserId(supabase);
        } catch {
            return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
        }
        const formData = await req.formData();
        const generalDetailsRaw = formData.get('generalDetails') as string;

        if (!generalDetailsRaw) {
            return NextResponse.json({ success: false, message: "Missing generalDetails data" }, { status: 400 });
        }
        let generalDetails;
        try {
            generalDetails = JSON.parse(generalDetailsRaw);
        } catch {
            return NextResponse.json({ success: false, message: "Invalid JSON format" }, { status: 400 });
        }

        const result = await saveGeneralDetailsDraft(supabase, brandId, generalDetails);

        return NextResponse.json({
            success: true,
            message: "Product created successfully",
            productUploadId: result.productUploadId,
            slug: result.slug
        });
    } catch (error) {
        if (error instanceof ProductDraftServiceError) {
            return NextResponse.json({
                success: false,
                message: error.message,
                errors: error.errors,
            }, { status: error.status });
        }
        console.error("Error in POST /api/products/general:", error);
        return NextResponse.json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        }, { status: getProductWriteErrorStatus(error) });
    }
}
