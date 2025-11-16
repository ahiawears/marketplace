import { createReturnPolicy } from "@/actions/add-product/create-return-policy";
import { validateReturnPolicy } from "@/lib/validation-logics/add-product-validation/product-schema";
import { createClient } from "@/supabase/server";
import { error } from "console";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
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

        // Server-side validation using the shared Zod schema
        const validationResult = validateReturnPolicy(returnPolicyData);
        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                message: "Validation failed",
                errors: validationResult.error.flatten(),
            }, { status: 400 });
        }

        await createReturnPolicy(validationResult.data);

        return NextResponse.json({ success: true, message: "Return policy saved successfully." });
    } catch (error) {
        console.error("Error in POST /api/products/upload-return-policy:", error);
        return NextResponse.json({ 
            success: false, message: error instanceof Error ? error.message : "Internal server error" 
        }, { status: 500 });
    }
}