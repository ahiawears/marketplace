import { Textarea } from "../ui/textarea";

export const BrandDescriptionField = () => {
    return (
        <div>
            <div className="mx-auto py-10 sm:py-10 shadow-2xl">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="space-y-2">
                        <label htmlFor="productName" className="block text-sm font-bold text-gray-900">
                            Enter Brand Description:*
                        </label>
                        <Textarea
                            name="description"
                            placeholder="Describe your brand"
                            
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}