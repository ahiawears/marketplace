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
      <div className="w-full flex flex-col h-screen">
        <header className="border-b-2 p-4">
          <div className="flex gap-4 items-center">
            <SidebarTrigger/>
            <h1 className="font-bold">Dashboard</h1>
          </div>
        </header>
        <main className="container py-8 flex-1 h-[calc(100vh-64px)]">{props.children}</main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
