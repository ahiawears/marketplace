import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const productId = params.id; 

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data: productData, error: productError } = await supabase
            .from("products_list")
            .select("*")
            .eq("id", productId)
            .single();

        if (productError || !productData) {
            console.error("Error fetching product data:", productError);
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Fetch the main image for the product
        const { data: imageData, error: imageError } = await supabase
            .from("product_images")
            .select("image_url")
            .eq("product_id", productId)
            .eq("is_main", true)
            .single();

        if (imageError || !imageData) {
            console.error("Error fetching product image:", imageError);
            return NextResponse.json(
                { error: "Product image not found" },
                { status: 404 }
            );
        }

        // Generate public URL for the main image
        const filename = imageData.image_url.split("/").pop();
        const { data: publicUrlData } = supabase.storage
            .from("product-images/products")
            .getPublicUrl(filename);

        const productWithImage = {
            ...productData,
            main_image_url: publicUrlData?.publicUrl || null,
        };

        return NextResponse.json({ data: productWithImage });
    } catch (error) {
        console.error("Error in getProductById route:", error);
        return NextResponse.json(
            { error: "Failed to fetch product details" },
            { status: 500 }
        );
    }
}
