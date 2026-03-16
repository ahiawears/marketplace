import { getProductWriteErrorStatus, requireAuthenticatedBrandUserId } from "@/actions/add-product/product-write-guards";
import { ProductDraftServiceError, saveShippingDraft } from "@/actions/add-product/product-draft-service";
import { ProductShippingDeliveryType } from "@/lib/types";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

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
        const productShippingConfigRaw = formData.get("productShippingConfig");
        if (!productShippingConfigRaw || typeof productShippingConfigRaw !== 'string') {
            return NextResponse.json({ success: false, message: "Shipping configuration not provided" }, { status: 400 });
        }
        let productShippingConfig: ProductShippingDeliveryType;
        try {
            productShippingConfig = JSON.parse(productShippingConfigRaw);
        } catch (error) {
            console.error("Error parsing productShippingConfig JSON: ", error);
            return NextResponse.json({
                success:false,
                message: "Invalid shipping configuration format"
            }, { status: 400})
        }

        const result = await saveShippingDraft(supabase, brandId, productShippingConfig);

        return NextResponse.json({
            success: true,
            message: "Shipping details saved successfully!",
            shippingDetailsId: result.shippingDetailsId
        });

    } catch (error) {
        if (error instanceof ProductDraftServiceError) {
            return NextResponse.json({
                success: false,
                message: error.message,
                errors: error.errors,
            }, { status: error.status });
        }
        console.error("Error in POST /api/products/shipping", error instanceof Error ? error.message : error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        }, { status: getProductWriteErrorStatus(error)});
    }
}
