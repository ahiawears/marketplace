import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { requireAuthenticatedBrandUserId } from "@/actions/add-product/product-write-guards";
import { resetVariantDetails } from "@/actions/add-product/reset-variant-details";

type VariantLookupRow = {
  id: string;
  main_product_id: string;
  status: "active" | "inactive" | null;
  products_list:
    | {
        brand_id: string;
      }[]
    | null;
};

async function getOwnedVariant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  brandId: string,
  variantId: string
): Promise<VariantLookupRow> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, main_product_id, status, products_list!inner(brand_id)")
    .eq("id", variantId)
    .eq("products_list.brand_id", brandId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Variant not found or not accessible to this brand");
  }

  return data as unknown as VariantLookupRow;
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  try {
    const brandId = await requireAuthenticatedBrandUserId(supabase);
    const body = await req.json();
    const variantId = typeof body.variantId === "string" ? body.variantId : "";
    const nextStatus = body.status === "active" || body.status === "inactive" ? body.status : null;

    if (!variantId || !nextStatus) {
      return NextResponse.json(
        { success: false, message: "Variant ID and a valid status are required." },
        { status: 400 }
      );
    }

    await getOwnedVariant(supabase, brandId, variantId);

    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ status: nextStatus })
      .eq("id", variantId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update variant status.";
    const status = message === "User not authenticated" ? 401 : message === "Variant not found or not accessible to this brand" ? 403 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(req: Request) {
  const supabase = await createClient();

  try {
    const brandId = await requireAuthenticatedBrandUserId(supabase);
    const url = new URL(req.url);
    const variantId = url.searchParams.get("variantId") || "";

    if (!variantId) {
      return NextResponse.json({ success: false, message: "Variant ID is required." }, { status: 400 });
    }

    await getOwnedVariant(supabase, brandId, variantId);

    const { count, error: orderItemsError } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", variantId);

    if (orderItemsError) {
      throw orderItemsError;
    }

    if ((count || 0) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This variant has order history and cannot be deleted. Archive it instead.",
        },
        { status: 409 }
      );
    }

    await resetVariantDetails(supabase, variantId);

    const { error: deleteVariantError } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    if (deleteVariantError) {
      throw deleteVariantError;
    }

    return NextResponse.json({ success: true, variantId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete variant.";
    const status = message === "User not authenticated" ? 401 : message === "Variant not found or not accessible to this brand" ? 403 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
