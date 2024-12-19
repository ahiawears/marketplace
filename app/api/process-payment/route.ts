import { NextResponse } from "next/server";
import { encrypt3DES } from "@/lib/encryption";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { cardNumber, expiryMonth, expiryYear, cvv, amount } = body;

        if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !amount) {
            return NextResponse.json(
                { status: "error", message: "All fields are required" },
                { status: 400 }
            );
        }

        const encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY || "";
        if (!encryptionKey || encryptionKey.length !== 24) {
            throw new Error("Invalid encryption key.");
        }

        const payload = {
            tx_ref: `tx-${Date.now()}`,
            redirect_url: "https://ff83-93-182-107-141.ngrok-free.app/payment-confirmation",
            card_number: cardNumber,
            cvv,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            currency: "NGN",
            amount,
            email: "jaycole946@gmail.com",
        };

        const encryptedPayload = encrypt3DES(JSON.stringify(payload), encryptionKey);

        const response = await fetch("https://api.flutterwave.com/v3/charges?type=card", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            },
            body: JSON.stringify({ client: encryptedPayload }),
        });

        const data = await response.json();
        console.log(data);

        if (data.status === "success") {
            const authorization = data.meta?.authorization;

            if (authorization.mode === "otp") {
                return NextResponse.json({
                    status: "pending",
                    message: "OTP required",
                    flw_ref: data.data.flw_ref,
                    tx_ref: data.data.tx_ref,
                    transactionId: data.data.id,
                });
            } else if(authorization?.mode === "redirect"){
                return NextResponse.json({
                    status: "pending",
                    message: "Redirect required",
                    redirect_url: authorization.redirect,
                    tx_ref: data.data.tx_ref,
                    transactionId: data.data.id,
                });
            } else{
                return NextResponse.json(
                    { status: "error", message: data.message || "Payment failed" },
                    { status: 400 }
                );
            }
        }

        // if (data.status === "success") {
        //     const authorization = data.meta?.authorization;

        //     if (authorization?.mode === "otp") {
        //         return NextResponse.json({
        //             status: "pending",
        //             message: "OTP required",
        //             flw_ref: data.data.flw_ref,
        //         });
        //     } else if (authorization?.mode === "redirect") {
        //         return NextResponse.json({
        //             status: "pending",
        //             message: "Redirect required",
        //             redirect_url: authorization.redirect,
        //         });
        //     }

        //     return NextResponse.json({ status: "success", message: "Payment processed successfully!" });
        // }

        // return NextResponse.json(
        //     { status: "error", message: data.message || "Payment failed" },
        //     { status: 400 }
        // );
    } catch (error: any) {
        console.error("Error:", error.message || "Unknown error occurred.");
        return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
    }
}
