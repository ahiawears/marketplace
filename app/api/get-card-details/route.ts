import { NextResponse } from "next/server";

// Cache the access token to avoid re-fetching on every request.
let cachedToken: {
    token: string;
    expiry: number;
} | null = null;

/**
 * Fetches or retrieves a cached access token for the Flutterwave API.
 * This token is required for all API calls.
 */
async function getAccessToken() {
    const CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID; 
    const CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Flutterwave Client ID or Client Secret not configured.");
    }

    // Check if the cached token is still valid (expires in more than 60 seconds)
    if (cachedToken && cachedToken.expiry > Date.now() / 1000 + 60) {
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

/**
 * Next.js API route to fetch cardholder details securely.
 * It accepts an array of Flutterwave IDs and makes a secure GET request for each.
 */
export async function POST(req: Request) {
    try {
        // Get the list of Flutterwave IDs from the request body
        const { flutterwaveIds } = await req.json();

        if (!Array.isArray(flutterwaveIds)) {
            return NextResponse.json(
                { error: 'Invalid input. Expected an array of IDs.' },
                { status: 400 }
            );
        }
        
        // 1. Get the access token for Flutterwave
        const accessToken = await getAccessToken();

        // 2. Fetch details for each ID concurrently
        const fetchPromises = flutterwaveIds.map(async (id) => {
            const response = await fetch(`https://api.flutterwave.cloud/developersandbox/payment-methods/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`, 
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error(`Flutterwave API error for ID ${id}:`, error);
                // Return null or an error object for this specific ID
                return null;
            }

            const result = await response.json();
            
            // Return only the relevant data
            return {
                id
            };
        });

        // Wait for all promises to resolve
        const results = await Promise.all(fetchPromises);
        
        // Filter out any failed requests (where result is null)
        const successfulResults = results.filter(result => result !== null);

        return NextResponse.json({
            success: true,
            cardDetails: successfulResults,
        });
        
    } catch (error: any) {
        console.error('Internal server error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch card details' },
            { status: 500 }
        );
    }
}
