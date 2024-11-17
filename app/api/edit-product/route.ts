import { editProduct } from "@/actions/edit-product";
import { Product } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const body: Product = await request.json();

  const { error } = await editProduct(body);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Product updated successfully" },
    { status: 200 }
  );
}
