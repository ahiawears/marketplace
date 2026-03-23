import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ success: false, message: "User not authenticated." }, { status: 401 });
        }

        const { paymentMethodId } = await req.json();
        if (!paymentMethodId) {
            return NextResponse.json({ success: false, message: "Payment method ID is required." }, { status: 400 });
        }

        const { data: targetMethod, error: targetError } = await supabase
            .from("payment_methods")
            .select("id")
            .eq("id", paymentMethodId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (targetError) {
            return NextResponse.json({ success: false, message: targetError.message }, { status: 500 });
        }

        if (!targetMethod) {
            return NextResponse.json({ success: false, message: "Payment method not found." }, { status: 404 });
        }

        const { error: clearDefaultError } = await supabase
            .from("payment_methods")
            .update({ is_default: false })
            .eq("user_id", user.id)
            .eq("is_default", true);

        if (clearDefaultError) {
            return NextResponse.json({ success: false, message: clearDefaultError.message }, { status: 500 });
        }

        const { error: setDefaultError } = await supabase
            .from("payment_methods")
            .update({ is_default: true })
            .eq("id", paymentMethodId)
            .eq("user_id", user.id);

        if (setDefaultError) {
            return NextResponse.json({ success: false, message: setDefaultError.message }, { status: 500 });
        }

        revalidatePath("/my-account");
        revalidatePath("/place-order");
        return NextResponse.json({ success: true, message: "Default payment method updated successfully." });
    } catch (error) {
        console.error("Error setting default payment method:", error);
        return NextResponse.json({ success: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
    }
}
