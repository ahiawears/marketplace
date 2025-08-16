import { createClient } from "@/supabase/server"

const deletePaymentMethod = async (id: string) => {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
        return { success: false, error: `Authentication error: ${authError.message}` };
    }

    const userId = authData.user?.id;
    if (!userId) {
        return { success: false, error: "User is not authenticated" };
    }

    try {
        const { error: deleteError } = await supabase
            .from("payment_methods")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (deleteError) {
            throw deleteError;
        } else  {
            return { success: true };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        }
    }
}

export default deletePaymentMethod;