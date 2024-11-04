import AddCouponForm from "@/components/ui/add-coupon-form";

const AddCoupon = () => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Enter Coupon Details</h2>
            <div className="hidden lg:block">
                <div className="p-4"> 
                    <AddCouponForm />
                </div>
            </div>
            <div className="lg:hidden sm:block">
                    <AddCouponForm/>
            </div>
        </div>
    )
}


export default AddCoupon;