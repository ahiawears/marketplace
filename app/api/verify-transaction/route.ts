import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
        return NextResponse.json(
            { error: "Transaction ID is required" },
            { status: 400 }
        );
    }

    try {
        const response = await axios.get(
            `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
            {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = response.data;
        console.log(data);

        if (data.status === "success" && data.data.status === "successful") {
            return NextResponse.json({
                success: true,
                status: data.data.status,
                amount: data.data.amount,
                currency: data.data.currency,
            });
        } else {
            return NextResponse.json(
                { success: false, error: "Transaction verification failed" },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Error verifying transaction:", error.message);
        return NextResponse.json(
            { success: false, error: "An error occurred during verification" },
            { status: 500 }
        );
    }
}
