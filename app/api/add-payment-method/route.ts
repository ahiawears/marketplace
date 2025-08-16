import { addPaymentMethod } from "@/actions/user-actions/my-account/add-payment-method";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

let cachedToken: {
    token: string;
    expiry: number;
} | null = null;

async function getAccessToken() {
    const CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID; 
    const CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Flutterwave Client ID or Client Secret not configured.");
    }

    // Check if the cached token is still valid
    if (cachedToken && cachedToken.expiry > Date.now() / 1000 + 60) {
        // Return cached token if it expires in more than 60 seconds
        return cachedToken.token;
    }

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
        const response = await fetch('https://api.flutterwave.cloud/developersandbox/payment-methods', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Flutterwave API error:', error);
            throw new Error(error.message || 'Failed to tokenize card');
        }

        const flutterwaveResult = await response.json();

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