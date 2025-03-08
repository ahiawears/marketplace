import BrandBasicDetails from "@/components/brand-dashboard/brand-basic-details";
import ChangeBrandPassword from "@/components/brand-dashboard/change-brand-password";
import { useEffect } from "react";

export default function BrandAccountSettings () {

    return (
        <div>
            <BrandBasicDetails />
            <ChangeBrandPassword />
        </div>
    );
}