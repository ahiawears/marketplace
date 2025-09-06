import { CreateCoupon } from "@/actions/brand-actions/create-coupon";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Request body for POST:", body);

        const supabase = await createClient();
        const { data: {user} } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
        }
        
        await CreateCoupon(body);
        return NextResponse.json({ success: true, message: "Coupon created successfully." });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
        }

        const { couponId, isActive } = await req.json();

        if (!couponId || typeof isActive !== 'boolean') {
            return NextResponse.json({ success: false, message: "Invalid request: couponId and isActive are required." }, { status: 400 });
        }

        const { data: existingCoupon, error: fetchError } = await supabase
            .from('coupons')
            .select('id')
            .eq('id', couponId)
            .eq('brand_id', user.id)
            .single();

        if (fetchError || !existingCoupon) {
            return NextResponse.json({ success: false, message: "Coupon not found or you do not have permission to update it." }, { status: 404 });
        }

        const { error: updateError } = await supabase
            .from('coupons')
            .update({ is_active: isActive })
            .eq('id', couponId);

        if (updateError) {
            console.error("Supabase update error:", updateError);
            return NextResponse.json({ success: false, message: `Failed to update coupon: ${updateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Coupon status updated successfully." });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error in PATCH /api/upsert-coupon:", errorMessage);
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}