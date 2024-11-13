import { Logo } from "@/components/ui/logo";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const LandingLayout = (props: Props) => {
  return (
    <>
        <div className="text-center pt-20 bg-gray-200 h-screen">
            <Logo />
            <main className="md:pt-32 pt-10 lg:pt-10">{props.children}</main>  
        </div>
        
        
    </>
  );
};

export default LandingLayout;
