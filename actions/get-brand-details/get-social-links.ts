'use server';

import { createClient } from "@/supabase/server";

interface BrandSocialLinks {
    brand_contact_details: {
        brand_email: string;  
        phone_number: string;
    };
    facebook: string;       
    instagram: string;      
    twitter: string;        
    tiktok: string;    
    website: string;         
}

interface BrandSocialLinksResponse {
    success: boolean;
    message?: string;
    data: BrandSocialLinks | null;
}
type SupabaseSocialLinksData = {
    instagram: string;
    facebook: string;
    twitter: string;
    website: string;
    tiktok: string;
    brand_contact_details: {
        brand_email: string;
        phone_number: string;
    };
};

export async function GetBrandSocialLinks(brandId: string): Promise<BrandSocialLinksResponse> {
    const supabase = await createClient();
    try {
        const { data: socialLinks, error: socialLinksError } = await supabase
            .from('brand_social_links')
            .select('instagram, facebook, twitter, website, tiktok, brand_contact_details:id(brand_email, phone_number)')
            .eq('id', brandId)
            .single<SupabaseSocialLinksData>(); 

        if (socialLinksError) {
            return {
                success: false,
                message: socialLinksError.message,
                data: null
            };
        }

        if (!socialLinks) {
            return {
                success: false,
                message: "No links found for the user.",
                data: null
            };
        }

        const mappedSocialLinks: BrandSocialLinks = {
            brand_contact_details: {
                brand_email: socialLinks.brand_contact_details?.brand_email || "",
                phone_number: socialLinks.brand_contact_details?.phone_number || ""
            },
            facebook: socialLinks.facebook || "",
            instagram: socialLinks.instagram || "",
            twitter: socialLinks.twitter || "",
            tiktok: socialLinks.tiktok || "",
            website: socialLinks.website || ""
        };

        return { success: true, message: "Social links fetched successfully", data: mappedSocialLinks };
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred",
            data: null
        };
    }
}