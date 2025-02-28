import { BrandDescriptionField } from "@/components/brand-dashboard/brand-description-field";
import { EditBrandLogo } from "@/components/brand-dashboard/edit-brand-logo";
import { EditBrandProfileHero } from "@/components/brand-dashboard/edit-brand-profile-hero";
import { SocialLinksForm } from "@/components/brand-dashboard/social-links-form";

export default function BrandProfilePage () {
    return (
        <div className="flex flex-1 flex-col space-y-10">
            
            {/* Brand Logo Section */}
            <div className="w-full">
                <EditBrandLogo />
            </div>

            {/* Brand Profile Hero */}
            <EditBrandProfileHero />

            {/* Brand Social Links */}
            <SocialLinksForm />

            {/* Brand Description */}
            <BrandDescriptionField />
        </div>
    );
}

// TODO:
// Hero Image:
// Brands should be able to add an hero image and a text which its position could be set
