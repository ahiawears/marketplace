import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Define the expected type for the size data
interface SizeData {
    size_id: string;
    quantity: number;
    sizes: { name: string | null } | { name: any }[]; // Handle both object and array cases
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const productId = params.id;

        // Validate the productId
        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const supabase = await createClient();

        // Fetch sizes and quantities
        const { data: sizesData, error: sizesError } = await supabase
            .from("product_sizes")
            .select(`
                size_id,
                quantity,
                sizes (
                    name
                )
            `)
            .eq("product_id", productId);

        // Handle errors or empty data
        if (sizesError || !sizesData) {
            console.error("Error fetching sizes data:", sizesError);
            return NextResponse.json(
                { error: "Sizes not found" },
                { status: 404 }
            );
        }

        // Transform the data to match frontend expectations
        const productWithSizes = {
            sizes: sizesData.map((size: SizeData) => {
                const name = Array.isArray(size.sizes)
                    ? size.sizes[0]?.name || "Unknown" // If array, use first element
                    : size.sizes?.name || "Unknown";  // If object, access `name` directly

                return {
                    size_id: size.size_id,
                    quantity: size.quantity,
                    name,
                };
            }),
        };

        // Return the transformed data
        return NextResponse.json({ data: productWithSizes });
    } catch (error) {
        console.error("Error in product details route:", error);
        return NextResponse.json(
            { error: "Failed to fetch product details" },
            { status: 500 }
        );
    }
}
