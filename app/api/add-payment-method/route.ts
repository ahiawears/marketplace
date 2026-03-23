import { addPaymentMethod } from "@/actions/user-actions/my-account/add-payment-method";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

let cachedToken: {
    token: string;
    expiry: number;
} | null = null;

const paymentMethodsUrl =
    process.env.FLUTTERWAVE_PAYMENT_METHODS_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://api.flutterwave.cloud/payment-methods"
        : "https://api.flutterwave.cloud/developersandbox/payment-methods");

async function getAccessToken() {
    const CLIENT_ID =
        process.env.FLUTTERWAVE_CLIENT_ID ||
        process.env.FLW_CLIENT_ID ||
        process.env.NEXT_PUBLIC_FLUTTERWAVE_CLIENT_ID;
    const CLIENT_SECRET =
        process.env.FLUTTERWAVE_CLIENT_SECRET ||
        process.env.FLW_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_FLUTTERWAVE_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Saving payment methods requires Flutterwave OAuth client credentials. Add FLUTTERWAVE_CLIENT_ID and FLUTTERWAVE_CLIENT_SECRET to your environment.");
    }

    // Check if the cached token is still valid
    console.log("Checking cached access token");
    if (cachedToken && cachedToken.expiry > Date.now() / 1000 + 60) {
        // Return cached token if it expires in more than 60 seconds
        return cachedToken.token;
    }
    console.log("Fetching new access token from Identity Provider");

    // Fetch a new token from the Identity Provider
    const response = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials',
        }).toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch access token:", errorData);
        throw new Error("Failed to authenticate with Flutterwave API.");
    }

    const data = await response.json();
    
    // Store the new token and its expiry time
    cachedToken = {
        token: data.access_token,
        expiry: Math.floor(Date.now() / 1000) + data.expires_in,
    };

    return cachedToken.token;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // 1. Get the access token
        const accessToken = await getAccessToken();

        // 2. Use the access token to make the API call
        const response = await fetch(paymentMethodsUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const rawResponse = await response.text();
        let flutterwavePayload: any = null;

        try {
            flutterwavePayload = rawResponse ? JSON.parse(rawResponse) : null;
        } catch {
            flutterwavePayload = { raw: rawResponse };
        }

        if (!response.ok) {
            console.error('Flutterwave API error:', flutterwavePayload);

            const detailedMessage =
                flutterwavePayload?.message ||
                flutterwavePayload?.error?.message ||
                flutterwavePayload?.errors?.[0]?.message ||
                flutterwavePayload?.raw ||
                'Failed to tokenize card';

            throw new Error(detailedMessage);
        }

        const flutterwaveResult = flutterwavePayload;

        if (!flutterwaveResult?.data?.card || !flutterwaveResult?.data?.id) {
            console.error("Unexpected Flutterwave payment-method response:", flutterwaveResult);
            throw new Error(
                flutterwaveResult?.message ||
                "Flutterwave did not return a usable payment method response."
            );
        }

        const { success, paymentMethod, error } = await addPaymentMethod(flutterwaveResult, body.card.card_holder_name);

        if (!success) throw new Error(error);
 
        revalidatePath('/my-account');
        
        return NextResponse.json({
            success: true,
            paymentMethod,
            message: 'Payment method added successfully'
        });
        
    } catch (error: any) {
        console.error('Internal server error:', error);
        return NextResponse.json(
            { error: error.message || 'Payment processing failed' },
            { status: 500 }
        );
    }
}
