import { Footer } from "@/components/footer";
import { ServerHeader } from "@/components/headerServerComponent";

export default function LandingLayout ({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ServerHeader />

      {/* The main content area should grow to fill available space */}
      {/*
        CRITICAL: Adjust these padding values (`md:pt-XX` and `pt-YY`)
        to exactly match the combined height of your ServerHeader
        AND any sticky/fixed elements in your Brands page (like the A-Z nav).
        If not correct, content will be hidden or there will be too much space.
      */}
      <main className="flex-grow md:pt-2 pt-2 md:pb-32 pb-44">
        {children}
      </main>

      <Footer />
    </div>
  );
};

