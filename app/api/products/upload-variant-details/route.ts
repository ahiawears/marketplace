import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function POST (req: Request) {
    try{
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
        }
        const formData = await req.formData();
    } catch (error) {
        console.error("Error in POST /api/products/variants:", error);
        return NextResponse.json({
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error"
        }, { status: 500})
    }
}