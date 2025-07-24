import { Footer } from "@/components/footer";
import { ServerHeader } from "@/components/headerServerComponent";

export default function LandingLayout ({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ServerHeader />
      <main className="flex-grow md:pt-0 pt-0 md:pb-32 pb-44">
        {children}
      </main>

      <Footer />
    </div>
  );
};

