import { checkVariantStock } from '@/actions/user-actions/userCartActions/checkVariantStock';
import { NextRequest, NextResponse } from 'next/server';
import { updateCartItemQuantity, deleteCartItem } from '@/actions/user-actions/userCartActions/updateCartItem';

export async function POST(req: NextRequest) {
    try {
        const userType = req.nextUrl.searchParams.get('userType');
        const userId = req.nextUrl.searchParams.get('Id');
        const updateType = req.nextUrl.searchParams.get('updateType');
        const isAnonymous = userType === 'anonymous';

        if(!userType || !userId || !updateType) {
            console.log("Invalid request type!");
            return NextResponse.json({
                success: false,
                message: 'Invalid request type!',
                data: null
            }, { status: 400 });
        }

        switch (updateType) {
            case "quantityChange":
                const { quantity, id, variantId, size } = await req.json();
                
                // 1. Check stock first
                const stockCheck = await checkVariantStock(variantId, size, quantity);
                if (!stockCheck.success) {
                    return NextResponse.json({
                        success: false,
                        message: 'Variant out of stock',
                        data: null
                    }, { status: 400 });
                }

                // 2. Update quantity
                const updateResult = await updateCartItemQuantity(
                    quantity, 
                    id, 
                    userId, 
                    isAnonymous
                );

                if (!updateResult.success) {
                    return NextResponse.json({
                        success: false,
                        message: updateResult.error || 'Failed to update cart',
                        data: null
                    }, { status: 500 });
                }

                return NextResponse.json({
                    success: true,
                    message: 'Cart updated successfully',
                    data: {
                        newQuantity: updateResult.newQuantity,
                        newTotal: updateResult.newTotal,
                    }
                }, { status: 200 });

            case "itemDeletion": 
                const { cartId } = await req.json();

                const deleteItem = await deleteCartItem( cartId, userId, isAnonymous ) 
                
                if (!deleteItem.success) {
                    return NextResponse.json({
                        success: false,
                        message: deleteItem.error || 'Failed to delete cart item',
                        data: null
                    }, { status: 500 });
                }
                return NextResponse.json({
                    success: true,
                    message: 'Cart updated successfully',
                    data: {
                        newTotal: deleteItem.newTotal,
                        deletedId: deleteItem.deletedId
                    }
                }, { status: 200 });
            default:
                return NextResponse.json({
                    success: false,
                    message: 'Invalid update type',
                    data: null
                }, { status: 400 });
        }
    } catch (error) {
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