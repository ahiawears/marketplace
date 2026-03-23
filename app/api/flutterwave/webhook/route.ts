import axios from "axios";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createOrderFromVerifiedPayment } from "@/actions/orders/create-order-from-verified-payment";

interface FlutterwaveWebhookData {
    id?: number | string;
    tx_ref?: string | null;
    flw_ref?: string | null;
    status?: string | null;
    customer?: {
        email?: string | null;
        name?: string | null;
    } | null;
}

interface FlutterwaveWebhookPayload {
    event?: string | null;
    type?: string | null;
    data?: FlutterwaveWebhookData | null;
}

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

interface UserRow {
    id: string;
}

const getServiceRoleClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Supabase service role credentials are not configured for webhook reconciliation.");
    }

    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Unexpected webhook processing error.";

const getWebhookTransactionId = (payload: FlutterwaveWebhookPayload) =>
    payload.data?.id ? String(payload.data.id) : null;

const getWebhookEmail = (payload: FlutterwaveWebhookPayload) =>
    payload.data?.customer?.email?.trim().toLowerCase() || null;

const isProcessableWebhook = (payload: FlutterwaveWebhookPayload) => {
    const marker = `${payload.event || ""} ${payload.type || ""} ${payload.data?.status || ""}`.toLowerCase();
    return marker.includes("charge") || marker.includes("payment") || marker.includes("successful");
};

export async function POST(req: Request) {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const receivedHash = req.headers.get("verif-hash");

        if (secretHash) {
            const normalizedReceivedHash = receivedHash || "";
        if (
            !normalizedReceivedHash ||
            normalizedReceivedHash.length !== secretHash.length ||
            !crypto.timingSafeEqual(Buffer.from(normalizedReceivedHash), Buffer.from(secretHash))
        ) {
            return NextResponse.json({ success: false, message: "Invalid webhook signature." }, { status: 401 });
        }
    }

    try {
        const payload = (await req.json()) as FlutterwaveWebhookPayload;
        const transactionId = getWebhookTransactionId(payload);

        if (!transactionId || !isProcessableWebhook(payload)) {
            return NextResponse.json({ success: true, ignored: true });
        }

        const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json(
                { success: false, message: "FLUTTERWAVE_SECRET_KEY is not configured." },
                { status: 500 }
            );
        }

        const verifyResponse = await axios.get<FlutterwaveVerifyResponse>(
            `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
            {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const verifyPayload = verifyResponse.data;
        const verifiedData = verifyPayload.data;

        if (
            verifyPayload.status !== "success" ||
            !verifiedData ||
            verifiedData.status !== "successful"
        ) {
            return NextResponse.json({ success: true, ignored: true, reason: "verification_not_successful" });
        }

        const customerEmail =
            verifiedData.customer?.email?.trim().toLowerCase() || getWebhookEmail(payload);

        if (!customerEmail) {
            return NextResponse.json(
                { success: false, message: "Verified transaction did not include a customer email for reconciliation." },
                { status: 400 }
            );
        }

        const supabase = getServiceRoleClient();
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", customerEmail)
            .maybeSingle<UserRow>();

        if (userError || !user?.id) {
            return NextResponse.json(
                { success: false, message: "Could not resolve the customer account for webhook reconciliation." },
                { status: 404 }
            );
        }

        const orderResult = await createOrderFromVerifiedPayment(
            user.id,
            verifiedData,
            verifyPayload,
            supabase
        );

        if (!orderResult.success) {
            return NextResponse.json(
                { success: false, message: orderResult.error || "Webhook reconciliation failed." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            created: orderResult.created,
            orderId: orderResult.orderId,
            orderNumber: orderResult.orderNumber,
        });
    } catch (error) {
        console.error("Flutterwave webhook error:", getErrorMessage(error));
        return NextResponse.json(
            { success: false, message: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
