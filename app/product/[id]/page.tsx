import ProductItem from '@/components/ui/product-item-detail'
import { getVariantById } from "@/actions/user-actions/product-and-data/get-variant-by-id";
import { createClient } from '@/supabase/server';
import { getServerAnonymousId } from '@/lib/anon_user/server';
import { getSavedProductById } from '@/actions/user-actions/product-and-data/get-saved-product-by-id';

interface Props {
    params: { id: string }
}

export default async function ProductDetail({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    console.log("The userId is ", userId);
    const userIdentifier = userId || await getServerAnonymousId();
    const isAnonymous = !userId;

    console.log("The id is ", id, " and the userIdentifier is ", userIdentifier, " and isAnonymous ", isAnonymous);

    const variantData = await getVariantById(id);
    const savedData = await getSavedProductById(id, userIdentifier, isAnonymous);
    
    if (!variantData.success || !variantData.data) {
        return { variantData: null, isSaved: false };
    }
    if(savedData.success){
        console.log(savedData);
    }

    return (
        <div className="">
            <ProductItem
                variantData={variantData.data}
                initialIsSaved={savedData.isSaved}
                serverUserIdentifier={userIdentifier}
                isAnonymous={isAnonymous}
            />
        </div>
    )
}