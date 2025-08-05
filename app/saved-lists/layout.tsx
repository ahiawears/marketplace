import { Footer } from "@/components/footer";
import { ServerHeader } from "@/components/headerServerComponent";

export default function LandingLayout ({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ServerHeader />
            <main className="md:py-4 py-4">{children}</main>
            <Footer />
        </>
    );
}