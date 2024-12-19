import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { transaction_reference, otp } = body;

        console.log("Received OTP and Reference:", { otp, transaction_reference });

        if (!transaction_reference || !otp) {
            return NextResponse.json({ status: "error", message: "Missing OTP or transaction reference" }, { status: 400 });
        }

        const response = await fetch("https://api.flutterwave.com/v3/validate-charge", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            },
            body: JSON.stringify({
                otp: otp.trim(),
                transaction_reference: transaction_reference.trim(),
            }),
        });

        const data = await response.json();
        console.log("Response from Flutterwave API:", data);

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
