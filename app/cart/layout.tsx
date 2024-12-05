import { Footer } from "@/components/footer";
import { ServerHeader } from "@/components/headerServerComponent";

export default function LandingLayout ({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServerHeader />
      <main className="md:pt-32 pt-44 md:pb-32 pb-44">{children}</main>
      <Footer />
    </>
  );
};

