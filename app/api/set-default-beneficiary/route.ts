import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    const supabase = await createClient();

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ success: false, message: "User not authenticated." }, { status: 401 });
        }

        const { beneficiaryId } = await req.json();
        if (!beneficiaryId) {
            return NextResponse.json({ success: false, message: "Beneficiary ID is required." }, { status: 400 });
        }

        const { data: targetAccount, error: targetError } = await supabase
            .from("brand_beneficiary_account_details")
            .select("id")
            .eq("beneficiary_id", beneficiaryId)
            .eq("brand_id", user.id)
            .maybeSingle();

        if (targetError) {
            return NextResponse.json({ success: false, message: targetError.message }, { status: 500 });
        }

        if (!targetAccount) {
            return NextResponse.json({ success: false, message: "Beneficiary account not found." }, { status: 404 });
        }

        const { error: clearDefaultError } = await supabase
            .from("brand_beneficiary_account_details")
            .update({ is_default: false })
            .eq("brand_id", user.id)
            .eq("is_default", true);

        if (clearDefaultError) {
            return NextResponse.json({ success: false, message: clearDefaultError.message }, { status: 500 });
        }

        const { error: setDefaultError } = await supabase
            .from("brand_beneficiary_account_details")
            .update({ is_default: true })
            .eq("beneficiary_id", beneficiaryId)
            .eq("brand_id", user.id);

        if (setDefaultError) {
            return NextResponse.json({ success: false, message: setDefaultError.message }, { status: 500 });
        }

        revalidatePath("/dashboard/payment-settings");
        return NextResponse.json({ success: true, message: "Default payout account updated successfully." });
    } catch (error) {
        console.error("Error setting default beneficiary:", error);
        return NextResponse.json({ success: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
    }
}
