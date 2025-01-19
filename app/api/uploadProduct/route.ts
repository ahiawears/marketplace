import { UploadProductDetails } from "@/actions/upload-product-details";
import { NextResponse } from "next/server";

// POST Handler
export async function POST(req: Request) {
  try {
    // Parse form data (multipart/form-data is not natively handled)
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      throw new Error("Invalid content type. Expected multipart/form-data.");
    }

    const formData = await req.formData(); // Extract FormData

    // Upload product details
    const productId = await UploadProductDetails(formData);

    // Return a success response
    return NextResponse.json({ productId }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST handler:", error.message || error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred." },
      { status: 400 }
    );
  }
}
