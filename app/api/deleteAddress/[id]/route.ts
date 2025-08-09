import deleteUserAddress from "@/actions/user-actions/my-account/delete-user-address";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const { params } = context;

    const { id: addressId } = await params;

    if (!addressId || typeof addressId !== "string") {
        return NextResponse.json({ error: "Address ID is required and must be a string" }, { status: 400 });
    }

    try {
        const result = await deleteUserAddress(addressId);

        if (result.success) {
            return NextResponse.json({ message: "Address deleted successfully" }, { status: 200 });
        } else {
            return NextResponse.json({ error: result.error || "Failed to delete address" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error deleting address:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
