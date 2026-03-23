import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { applyCouponToCart, removeCouponFromCart } from "@/actions/coupons/cart-coupon-service";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sign in to apply a coupon." },
        { status: 401 }
      );
    }

    const { code } = (await req.json()) as { code?: string };
    const result = await applyCouponToCart(code || "", user.id);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to apply coupon.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sign in to remove a coupon." },
        { status: 401 }
      );
    }

    const { brandId } = (await req.json()) as { brandId?: string };
    if (!brandId) {
      return NextResponse.json(
        { success: false, message: "brandId is required." },
        { status: 400 }
      );
    }

    const result = await removeCouponFromCart(brandId, user.id);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove coupon.",
      },
      { status: 500 }
    );
  }
}
