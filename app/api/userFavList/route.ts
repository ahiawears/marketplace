import { getSavedItems } from "@/actions/user-get-saved-items";
import { createClient } from "@/supabase_change/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error("Error fetching user:", error);
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        const userId = data.user?.id;
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            );
        }

        const savedItems = await getSavedItems(userId);

        if (!savedItems) {
            return NextResponse.json(
                { error: 'No cart items found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: savedItems });
    } catch (error) {
        console.error("Failed to fetch favoritedItems: ", error);
        return NextResponse.json(
            { error: 'Failed to fetch cart items' },
            { status: 500 }
        );
    }

}