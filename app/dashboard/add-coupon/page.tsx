import AddCouponForm from "@/components/ui/add-coupon-form";

const AddCoupon = () => {
    return (
        <div>
            <div className="container">
                <div className="hidden lg:block">
					<div className="p-4"> 
						<AddCouponForm />
					</div>
				</div>
				<div className="w-full p-3 px-10 py-10 lg:hidden">

				</div>
            </div>
        </div>
    )
}


export default AddCoupon;