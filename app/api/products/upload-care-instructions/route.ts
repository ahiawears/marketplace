import { createProductCareInstruction } from "@/actions/add-product/create-care-instruction";
import { CareDetailsValidationSchema } from "@/lib/validation-logics/add-product-validation/product-schema";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
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

        // Server-side validation using the shared Zod schema
        const validationResult = CareDetailsValidationSchema.safeParse(careDetails);
        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                message: "Validation failed",
                errors: validationResult.error.flatten(),
            }, { status: 400 });
        }

        // Assuming an action exists to handle the database interaction
        await createProductCareInstruction(supabase, validationResult.data);

        return NextResponse.json({ success: true, message: "Care instructions saved successfully." });

    } catch (error) {
        console.error("Error in POST /api/products/upload-care-instructions:", error);
        return NextResponse.json({ 
            success: false, message: error instanceof Error ? error.message : "Internal server error" 
        }, { status: 500 });
    }
}