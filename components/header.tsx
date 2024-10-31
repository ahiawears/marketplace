import { Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Logo } from "./ui/logo";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export const Header = () => {
	return (
		<header className="p-8 border-b border-border fixed left-0 top-0 w-full bg-background">
			<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
				<Logo />
				<div className="flex items-center gap-4 grow w-full">
					<Input placeholder="Search products" className="grow" />
					<div className="md:hidden">
						<Sheet>
							<SheetTrigger asChild>
								<Button size={"icon"}>
									<Filter />
								</Button>
							</SheetTrigger>
							<SheetContent className="flex flex-col px-0" side={"left"}>
								<SheetTitle className="sr-only">Filters</SheetTitle>
								<ul className="flex-1">{/* TODO: Add filters */}</ul>
								<SheetFooter className="border-t border-border pt-4 px-3">
									<div className="grid grid-cols-2 gap-4 w-full">
										<Button variant={"outline"} size={"lg"}>
											Login
										</Button>
										<Button size={"lg"}>Get Started</Button>
									</div>
								</SheetFooter>
							</SheetContent>
						</Sheet>
					</div>
				</div>
				<div className="md:flex items-center gap-4 hidden">
					<Button variant={"outline"} size={"lg"}>
						Login
					</Button>
					<Button size={"lg"}>Get Started</Button>
				</div>
			</div>
		</header>
	);
};
