import { Logo } from "@/components/ui/logo";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const LandingLayout = (props: Props) => {
  return ( 
    <>
        <div className="flex flex-col min-h-screen bg-gray-200 pt-20 text-center">
            <Logo />
            <main className="md:pt-32 pt-10 lg:pt-10 md:pb-32 pb-10 lg:pb-10">{props.children}</main>  
        </div>
        
        
    </>
  );
};

export default LandingLayout;
