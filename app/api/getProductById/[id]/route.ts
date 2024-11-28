import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const productId = params?.id;

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Fetch product data
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

        // Fetch all images for the product
        const { data: imagesData, error: imagesError } = await supabase
            .from("product_images")
            .select("image_url, is_main")
            .eq("product_id", productId);

        if (imagesError || !imagesData?.length) {
            console.error("Error fetching product images:", imagesError);
            return NextResponse.json(
                { error: "Product images not found" },
                { status: 404 }
            );
        }

        // Separate main image and thumbnails
        const mainImage = imagesData.find((img) => img.is_main);
        const thumbnails = imagesData.filter((img) => !img.is_main);

        // Generate public URLs for all images
        const generatePublicUrl = (imageUrl: string) => {
            const filename = imageUrl.split("/").pop();
            const { data: publicUrlData } = supabase.storage
                .from("product-images/products")
                .getPublicUrl(filename!);
            return publicUrlData?.publicUrl || null;
        };

        const mainImageUrl = mainImage ? generatePublicUrl(mainImage.image_url) : null;
        const thumbnailUrls = thumbnails.map((thumbnail) =>
            generatePublicUrl(thumbnail.image_url)
        );

        const productWithImages = {
            ...productData,
            main_image_url: mainImageUrl,
            image_urls: thumbnailUrls,
        };

        console.log(productWithImages);

        return NextResponse.json({ data: productWithImages });
    } catch (error) {
        console.error("Error in getProductById route:", error);
        return NextResponse.json(
            { error: "Failed to fetch product details" },
            { status: 500 }
        );
    }
}
