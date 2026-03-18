import { Footer } from "@/components/footer";
import { ServerHeader } from "@/components/headerServerComponent";
import { LandingRouteNav } from "@/components/landing-route-nav";

export default function LandingLayout ({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="flex flex-col">
				<ServerHeader /> 
				<LandingRouteNav />
				<main className="flex-grow">{children}</main>
				<Footer />
			</div>
		</>
	);
};
