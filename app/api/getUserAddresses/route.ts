import { getUserAddress } from "@/actions/user-actions/my-account/get-user-address";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const addresses = await getUserAddress();
    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
} 