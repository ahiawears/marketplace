'use client';

import { BrandHeroImageSection } from "@/components/brandProfile/brand-hero-image";
import { LookbookCarousel } from "@/components/lookbook-carousel";
import { useParams } from "next/navigation";

const BrandProfile: React.FC = () => {
    const params = useParams();
    let brandId = params.brandid || "";

    return (
        <div className="flex flex-1 flex-col">
            <div className="mx-auto max-w-7xl border-2">

            </div>
        </div>
    )
}

export default BrandProfile