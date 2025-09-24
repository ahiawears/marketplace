import { createProductShippingDetails } from "@/actions/add-product/create-shipping-details";
import { ProductShippingDeliveryType, ShippingConfigDataProps } from "@/lib/types";
import { ShippingDetailsValidationSchema } from "@/lib/validation-logics/add-product-validation/product-schema";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function POST (req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
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

        // Server-side validation using the shared Zod schema
        const validationResult = ShippingDetailsValidationSchema.safeParse(productShippingConfig);
        if (!validationResult.success) {
            return NextResponse.json({ 
                success: false, 
                message: "Validation failed",
                errors: validationResult.error.flatten() 
            }, { status: 400 });
        }

        // If valid, proceed to save the data
        // Using validationResult.data is safer as it ensures only validated and expected properties are passed on.
        const shippingDetailsId = await createProductShippingDetails(supabase, validationResult.data);

        return NextResponse.json({
            success: true,
            message: "Shipping details saved successfully!",
            shippingDetailsId: shippingDetailsId
        });

    } catch (error) {
        console.error("Error in POST /api/products/shipping", error instanceof Error ? error.message : error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        }, { status: 500});
    }
}