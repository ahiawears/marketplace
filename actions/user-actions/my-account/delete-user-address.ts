import { createClient } from "@/supabase/server";

const deleteUserAddress = async (id: string) => {
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
        const { data: addressToDelete, error: fetchError } = await supabase
            .from("user_address")
            .select("id, is_default")
            .eq("id", id)
            .eq("user_id", userId)
            .maybeSingle();

        if (fetchError) {
            throw fetchError;
        }

        if (!addressToDelete) {
            return { success: false, error: "Address not found" };
        }

        const { error: deleteError } = await supabase
            .from("user_address")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (deleteError) {
            throw deleteError;
        }

        if (addressToDelete.is_default) {
            const { data: replacementAddress, error: replacementError } = await supabase
                .from("user_address")
                .select("id")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (replacementError) {
                throw replacementError;
            }

            if (replacementAddress) {
                const { error: promoteError } = await supabase
                    .from("user_address")
                    .update({ is_default: true })
                    .eq("id", replacementAddress.id)
                    .eq("user_id", userId);

                if (promoteError) {
                    throw promoteError;
                }
            }
        }

        console.log(`Removed address id: `, id);
        return { success: true }; 
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
};

export default deleteUserAddress;
