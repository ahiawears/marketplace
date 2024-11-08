import {
  ArrowLeft,
  Home,
  Settings,
  ShoppingBasket,
  TicketPercent,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

type SibarMenuItem = {
  title: string;
  url: string;
  icon?: React.ElementType;
  subitems?: SibarMenuItem[];
};

const items: SibarMenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },

  {
    title: "Products",
    url: "/dashboard/products",
    icon: ShoppingBasket,
    subitems: [
      {
        title: "Add Products",
        url: "/dashboard/add-product",
        icon: undefined,
      },
      {
        title: "Products List",
        url: "/dashboard/products-list",
        icon: undefined,
      }
    ],
  },

  {
    title: "Coupons",
    url: "/dashboard/coupons",
    icon: TicketPercent,
    subitems: [
      {
        title: "Add Coupon",
        url: "/dashboard/add-coupon",
        icon: undefined,
      },
    ],
  },

  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.subitems?.map((subitem, i) => (
                    <SidebarMenuSub key={i}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href={subitem.url}>
                            {subitem.icon && <subitem.icon />}
                            <span>{subitem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  ))}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <ArrowLeft />
                <span>Go back home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
