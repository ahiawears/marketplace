import BrandSignup from '@/components/auth/brandSignup';

export const metadata = {
    title: "Brand Registration",
    description: "Fill in the necessary fields to register your brand"
}
const RegisterBrand = () => {
    return (        
		<div className="flex w-full h-screen items-center justify-center mx-auto lg:w-1/2">
            <div className="container mx-auto w-full ">
                <BrandSignup/>
            </div>
        </div>
    );
};


export default RegisterBrand;
