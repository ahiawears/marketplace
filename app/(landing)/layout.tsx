import { Footer } from "@/components/footer";
import { ServerHeader } from "@/components/headerServerComponent";
import { Navbar } from "@/components/navbar";
import Navbarn from "@/components/navbarn";

export default function LandingLayout ({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="flex flex-col min-h-screen">
				<ServerHeader /> 
				{/* <Navbar /> */}
				<Navbarn />
				<main className="flex-grow">{children}</main>
				<Footer />
			</div>
		</>
	);
};
