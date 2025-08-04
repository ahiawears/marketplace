import ProductItem from '@/components/ui/product-item-detail'
import { getVariantById } from "@/actions/user-actions/product-and-data/get-variant-by-id";

interface Props {
    params: { id: string }
}

export default async function ProductDetail({ params }: Props) {
    const { id } = await params;

    const variantData = await getVariantById(id);
    console.log("Variant data received:", {
        id: variantData.data?.id,
        hasRelated: !!variantData.data?.relatedVariantIds,
        hasSizes: !!variantData.data?.sizes,
        hasTags: !!variantData.data?.tags
    });
    
    if (!variantData.success || !variantData.data) {
        return { variantData: null, isSaved: false };
    }

    return (
        <div className="">
            <ProductItem
                variantData={variantData.data}
                initialIsSaved={false}
            />
        </div>
    )
}