import { createClient } from "@/supabase/server"

interface CheckSavedProps {
    userId: string;
    variantId: string;
}

export async function checkIfProductIsSaved({ userId, variantId }: CheckSavedProps): Promise<boolean> {
    const supabase = await createClient();
}