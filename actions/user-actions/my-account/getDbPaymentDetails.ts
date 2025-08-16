import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

interface getDbPaymentDetails {
    id: string;
    expiry_month: number;
    expiry_year: number;
    card_brand: string;
    last_four: string;
    flutterwave_id: string;
    is_default: boolean;
    card_holder: string
}

export const getDbPaymentDetails = async (): Promise<getDbPaymentDetails[]> => {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            redirect('/log-in');
        }

        const {data, error} = await supabase
            .from("payment_methods")
            .select(`id, last_four, expiry_month, expiry_year, card_brand, flutterwave_id, is_default, card_holder`)
            .eq("user_id", user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw new Error("Failed to fetch user payment methods. Please try again later.");
        }

        if (!data || data.length === 0) {
            return [];
        }

        return data as getDbPaymentDetails[];
    } catch (error) {
        console.error("Error in getDbPaymentDetails: ", error);

         if (error instanceof Error) {
            throw new Error(error.message);
        }
        
        throw new Error("An unexpected error occurred while fetching payentMethods.");
    }
}