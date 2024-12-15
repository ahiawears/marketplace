import { NextResponse } from "next/server";
import { encrypt3DES } from "@/lib/encryption";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { cardNumber, expiryMonth, expiryYear, cvv, email, amount } = body;

        // Log request body
        console.log("Request Body:", body);

        const payload = {
            card_number: cardNumber,
            cvv,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            currency: "NGN",
            amount,
            email: "jaycole946@gmail.com",
            tx_ref: `tx-${Date.now()}`,
        };

        // Encrypt payload using 3DES
        const encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY || ""; // Ensure this is 24 characters
        if (encryptionKey.length !== 24) {
            console.error("Invalid encryption key length:", encryptionKey.length);
            throw new Error("Encryption key must be exactly 24 characters long.");
        }

        const encryptedPayload = encrypt3DES(JSON.stringify(payload), encryptionKey);

        // Log encrypted payload
        console.log("Encrypted Payload:", encryptedPayload);

        // Send encrypted payload to Flutterwave
        const response = await fetch("https://api.flutterwave.com/v3/charges?type=card", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, // Your Flutterwave secret key
            },
            body: JSON.stringify({
                client: encryptedPayload, // Send encrypted payload as `client`
            }),
        });

        const data = await response.json();

        // Log Flutterwave response
        console.log("Flutterwave Response:", data);

        if (data.status === "success") {
            return NextResponse.json({ status: "success", message: data.message });
        } else {
            return NextResponse.json({ status: "error", message: data.message }, { status: 400 });
        }
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
    }
}
