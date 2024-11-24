import { ServerHeader } from "@/components/headerServerComponent";


export default function LandingLayout ({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServerHeader />
      <main className="md:py-32 py-44">{children}</main>
    </>
  );
};
