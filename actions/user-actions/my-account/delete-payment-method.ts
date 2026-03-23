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
        const { data: methodToDelete, error: fetchError } = await supabase
            .from("payment_methods")
            .select("id, is_default")
            .eq("id", id)
            .eq("user_id", userId)
            .maybeSingle();

        if (fetchError) {
            throw fetchError;
        }

        if (!methodToDelete) {
            return { success: false, error: "Payment method not found" };
        }

        const { error: deleteError } = await supabase
            .from("payment_methods")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (deleteError) {
            throw deleteError;
        }

        if (methodToDelete.is_default) {
            const { data: replacementMethod, error: replacementError } = await supabase
                .from("payment_methods")
                .select("id")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (replacementError) {
                throw replacementError;
            }

            if (replacementMethod) {
                const { error: promoteError } = await supabase
                    .from("payment_methods")
                    .update({ is_default: true })
                    .eq("id", replacementMethod.id)
                    .eq("user_id", userId);

                if (promoteError) {
                    throw promoteError;
                }
            }
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        }
    }
}

export default deletePaymentMethod;
