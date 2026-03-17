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
            .maybeSingle<SupabaseSocialLinksData>(); 

        if (socialLinksError) {
            return {
                success: false,
                message: socialLinksError.message,
                data: null
            };
        }

        const safeSocialLinks = socialLinks || {
            instagram: "",
            facebook: "",
            twitter: "",
            website: "",
            tiktok: "",
            brand_contact_details: {
                brand_email: "",
                phone_number: "",
            },
        };

        const mappedSocialLinks: BrandSocialLinks = {
            brand_contact_details: {
                brand_email: safeSocialLinks.brand_contact_details?.brand_email || "",
                phone_number: safeSocialLinks.brand_contact_details?.phone_number || ""
            },
            facebook: safeSocialLinks.facebook || "",
            instagram: safeSocialLinks.instagram || "",
            twitter: safeSocialLinks.twitter || "",
            tiktok: safeSocialLinks.tiktok || "",
            website: safeSocialLinks.website || ""
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
