// /app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCartItems } from '@/lib/cart';
import { createClient } from '@/supabase/server';
 
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
  
        const cartItems = await getCartItems(userId);

        if (!cartItems) {
            return NextResponse.json(
                { error: 'No cart items found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: cartItems });
    } catch (error) {
        console.error("Failed to fetch cart items:", error);
        return NextResponse.json(
            { error: 'Failed to fetch cart items' },
            { status: 500 }
        );
    }
}
