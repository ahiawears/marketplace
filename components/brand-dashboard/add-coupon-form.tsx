import { FormEvent, useState } from "react";
import { CouponFormDetails } from "./coupon-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface  AddCouponFormProps {
    onBack: () => void;
    currency: string;
    initialFormData: CouponFormDetails;
}

const AddCouponForm = ({ onBack, currency, initialFormData }: AddCouponFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<CouponFormDetails>(initialFormData);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("The formdata is ", formData);
    }
    return (
        <Card className="mx-auto p-4 sm:p-6 lg:p-8 border-2 shadow-lg rounded-none">
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-3xl my-4 font-bold text-gray-900 text-center">
                        Add Coupon
                    </CardTitle>
                    <CardDescription className="text-md text-gray-600">
                        Please fill this form accurately to add a coupon
                    </CardDescription>
                </div>
                <Button
                    onClick={onBack}
                    className="flex-shrink-0"
                >
                    Back
                </Button>
            </CardHeader>

            <CardContent className="py-4">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <h3
                            className="text-xl font-semibold text-gray-800 border-b-2 pb-2"
                        >
                            Coupon Details
                        </h3>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}