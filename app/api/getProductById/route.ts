import { getVariantById } from "@/actions/user-actions/product-and-data/get-variant-by-id";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const variantId = searchParams.get('id');

        if (!variantId) {
            return NextResponse.json({
                success: false,
                message: 'Variant ID is required.',
                data: null
            }, {status: 400});
        }


        const variantDetails = await getVariantById(variantId);

        if (!variantDetails) {
            return NextResponse.json({
                success: false,
                message: 'Variant not found.',
                data: null
            }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            message: 'Variant fetched successfully.',
            data: variantDetails
        }, {status: 200})
    } catch (error) {
        return NextResponse.json({
            success: false, 
            message: error instanceof Error ? error.message : "An unexpected error occurred",
            data: null
        }, { status: 500 });
    }
}
