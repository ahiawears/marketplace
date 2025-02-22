import { createClient } from "@/supabase_change/server";

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
        const { error: deleteError } = await supabase
            .from("user_address")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (deleteError) {
            return { success: false, error: `Failed to remove saved item: ${deleteError.message}` };
        }

        console.log(`Removed address id: `, id);
        return { success: true }; // Indicate success
    } catch (error) {
        return { success: false, error: error || "Unknown error occurred" };
    }
};

export default deleteUserAddress;
