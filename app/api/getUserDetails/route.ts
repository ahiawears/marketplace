import { getUserDetails } from "@/actions/user-auth/get-user-details";
import { createClient } from "@/supabase/server";
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
                { error: 'User Id required'},
                { status: 400 }
            );
        }

        const userDetails = await getUserDetails();

        if (!userDetails) {
            return NextResponse.json(
                { error: 'No Products items found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: userDetails });
    } catch (error) {
        console.error("Failed to fetch user items:", error);
        return NextResponse.json(
            { error: 'Failed to fetch user items' },
            { status: 500 }
        );
    }
}