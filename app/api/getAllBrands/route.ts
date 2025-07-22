import { getAllBrands } from "@/actions/user-actions/brands-and-data/get-all-brands";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const brands = await getAllBrands();
        console.log("Fetched brands:", brands);


        // Return a JSON response
        return NextResponse.json({
            success: true,
            message: "Brands fetched successfully",
            data: brands
        }, { status: 200 });

    } catch (error) {
        console.error("API Error fetching brands:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred",
            data: null
        }, { status: 500 });
    }
}