import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { requireAuthenticatedBrandUserId } from "@/actions/add-product/product-write-guards";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    let brandId: string;

    try {
      brandId = await requireAuthenticatedBrandUserId(supabase);
    } catch {
      return NextResponse.json(
        { success: false, message: "User not authenticated." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const productSizeId = typeof body.productSizeId === "string" ? body.productSizeId : "";
    const quantity = Number(body.quantity);

    if (!productSizeId || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json(
        { success: false, message: "A valid product size id and non-negative quantity are required." },
        { status: 400 }
      );
    }

    const { data: sizeRow, error: sizeError } = await supabase
      .from("product_sizes")
      .select("id, product_id")
      .eq("id", productSizeId)
      .maybeSingle();

    if (sizeError) {
      throw sizeError;
    }

    if (!sizeRow) {
      return NextResponse.json(
        { success: false, message: "Inventory row not found." },
        { status: 404 }
      );
    }

    const { data: variantRow, error: variantError } = await supabase
      .from("product_variants")
      .select("id, main_product_id")
      .eq("id", sizeRow.product_id)
      .maybeSingle();

    if (variantError) {
      throw variantError;
    }

    if (!variantRow) {
      return NextResponse.json(
        { success: false, message: "Variant not found." },
        { status: 404 }
      );
    }

    const { data: productRow, error: productError } = await supabase
      .from("products_list")
      .select("id")
      .eq("id", variantRow.main_product_id)
      .eq("brand_id", brandId)
      .maybeSingle();

    if (productError) {
      throw productError;
    }

    if (!productRow) {
      return NextResponse.json(
        { success: false, message: "This inventory item does not belong to your brand." },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from("product_sizes")
      .update({ quantity })
      .eq("id", productSizeId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, quantity }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/inventory/update-quantity:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
