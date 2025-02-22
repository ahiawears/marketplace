import { userGetCategoryProducts } from "@/actions/user-get-category-items";
import { createClient } from "@/supabase_change/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const catQuery = searchParams.get("cat");

    try {
        const supabase = await createClient();
        if (!catQuery) {
            return NextResponse.json(
                { error: "Query parameter is required" },
                { status: 400 }
            );
        }

        const productsItem = await userGetCategoryProducts(catQuery);

        if (!productsItem) {
            return NextResponse.json(
                { error: "No products items found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: productsItem });

    } catch (error) {
        console.error("Error fetching products categories: ", error);
        return NextResponse.json(
            { error: "Failed to fetch products items" },
            { status: 500 }
        );
    }
}