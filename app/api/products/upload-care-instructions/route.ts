import { getProductWriteErrorStatus, requireAuthenticatedBrandUserId } from "@/actions/add-product/product-write-guards";
import { ProductDraftServiceError, saveCareDraft } from "@/actions/add-product/product-draft-service";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

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
        const careDetailsRaw = formData.get('careDetails') as string;

        if (!careDetailsRaw) {
            return NextResponse.json({ success: false, message: "Missing care details data." }, { status: 400 });
        }

        let careDetails;
        try {
            careDetails = JSON.parse(careDetailsRaw);
        } catch (error) {
            return NextResponse.json({ success: false, message: "Invalid JSON format for care details." }, { status: 400 });
        }

        await saveCareDraft(supabase, brandId, careDetails);

        return NextResponse.json({ success: true, message: "Care instructions saved successfully." });

    } catch (error) {
        if (error instanceof ProductDraftServiceError) {
            return NextResponse.json({
                success: false,
                message: error.message,
                errors: error.errors,
            }, { status: error.status });
        }
        console.error("Error in POST /api/products/upload-care-instructions:", error);
        return NextResponse.json({ 
            success: false, message: error instanceof Error ? error.message : "Internal server error" 
        }, { status: getProductWriteErrorStatus(error) });
    }
}
