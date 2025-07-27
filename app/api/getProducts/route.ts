import { getProductList } from "@/actions/user-actions/product-and-data/get-product-list";
import { NextRequest, NextResponse } from "next/server";

interface ProductFilterQueryParams {
    brandId?: string;
    category?: string;
    productType?: string;
    color?: string;
    material?: string;
    limit?: number;
    offset?: number;
    // Add any other filter keys that your frontend might send
}

//Use this route for all customer facing getProducts call
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    // Initialize an object to hold the filters
    const filters: ProductFilterQueryParams = {};

    // Extract the brandId
    const brandId = searchParams.get("brandId");
    if (brandId) {
        filters.brandId = brandId;
    }

    // Extract other filter parameters dynamically
    // You should explicitly list the filter keys you expect to avoid
    // processing unexpected query parameters.
    const allowedFilterKeys = ['category', 'productType', 'color', 'material'];

    allowedFilterKeys.forEach(key => {
        const value = searchParams.get(key);
        if (value) {
            // Use a type assertion to assign to the correct property of filters
            (filters as any)[key] = value;
        }
    });

    try {
        const products = await getProductList(filters);

        console.log("Fetched products:", products);

        if(!products) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "No products found",
                    data: null
                },{ status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Products fetched successfully",
            data: products
        }, { status: 200 })
    } catch (error) {
        console.error("Failed to fetch products items:", error);
        return NextResponse.json({ 
                success: false, 
                message: error instanceof Error ? error.message : "An unexpected error occurred",
                data: null
        },{ status: 500 });
    }
}
