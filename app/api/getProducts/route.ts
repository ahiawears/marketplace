import { userGetProductItems } from "@/actions/user-get-product-lists";
import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error("Error fetching brand:", error);
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const userId = data.user?.id;

        if (!userId) {
            return NextResponse.json(
                { error: "User ID required" },
                { status: 400 }
            );
        }

        if (!query) {
            return NextResponse.json(
                { error: "Query parameter is required" },
                { status: 400 }
            );
        }

        const productsItem = await userGetProductItems(query);

        if (!productsItem) {
            return NextResponse.json(
                { error: "No products items found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: productsItem });
    } catch (error) {
        console.error("Failed to fetch products items:", error);
        return NextResponse.json(
            { error: "Failed to fetch products items" },
            { status: 500 }
        );
    }
}
