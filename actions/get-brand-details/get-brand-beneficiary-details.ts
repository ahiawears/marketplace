import { createClient } from "@/supabase/server";

interface BeneficiaryData {
    id: string;
    beneficiary_id: number;
    beneficiary_name: string;
    bank_name: string;
    bank_code: string;
    account_number: string;
    currency: string;
    created_at: string;
}

interface BrandBeneficiaryResponse {
    success: boolean;
    message: string;
    data: BeneficiaryData[] | null;
}

export async function GetBrandBeneficiaryDetails(brandId: string): Promise<BrandBeneficiaryResponse> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('brand_beneficiary_account_details')
            .select('*')
            .eq('brand_id', brandId);

        if (error) {
            return {
                success: false,
                message: error.message,
                data: null
            }
        }

        const returnData: BeneficiaryData[] = data.map((item: any) => ({
            id: item.id,
            beneficiary_id: item.beneficiary_id,
            beneficiary_name: item.beneficiary_name,
            bank_name: item.bank_name,
            bank_code: item.bank_code,
            account_number: item.account_number,
            currency: item.currency,
            created_at: item.created_at,
        }));

        return {
            success: true,
            message: "Beneficiary details fetched successfully",
            data: returnData,
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred",
            data: null
        }
    }
}