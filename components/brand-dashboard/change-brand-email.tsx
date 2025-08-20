import { Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import validator from "validator";
import { toast } from "sonner";
import { UpdateAuthEmail } from "@/actions/auth/update-auth-email";
import { useRouter } from "next/navigation";

interface Errors {
    newEmail?: string;
}

const ChangeAuthEmail = () => {
    const [newEmail, setNewEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const router = useRouter();
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const form = e.currentTarget;
        const formData = new FormData(form);
        const newEmail = formData.get("newEmail") as string;
        const newErrors: Errors = {};

        if(!validator.isEmail(newEmail)){
            newErrors.newEmail = "Please enter a valid email address.";
            toast.error("Please enter a valid email address.");
        }

        setErrors(newErrors);

        try {
            const result = await UpdateAuthEmail(formData, "brand");
            if (result.success) {
                toast.success(result.message, {
                    description: "Please click on the links sent to both your current email address and the new email address to complete the change.",
                    action:{
                        label: 'Close',
                        onClick(event) {
                            event.preventDefault();
                            toast.dismiss();
                        },
                    }
                });
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to change auth email. Please try again");
        } finally { 
            setIsSubmitting(false);
        }

    }

    return (
        <div className="mx-auto py-10 sm:py-10 shadow-2xl border-2">
            <div className="mx-auto max-7xl px-6 lg:px-8">
                <div className="text-center">
                    {/* SVG Icon */}
                    <Mail 
                        size={30}
                        className="mx-auto"

                    />
                    {/* Title */}
                    <p className="mt-4 text-lg font-semibold">Change Authentication Email</p>
                </div>
                {/* Add your explanatory text here */}
                <div className="my-4 text-sm text-gray-600 float-left">
                    <p>This is your primary email for logging in and receiving important notifications.</p>
                    <p>For your security, a confirmation email will be sent to the new address. The change will only take effect after you click the link in that email.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="newEmail"
                            className="block text-sm font-bold text-gray-900 mb-1 w-fit"
                        >
                            New Auth Email:*
                        </label>
                        <div className="my-1">
                            <Input
                                id="newEmail"
                                name="newEmail"
                                value={newEmail}
                                onChange={(e) => {
                                    setNewEmail(e.target.value);
                                }}
                                className="block w-full border-2 py-1.5 ring-1 ring-inset ring-gray-300 sm:text-sm/6 "
                            />
                            {errors.newEmail && <p className="text-red-500 text-sm mt-1">{errors.newEmail[0]}</p>}
                        </div>
                    </div>
                    <div className="text-sm">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !newEmail}
                            className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            {isSubmitting ? "Saving Auth Email..." : "Save Auth Email"}
                        </Button>
                    </div>
                </form>
            </div>            
        </div>
    )

}

export default ChangeAuthEmail;