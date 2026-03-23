import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@/supabase/server";
import { createOrderFromVerifiedPayment } from "@/actions/orders/create-order-from-verified-payment";

interface FlutterwaveVerifyCustomer {
    name?: string | null;
    email?: string | null;
}

interface FlutterwaveVerifyData {
    id?: number | string;
    tx_ref?: string | null;
    flw_ref?: string | null;
    amount?: number | string | null;
    currency?: string | null;
    status?: string | null;
    customer?: FlutterwaveVerifyCustomer | null;
}

interface FlutterwaveVerifyResponse {
    status?: string;
    message?: string;
    data?: FlutterwaveVerifyData;
}

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "An unexpected error occurred during verification.";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
        return NextResponse.json(
            { success: false, message: "Transaction ID is required" },
            { status: 400 }
        );
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
        return NextResponse.json(
            { success: false, message: "FLUTTERWAVE_SECRET_KEY is not configured." },
            { status: 500 }
        );
    }

    try {
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
            return NextResponse.json(
                { success: false, message: "You must be signed in to verify this checkout." },
                { status: 401 }
            );
        }

        const response = await axios.get<FlutterwaveVerifyResponse>(
            `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
            {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const verifyPayload = response.data;
        const verifiedData = verifyPayload.data;

        if (
            verifyPayload.status !== "success" ||
            !verifiedData ||
            verifiedData.status !== "successful"
        ) {
            return NextResponse.json(
                { success: false, message: "Transaction verification failed." },
                { status: 400 }
            );
        }

        const orderResult = await createOrderFromVerifiedPayment(
            authData.user.id,
            verifiedData,
            verifyPayload
        );

        if (!orderResult.success) {
            return NextResponse.json(
                { success: false, message: orderResult.error || "Verified payment could not be converted into an order." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            status: verifiedData.status,
            amount: verifiedData.amount,
            currency: verifiedData.currency,
            orderId: orderResult.orderId,
            orderNumber: orderResult.orderNumber,
            created: orderResult.created,
        });
    } catch (error) {
        console.error("Error verifying transaction:", getErrorMessage(error));
        return NextResponse.json(
            { success: false, message: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
