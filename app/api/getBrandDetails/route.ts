import { NextResponse } from "next/server";
import { getBrandData } from "@/actions/user-actions/brands-and-data/get-brand-data";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('id'); 

    if (!brandId) {
        return NextResponse.json({
            success: false,
            message: 'Brand ID is required.',
            data: null
        }, { status: 400 });
    }

    try {
        const brandDetails = await getBrandData(brandId);
        
        if(brandDetails === null){
            return NextResponse.json({
                success: false, 
                message: "Brand not found",
                data: null
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Brand details fetched successfully",
            data: brandDetails
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: error instanceof Error ? error.message : "An unexpected error occurred",
            data: null
        }, { status: 500 });
    }
}
