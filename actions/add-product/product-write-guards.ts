export async function requireAuthenticatedBrandUserId(supabase: any): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("User not authenticated");
    }

    return user.id;
}

export async function assertBrandOwnsProduct(
    supabase: any,
    brandId: string,
    productId: string
): Promise<void> {
    const { data, error } = await supabase
        .from("products_list")
        .select("id")
        .eq("id", productId)
        .eq("brand_id", brandId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error("Product not found or not accessible to this brand");
    }
}

export function getProductWriteErrorStatus(error: unknown): number {
    if (!(error instanceof Error)) {
        return 500;
    }

    if (error.message === "User not authenticated") {
        return 401;
    }

    if (error.message === "Product not found or not accessible to this brand") {
        return 403;
    }

    return 500;
}
