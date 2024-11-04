import { Input } from "@/components/ui/input";

const AddCouponForm = () => {
    return (
        <div>
            <form className="space-y-6">
                <div>
                    <label htmlFor="couponCode" className="block text-sm font-bold text-gray-900">
                        Enter Coupon Code:*
                    </label>
                    <div className="mt-2">
                        <Input
                            id="couponCode"
                            name="couponCode"
                            type="text"
                            required
                            autoComplete="product-name"
                        />
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AddCouponForm

