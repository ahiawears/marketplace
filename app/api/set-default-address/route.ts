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

        const { addressId } = await req.json();
        if (!addressId) {
            return NextResponse.json({ success: false, message: "Address ID is required." }, { status: 400 });
        }

        const { data: targetAddress, error: targetError } = await supabase
            .from("user_address")
            .select("id")
            .eq("id", addressId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (targetError) {
            return NextResponse.json({ success: false, message: targetError.message }, { status: 500 });
        }

        if (!targetAddress) {
            return NextResponse.json({ success: false, message: "Address not found." }, { status: 404 });
        }

        const { error: clearDefaultError } = await supabase
            .from("user_address")
            .update({ is_default: false })
            .eq("user_id", user.id)
            .eq("is_default", true);

        if (clearDefaultError) {
            return NextResponse.json({ success: false, message: clearDefaultError.message }, { status: 500 });
        }

        const { error: setDefaultError } = await supabase
            .from("user_address")
            .update({ is_default: true })
            .eq("id", addressId)
            .eq("user_id", user.id);

        if (setDefaultError) {
            return NextResponse.json({ success: false, message: setDefaultError.message }, { status: 500 });
        }

        revalidatePath("/my-account");
        revalidatePath("/place-order");
        return NextResponse.json({ success: true, message: "Default address updated successfully." });
    } catch (error) {
        console.error("Error setting default address:", error);
        return NextResponse.json({ success: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
    }
}
