import { createProductCareInstruction } from "@/actions/add-product/create-care-instruction";
import { ProductCareInstruction } from "@/lib/types";
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
        const careDetailsRaw = formData.get('careDetails') as string;
        if (!careDetailsRaw) {
            return NextResponse.json({ success: false, message: "Missing careDetails data" }, { status: 400 });
        }

        let careDetails: ProductCareInstruction;
        try {
            careDetails = JSON.parse(careDetailsRaw);
        } catch (error) {
            return NextResponse.json({ success: false, message: "Invalid JSON format" }, { status: 400 })
        }
        const productId = careDetails.productId;
        if ( !productId || typeof productId !== 'string' ) {
            return NextResponse.json({ success: false, message: "Missing or invalid productId" }, { status: 400 });
        }

        const productCareInstruction = await createProductCareInstruction(supabase, careDetails);

        if (!productCareInstruction) {
            return NextResponse.json({ success: false, message: "Failed to create product care instruction" }, { status: 500 });
        }
        return NextResponse.json({
            success: true,
            message: "Product care instruction created successfully",
            productCareInstructionId: productCareInstruction
        },{ status: 200 })
    } catch (error) {
        console.error("Error in POST /api/products/care-instruction", error instanceof Error ? error.message : error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        }, { status: 500 })
    }
}