import { createClient } from "@/supabase/server";
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
    const supabase = await createClient();
    
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ success: false, message: "User not authenticated." }, { status: 401 });
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, message: "Beneficiary ID is required." }, { status: 400 });
        }

        const { data: accountToDelete, error: accountLookupError } = await supabase
            .from('brand_beneficiary_account_details')
            .select('id, is_default')
            .eq('beneficiary_id', id)
            .eq('brand_id', user.id)
            .maybeSingle();

        if (accountLookupError) {
            return NextResponse.json({ success: false, message: accountLookupError.message }, { status: 500 });
        }

        if (!accountToDelete) {
            return NextResponse.json({ success: false, message: "Beneficiary account not found." }, { status: 404 });
        }

        // 1. Delete from Flutterwave (Optional but recommended)
        const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
        const flutterwaveDeleteUrl = `https://api.flutterwave.com/v3/beneficiaries/${id}`;
        const deleteResponse = await fetch(flutterwaveDeleteUrl, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}` },
        });
        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            console.error("Flutterwave deletion error:", errorData);
            return NextResponse.json({ success: false, message: "Failed to delete beneficiary from Flutterwave." }, { status: 400 });
        }

        // 2. Delete from your Supabase database
        const { error: dbError } = await supabase
            .from('brand_beneficiary_account_details')
            .delete()
            .eq('beneficiary_id', id)
            .eq('brand_id', user.id); // Ensure only the owner can delete it

        if (dbError) {
            console.error("Database deletion error:", dbError);
            return NextResponse.json({ success: false, message: "Failed to delete beneficiary from database." }, { status: 500 });
        }

        if (accountToDelete.is_default) {
            const { data: fallbackAccount } = await supabase
                .from('brand_beneficiary_account_details')
                .select('beneficiary_id')
                .eq('brand_id', user.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();

            if (fallbackAccount?.beneficiary_id) {
                await supabase
                    .from('brand_beneficiary_account_details')
                    .update({ is_default: true })
                    .eq('beneficiary_id', fallbackAccount.beneficiary_id)
                    .eq('brand_id', user.id);
            }
        }

        return NextResponse.json({ success: true, message: "Beneficiary deleted successfully." });

    } catch (error) {
        console.error("An unexpected error occurred:", error);
        return NextResponse.json({ success: false, message: "An unexpected error occurred. Please try again." }, { status: 500 });
    }
}
