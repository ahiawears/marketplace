import { createProductShippingDetails } from "@/actions/add-product/create-shipping-details";
import { validateProductShippingDetails } from "@/lib/productDataValidation";
import { ProductShippingDeliveryType, ShippingConfigDataProps } from "@/lib/types";
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

        // Fetch the brand's main shipping configuration for validation
        const { data: brandShippingConfig, error: configError } = await supabase
            .from('shipping_configurations')
            .select('*')
            .eq('brand_id', user.id)
            .single();

        if (configError || !brandShippingConfig) {
            return NextResponse.json({ success: false, message: "Brand shipping configuration not found or could not be loaded." }, { status: 404 });
        }

        // Server-side validation
        const selectedMethods = Object.keys(productShippingConfig.methods || {}).map(key => {
            if (key === 'sameDay') return 'sameDayDelivery';
            if (key === 'standard') return 'standardShipping';
            if (key === 'express') return 'expressShipping';
            return '';
        }).filter(Boolean);

        // const { isValid, error: validationError } = validateProductShippingDetails(
        //     selectedMethods,
        //     productShippingConfig.methods,
        //     brandShippingConfig as unknown as ShippingConfigDataProps
        // );

        // if (!isValid) {
        //     return NextResponse.json({ success: false, message: validationError || "Validation failed" }, { status: 400 });
        // }

        // If valid, proceed to save the data
        const shippingDetailsId = await createProductShippingDetails(supabase, productShippingConfig);

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