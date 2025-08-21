import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: user, error } = await supabase.auth.getUser();

    if (error) {
        return NextResponse.json({
            success: false, 
            message: error.message
        }, {status: 400})
    }
    const userId = user.user.id;
    try {   
        const formData = await req.json();
        const account_number = formData.account_number;
        const account_bank = formData.account_bank;
        const beneficiary_name = formData.beneficiary_name;
        const currency = formData.currency;
        const bank_name = formData.bank_name;

        const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
        if (!FLUTTERWAVE_SECRET_KEY) {
            return NextResponse.json({
                success: false,
                message: "Server configuration error: FLUTTERWAVE_SECRET_KEY is not set."
            }, { status: 500 });
        }
        
        // Resolve beneficiary details 
        const resolveURL = `https://api.flutterwave.com/v3/accounts/resolve`
        const resolveOptions = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account_number: account_number,
                account_bank: account_bank,
            })
        };

        const resolveResponse = await fetch(resolveURL, resolveOptions);
        const resolveData = await resolveResponse.json();
        if (resolveData.status !== 'success' || !resolveData.data) {
            return NextResponse.json({
                success: false,
                message: resolveData.message || "Failed to resolve account details."
            }, { status: 400 });
        }
        
        const verifiedBankAccountName = resolveData.data.account_name;
        if (verifiedBankAccountName.toLowerCase() !== beneficiary_name.toLowerCase()) {
            return NextResponse.json({
                success: false,
                message: "Beneficiary name does not match the account name. Please verify the details."
            }, { status: 400 });
        }

        // Create Beneficiary 
        const createBeneficiaryURL = 'https://api.flutterwave.com/v3/beneficiaries';
        const createBeneficiaryOptions = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_bank: account_bank,
                account_number: account_number,
                beneficiary_name: beneficiary_name,
                currency: currency,
                bank_name: bank_name,
            })
        }

        const createBeneficiaryResponse = await fetch(createBeneficiaryURL, createBeneficiaryOptions);
        const beneficiaryData = await createBeneficiaryResponse.json();
        if (beneficiaryData.status !== 'success') {
            return NextResponse.json({
                success: false,
                message: beneficiaryData.message || "Failed to create beneficiary with Flutterwave."
            }, { status: 400 });
        }

        const preparedDataForDb = {
            brand_id: userId,
            beneficiary_name: beneficiaryData.data.full_name,
            bank_code: beneficiaryData.data.bank_code,
            account_number: beneficiaryData.data.account_number,
            bank_name: beneficiaryData.data.bank_name,
            beneficiary_id: beneficiaryData.data.id,
            currency: currency
        }

        const { error: dbError } = await supabase  
            .from('brand_beneficiary_account_details')
            .insert(preparedDataForDb);

        if (dbError) {
            return NextResponse.json({
                success: false,
                message: dbError.message
            }, { status: 500 });
        }
        revalidatePath('/dashboard/payment-settings');
        return NextResponse.json({
            success: true,
            message: "Payment account and beneficiary created successfully."
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success: false, 
            message: "An unexpected error occured. Please try again."
        }, { status: 500 });
    }
}