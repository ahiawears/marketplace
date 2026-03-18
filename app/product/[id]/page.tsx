import ProductItem from '@/components/ui/product-item-detail'
import { getVariantBySlug } from "@/actions/user-actions/product-and-data/get-variant-by-id";
import { createClient } from '@/supabase/server';
import { getServerAnonymousId } from '@/lib/anon_user/server';
import { getSavedProductById } from '@/actions/user-actions/product-and-data/get-saved-product-by-id';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { cache } from 'react';

interface Props {
    params: Promise<{ id: string }>
}

const getProduct = cache(async (id: string) => {
    return await getVariantBySlug(id);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const variantData = await getProduct(id); // Same call
    
    if (!variantData.success || !variantData.data) {
        return { title: "Product Not Found" };
    }
    
    return { title: variantData.data.name };
}



export default async function ProductDetail({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    const userIdentifier = userId || await getServerAnonymousId();
    const isAnonymous = !userId;


    const variantData = await getProduct(id);
    
    if (!variantData.success || !variantData.data) {
        notFound();
    }

    const savedData = await getSavedProductById(variantData.data.id, userIdentifier, isAnonymous);

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
