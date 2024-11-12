import { ReactNode } from "react";

const BrandOnboardingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="h-screen">
      <div className="h-full container flex flex-col gap-8 items-center justify-center">
        <h1 className="text-4xl font-bold">
          Let&apos;s get started with your brand
        </h1>
        {children}
      </div>
    </main>
  );
};

export default BrandOnboardingLayout;
