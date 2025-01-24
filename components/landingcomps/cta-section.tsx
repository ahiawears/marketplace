import { BrandCard } from "../brand-card";
import { Logo } from "../ui/logo";

export const TopBrandCTA = () => {
    return (
        <div className="bg-transparent">
            <div className="mx-auto py-24 sm:py-32 bg-[#BFCFBB]">
                <div className="relative mx-auto lg:flex md:flex w-full px-6 sm:px-16 lg:max-w-7xl lg:px-8 h-[500] py-6"> 
                    <div className="mx-auto text-center align-middle lg:mx-0 lg:flex-auto lg:text-left basis-1/3 lg:align-middle">
                        <div className="py-6 md:py-6">
                            <h3 className="text-3xl font-bold">
                                ahịa's top brands
                            </h3>
                            <p>
                                Check out our top brands collections
                            </p>
                        </div>
                        
                    </div>
                    <div className="relative flex flex-col md:flex-row items-center justify-between basis-2/3 gap-x-3 gap-y-4">
                        <div className="basis-1/3 text-center m-auto">
                            <BrandCard />
                        </div>
                        <div className="basis-1/3 text-center m-auto">
                            <BrandCard />
                        </div>
                        <div className="basis-1/3 text-center m-auto">
                            <BrandCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}