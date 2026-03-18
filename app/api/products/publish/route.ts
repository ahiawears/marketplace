import { NextResponse } from "next/server";

import { getProductWriteErrorStatus, requireAuthenticatedBrandUserId } from "@/actions/add-product/product-write-guards";
import { ProductDraftServiceError, publishProductDraft } from "@/actions/add-product/product-draft-service";
import { createClient } from "@/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const brandId = await requireAuthenticatedBrandUserId(supabase);
    const body = await req.json();

    const result = await publishProductDraft(supabase, brandId, {
      productId: body.productId,
      publishMode: body.publishMode,
      releaseDate: body.releaseDate,
      releaseDateIso: body.releaseDateIso,
      releaseTimezone: body.releaseTimezone,
    });

    return NextResponse.json({
      success: true,
      message: result.is_published ? "Product published successfully." : "Product scheduled successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof ProductDraftServiceError) {
      return NextResponse.json(
        { success: false, message: error.message, errors: error.errors },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: getProductWriteErrorStatus(error) }
    );
  }
}
