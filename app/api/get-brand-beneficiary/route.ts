import { GetBrandBeneficiaryDetails } from "@/actions/get-brand-details/get-brand-beneficiary-details";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        return NextResponse.json({
                Error: error.message
            },{
                status: 500
            }
        )
    }
    const userId = data.user.id; 
    try {
        const data = await GetBrandBeneficiaryDetails(userId)
        return NextResponse.json(data.data);
    } catch (error) {
        return NextResponse.json(
            { error },
            { status: 500 }
        );
    }
}