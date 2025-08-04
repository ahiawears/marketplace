import { checkVariantStock } from '@/actions/user-actions/userCartActions/checkVariantStock';
import { upsertCart } from '@/actions/user-actions/userCartActions/upsertCart';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try{
        const { variantId, size, quantity = 1 } = await req.json();

        const userType = req.nextUrl.searchParams.get('userType');
        const userId = req.nextUrl.searchParams.get('Id');

        if (!variantId || !size) {
            console.log("Invalid request! Product id or size is missing");
            return NextResponse.json({
                success: false,
                message: 'Invalid request! Product id or size is missing',
                data: null
            }, { status: 400 });
        }

        if (!userType || !userId) {
            console.log("Invalid request! user type or user id is missing");
            return NextResponse.json({
                success: false,
                message: 'Invalid request! User type or user id is missing',
                data: null
            }, { status: 400 })
        }

        console.log("Checking if variant exists with ", variantId, size, quantity);

        // Check if the variant exists and has the selected size in stock
        const { success: variantAvailable, sizeId } = await checkVariantStock(variantId, size, quantity);

        if (!variantAvailable) {
            console.log("Variant out of stock");
            return NextResponse.json({
                success: false,
                message: 'Variant out of stock',
                data: null
            }, { status: 400 });
        }

        const { success, cartId, newTotal } = await upsertCart({
            variantId,
            sizeId,
            quantity,
            isAnonymous: userType === 'anonymous',
            userId
        });

        if (!success) {
            return NextResponse.json({
                success: false,
                message: 'Failed to update cart',
                data: null
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Cart updated successfully',
            data: { cartId, newTotal }
        }, { status: 200 });

    } catch ( error ) {
        console.log(error instanceof Error ? error.message : "An unexpected error occured");
        return NextResponse.json({
            success: false, 
            message: error instanceof Error ? error.message : "An unexpected error occured",
            data: null
        }, {
            status: 500
        })
    }
}