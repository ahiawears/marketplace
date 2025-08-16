"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPaymentMethod(flutterwaveResult: any, card_holder: string) {
    const supabase = await createClient();
  
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("Authentication required");
        }

        // Extract the non-sensitive card data from the Flutterwave response
        const cardData = flutterwaveResult?.data?.card;
        if (!cardData) {
            throw new Error('Failed to retrieve card data from Flutterwave response.');
        }

        // Insert the payment method into the database
        const { data: paymentMethod, error: dbError } = await supabase
            .from('payment_methods')
            .insert({
                user_id: user.id,
                flutterwave_id: flutterwaveResult.data.id,
                card_brand: cardData.network,
                last_four: cardData.last4,
                expiry_month: parseInt(cardData.expiry_month),
                expiry_year: parseInt(cardData.expiry_year),
                card_holder: card_holder,
            })
            .select()
            .single();
            
        if (dbError) {
            console.error('Supabase insert error:', dbError);
            throw new Error('Failed to save payment method to database.');
        }

        revalidatePath("/my-account");
        
        return { 
            success: true,
            paymentMethod 
        };

    } catch (error) {
        console.error("Failed to save payment method:", error);
        return { 
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
