import { GetCoupons } from "@/actions/brand-actions/get-coupons";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({
                success: false, 
                message: "Authentication required"
            }, {
                status: 401
            });
        }

        const data = await GetCoupons();
        if (!data.success) {
            return NextResponse.json({
                success: false,
                message: data.message,
                data: null
            }, {
                status: 500
            });
        }

        return NextResponse.json({
            success: true,
            message: "Coupons fetched successfully",
            data: data.data
        }, {
            status: 200
        });
    } catch (error) {
        let errorMessage;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unknown error occurred.";
        }
        return NextResponse.json({
            success: false,
            message: errorMessage,
            data: null
        }, {
            status: 500
        });
    }
}