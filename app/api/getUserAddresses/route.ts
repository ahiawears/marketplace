import { getUserAddress } from "@/actions/get-user-address";
import { createClient } from "@/supabase_change/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
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

        const userAddresses = await getUserAddress(userId);
        if (!userAddresses) {
            return NextResponse.json(
                { error: 'No user address found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: userAddresses});

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch cart items' },
            { status: 500 }
        );
    }
}