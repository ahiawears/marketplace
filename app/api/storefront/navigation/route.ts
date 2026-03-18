import { NextResponse } from "next/server";

import { getStorefrontNavigation } from "@/actions/storefront/get-storefront-navigation";

export async function GET() {
  try {
    const categories = await getStorefrontNavigation();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load storefront navigation.",
        data: [],
      },
      { status: 500 }
    );
  }
}
