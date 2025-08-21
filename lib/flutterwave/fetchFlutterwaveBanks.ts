export async function FetchFlutterwaveBanks(countryAlpha: string) {
    const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!FLUTTERWAVE_SECRET_KEY) {
        throw new Error("FLUTTERWAVE_SECRET_KEY is not set.");
    }

    const bankURL = `https://api.flutterwave.com/v3/banks/${countryAlpha}`;
    const options = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
        }
    };
    const bankResponse = await fetch(bankURL, options);
    if (!bankResponse.ok) {
        throw new Error("Failed to fetch banks from Flutterwave.");
    }
    const bankData = await bankResponse.json();

    return bankData.data;
}