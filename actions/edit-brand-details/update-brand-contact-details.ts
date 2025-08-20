"use server"
import { createClient } from '@/supabase/server';
import type {BrandOnboarding} from '../../lib/types';
import { revalidatePath } from 'next/cache';

export const updateBrandContactDetails = async (data: BrandOnboarding["contactInformation"], userId: string, path?: string) => {
    const supabase = await createClient();
    try {
        const {data: basicContactData, error: basicContactDataError} = await supabase
            .from("brands_contact_details")
            .upsert({
                id: userId,
                brand_email: data.business_email,
                phone_number: data.phone_number,
            }, {
                onConflict: 'id'
            }).select();
        
        if (basicContactDataError) {
            return {
                success: false,
                message: basicContactDataError.message,
                data: null
            }
        }

        const {data: brandSocialLinks, error: brandSocialLinksError} = await supabase
            .from("brand_social_links")
            .upsert({
                id: userId,
                website: data.social_media.website,
                facebook: data.social_media.facebook,
                instagram: data.social_media.instagram,
                twitter: data.social_media.twitter,
                tiktok: data.social_media.tiktok,
            }, {
                onConflict: 'id'
            })
            .select();
        
        if(brandSocialLinksError) {
            return {
                success: false,
                message:  brandSocialLinksError.message,
                data: null
            }
        }

        if (path === "brandSocialLinks") {
            revalidatePath('/dashboard/brand-profile-management')
        }
        return {
            success: true,
            message: "Brand contact details and social links updated successfully.",
            data: null,
        };
        
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred.",
            data: null
        }
    }
}