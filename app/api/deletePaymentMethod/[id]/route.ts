import deletePaymentMethod from "@/actions/user-actions/my-account/delete-payment-method";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const { params } = context;

    const { id: methodId} = await params;
    if (!methodId || typeof methodId !== 'string') {
        return NextResponse.json({ error: 'Invalid payment method ID' }, { status: 400 });
    }

    try {
        const result = await deletePaymentMethod(methodId);

        if (result.success) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

    } catch ( error ) {
        console.error('Error deleting payment method:', error);
        return NextResponse.json({ error }, { status: 500 });
    }
}