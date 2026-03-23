import crypto from "crypto";
import { NextResponse } from "next/server";
import { encrypt3DES } from "@/lib/encryption";
import { createClient } from "@/supabase/server";

interface ProcessPaymentRequestBody {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    amount?: number;
    currency?: string;
    email?: string;
    fullname?: string;
    txRef?: string;
    authorization?: {
        mode?: string;
        pin?: string;
    };
}

interface FlutterwaveChargeAuthorization {
    mode?: string;
    redirect?: string;
}

interface FlutterwaveChargeResponse {
    status?: string;
    message?: string;
    meta?: {
        authorization?: FlutterwaveChargeAuthorization;
    };
    data?: {
        id?: number | string;
        flw_ref?: string;
        tx_ref?: string;
    };
}

const persistChargeSnapshot = async ({
    txRef,
    flwRef,
    transactionId,
    amount,
    currency,
    gatewayStatus,
    verificationStatus,
    rawChargeResponse,
}: {
    txRef: string;
    flwRef?: string;
    transactionId?: string | number;
    amount: number;
    currency: string;
    gatewayStatus?: string;
    verificationStatus: string;
    rawChargeResponse: unknown;
}) => {
    const supabase = await createClient();

    const { data: existing } = await supabase
        .from("order_payments")
        .select("id")
        .eq("tx_ref", txRef)
        .maybeSingle<{ id: string }>();

    const payload = {
        tx_ref: txRef,
        flw_ref: flwRef || null,
        flutterwave_transaction_id: transactionId ? String(transactionId) : null,
        expected_amount: amount,
        currency_code: currency,
        gateway_status: gatewayStatus || null,
        verification_status: verificationStatus,
        raw_charge_response: rawChargeResponse,
        processed_at: null,
    };

    if (existing?.id) {
        await supabase.from("order_payments").update(payload).eq("id", existing.id);
        return;
    }

    await supabase.from("order_payments").insert(payload);
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return "Unknown error occurred.";
};

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as ProcessPaymentRequestBody;
        const { cardNumber, expiryMonth, expiryYear, cvv, amount, currency, email, fullname, txRef, authorization } = body;

        if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !amount || !currency || !email || !fullname) {
            return NextResponse.json(
                { status: "error", message: "All fields are required" },
                { status: 400 }
            );
        }

        const encryptionKey =
            process.env.FLUTTERWAVE_V3_ENCRYPTION_KEY ||
            process.env.FLW_V3_ENCRYPTION_KEY ||
            process.env.FLUTTERWAVE_ENCRYPTION_KEY ||
            "";

        if (!encryptionKey || encryptionKey.length !== 24) {
            return NextResponse.json(
                {
                    status: "error",
                    message:
                        "Checkout requires a 24-character Flutterwave v3 encryption key. Set FLUTTERWAVE_V3_ENCRYPTION_KEY in your environment.",
                },
                { status: 500 }
            );
        }

        const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json(
                { status: "error", message: "FLUTTERWAVE_SECRET_KEY is not configured." },
                { status: 500 }
            );
        }

        const requestUrl = new URL(req.url);
        const redirectUrl = `${requestUrl.origin}/payment-confirmation`;

        const resolvedTxRef = txRef || `AHIA-CART-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

        const payload = {
            tx_ref: resolvedTxRef,
            redirect_url: redirectUrl,
            card_number: cardNumber,
            cvv,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            currency,
            amount,
            email,
            fullname,
            ...(authorization?.mode ? { authorization } : {}),
        };

        const encryptedPayload = encrypt3DES(JSON.stringify(payload), encryptionKey);

        const response = await fetch("https://api.flutterwave.com/v3/charges?type=card", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${secretKey}`,
            },
            body: JSON.stringify({ client: encryptedPayload }),
        });

        const rawResponse = await response.text();
        let data: FlutterwaveChargeResponse = {};

        try {
            data = rawResponse ? (JSON.parse(rawResponse) as FlutterwaveChargeResponse) : {};
        } catch {
            return NextResponse.json(
                {
                    status: "error",
                    message: rawResponse || "Flutterwave returned an unreadable response.",
                },
                { status: 502 }
            );
        }

        await persistChargeSnapshot({
            txRef: resolvedTxRef,
            flwRef: data.data?.flw_ref,
            transactionId: data.data?.id,
            amount,
            currency,
            gatewayStatus: data.status,
            verificationStatus: response.ok ? "charge_response_received" : "charge_failed",
            rawChargeResponse: data,
        });

        if (data.message?.toLowerCase().includes("authorization data required")) {
            return NextResponse.json(
                {
                    status: "authorization_required",
                    message: data.message,
                    authorizationMode: "pin",
                    tx_ref: resolvedTxRef,
                },
                { status: 200 }
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                {
                    status: "error",
                    message: data.message || "Payment request failed.",
                    tx_ref: resolvedTxRef,
                },
                { status: response.status }
            );
        }

        if (data.status === "success") {
            const authMeta = data.meta?.authorization;
            const chargeData = data.data;

            if (!chargeData) {
                return NextResponse.json(
                    { status: "error", message: data.message || "Payment response did not include charge data." },
                    { status: 502 }
                );
            }

            if (authMeta?.mode === "pin") {
                return NextResponse.json({
                    status: "authorization_required",
                    message: data.message || "Additional card authorization is required.",
                    authorizationMode: "pin",
                    tx_ref: chargeData.tx_ref,
                    transactionId: chargeData.id,
                });
            }

            if (authMeta?.mode === "otp") {
                return NextResponse.json({
                    status: "pending",
                    message: "OTP required",
                    flw_ref: chargeData.flw_ref,
                    tx_ref: chargeData.tx_ref,
                    transactionId: chargeData.id,
                });
            } else if (authMeta?.mode === "redirect") {
                return NextResponse.json({
                    status: "pending",
                    message: "Redirect required",
                    redirect_url: authMeta.redirect,
                    tx_ref: chargeData.tx_ref,
                    transactionId: chargeData.id,
                });
            } else {
                return NextResponse.json(
                    { status: "error", message: data.message || "Payment failed" },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { status: "error", message: data.message || "Payment failed" },
            { status: 400 }
        );
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Error:", message);
        return NextResponse.json({ status: "error", message }, { status: 500 });
    }
}
