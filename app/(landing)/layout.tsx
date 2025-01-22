import { Footer } from "@/components/footer";
import { ServerHeader } from "@/components/headerServerComponent";


export default function LandingLayout ({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="flex flex-col min-h-screen">
				<ServerHeader />
				<main className="flex-grow">{children}</main>
				<Footer />
			</div>
		</>
	);
};
