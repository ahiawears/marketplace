import { getDbPaymentDetails } from "@/actions/user-actions/my-account/getDbPaymentDetails";
import { NextResponse } from "next/server";

export async function GET() {
    try {
    const dbPaymentDetails = await getDbPaymentDetails();
    return NextResponse.json(dbPaymentDetails);
    
    } catch (error) {
        return NextResponse.json(
            {error},
            {status: 500 }
        )
    }
}