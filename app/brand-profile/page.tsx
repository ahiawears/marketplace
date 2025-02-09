import { BrandHeroImageSection } from "@/components/brandProfile/brand-hero-image";
import { LookbookCarousel } from "@/components/lookbook-carousel";

export default function BrandProfile () {
    return (
        <div className="flex flex-1 flex-col">
            <BrandHeroImageSection />
            <p className="text-black text-center py-8 container">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </p>
            <div className="py-7">
                <LookbookCarousel />
            </div>
        </div>
    )
}