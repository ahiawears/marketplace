import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cookies } from "next/headers";

type Props = {
  children: ReactNode;
};

const DashboardLayout = async (props: Props) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b-2 p-4">
          <div className="flex gap-4 items-center">
            <SidebarTrigger/>
            <h1 className="font-bold">Dashboard</h1>
          </div>
        </header>
        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden px-4 py-8 md:px-6">
          <div className="mx-auto min-w-0 max-w-7xl">
            {props.children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
