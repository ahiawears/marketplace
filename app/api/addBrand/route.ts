import { AddBrandDetails } from "@/actions/add-brand";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.json(); // Parse JSON body
        const result = await AddBrandDetails(formData);

        return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error) {
        console.error("Error adding brand:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}