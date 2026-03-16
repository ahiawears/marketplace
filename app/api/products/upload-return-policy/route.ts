import { getProductWriteErrorStatus, requireAuthenticatedBrandUserId } from "@/actions/add-product/product-write-guards";
import { ProductDraftServiceError, saveReturnPolicyDraft } from "@/actions/add-product/product-draft-service";
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
        const returnPolicyRaw = formData.get('returnPolicyData') as string;

        if (!returnPolicyRaw) {
            return NextResponse.json ({ success: false, message: "Missing return policy data." }, { status: 400 });
        }

        let returnPolicyData;
        try {
            returnPolicyData = JSON.parse(returnPolicyRaw);
        } catch (error) {
            return NextResponse.json({ success: false, message: "Invalid JSON format for return policy data." }, { status: 400 });
        }

        await saveReturnPolicyDraft(supabase, brandId, returnPolicyData);

        return NextResponse.json({ success: true, message: "Return policy saved successfully." });
    } catch (error) {
        if (error instanceof ProductDraftServiceError) {
            return NextResponse.json({
                success: false,
                message: error.message,
                errors: error.errors,
            }, { status: error.status });
        }
        console.error("Error in POST /api/products/upload-return-policy:", error);
        return NextResponse.json({ 
            success: false, message: error instanceof Error ? error.message : "Internal server error" 
        }, { status: getProductWriteErrorStatus(error) });
    }
}
