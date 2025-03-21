import { Logo } from "@/components/ui/logo";
import { ReactNode } from "react";

const BrandOnboardingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="my-4 h-fit">
      <div className="h-full container flex flex-col gap-8 items-center justify-center">
        <div>
          <Logo />
        </div>
        {children}
      </div>
    </main>  
  );
};

export default BrandOnboardingLayout;
