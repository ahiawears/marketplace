import { useState } from "react";
import ModalBackdrop from "../modals/modal-backdrop";
import ErrorModal from "../modals/error-modal";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { EditBrandLogo } from "../brand-dashboard/edit-brand-logo";

const BrandBasicInformationForm = () => {
    const [errorMessage, setErrorMessage] = useState("");
    
    return (
        <>
            {errorMessage && (
                <>
                    <ModalBackdrop disableInteraction={true}/>

                    <ErrorModal
                        message={errorMessage}
                        onClose={() => {
                            setErrorMessage("");
                        }}
                    />
                </>
            )}
            <div className="space-y-4">
                <div className="space-y-2">  
                    <label htmlFor="brandName" className="block text-sm font-bold text-gray-900">
                        Enter Brand Name:*
                    </label>
                    <Input
                        name="brandName"
                        placeholder="Enter your brand name"
                        // value={formData.brandName}
                        // onChange={(e) =>
                        //     setFormData({ 
                        //         ...formData,
                        //         brandName: e.target.value
                        //      })
                        // }
                    />
                </div>

                <EditBrandLogo />

                <div className="space-y-2">
                    <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
                        Enter Brand Description:*
                    </label>
                    <Textarea
                        name="description"
                        placeholder="Describe your brand"
                        // value={formData.description}
                        // onChange={(e) =>
                        //     setFormData({
                        //         ...formData,
                        //         description: e.target.value,
                        //     })
                        // }
                        className="min-h-[100px]"
                    />
                </div>
            </div>
        </>
    )
}

export default BrandBasicInformationForm