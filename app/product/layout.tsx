import { ServerHeader } from "@/components/headerServerComponent";

export default async function LandingLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <>
      <ServerHeader />
      <main className="md:py-4 py-4">
        {children}
      </main>
    </>
  );
}