import {
  ArrowLeft,
  BarChart,
  BookImage,
  HelpCircle,
  Home,
  ListOrdered,
  MessageCircle,
  Settings,
  ShoppingBasket,
  Star,
  TicketPercent,
  UserPenIcon,
  Wallet,
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
      { title: "Add Product", url: "/dashboard/add-product" },
      { title: "Products List", url: "/dashboard/products-list" },
      { title: "Inventory", url: "/dashboard/inventory" },
      { title: "Lookbook", url: "/dashboard/lookbook" },
    ],
  },
  {
    title: "Orders & Customers",
    url: "/dashboard/orders",
    icon: ListOrdered,
    subitems: [
      { title: "Orders", url: "/dashboard/orders" },
      { title: "Messages", url: "/dashboard/messages" },
      { title: "Reviews", url: "/dashboard/reviews" },
    ],
  },
  {
    title: "Marketing",
    url: "/dashboard/marketing",
    icon: TicketPercent,
    subitems: [
      { title: "Coupons", url: "/dashboard/coupons" },
      { title: "Lookbook", url: "/dashboard/lookbook" }, // optional if relevant here too
    ],
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Brand Settings",
    url: "/dashboard/settings",
    icon: Settings,
    subitems: [
      { title: "Brand Profile", url: "/dashboard/brand-profile-management" },
      { title: "Shipping Configuration", url: "/dashboard/shipping-configuration" },
      { title: "Return Policy", url: "/dashboard/return-policy" },
      { title: "Payment Settings", url: "/dashboard/payment-settings" },
      { title: "Notifications", url: "/dashboard/notifications" },
    ],
  },
  {
    title: "Finance",
    url: "/dashboard/payouts",
    icon: Wallet,
    subitems: [
      { title: "Payouts", url: "/dashboard/payouts" },
    ],
  },
  {
    title: "Support",
    url: "/dashboard/support",
    icon: HelpCircle,
  },
];


export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ahịa</SidebarGroupLabel>
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
