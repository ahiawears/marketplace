import {
  ArrowLeft,
  BookImage,
  Home,
  ListOrdered,
  MessageCircle,
  Settings,
  ShoppingBasket,
  TicketPercent,
  Wallet,
  BarChart3,
  HelpCircle,
  Star,
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type SidebarSubitem = {
  title: string;
  url: string;
};

type SidebarItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  subitems?: SidebarSubitem[];
  disabled?: boolean;
  badge?: string;
};

const activeItems: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Products",
    url: "/dashboard/products-list",
    icon: ShoppingBasket,
    subitems: [
      { title: "Add Product", url: "/dashboard/add-product" },
      { title: "Products List", url: "/dashboard/products-list" },
      { title: "Inventory", url: "/dashboard/inventory" },
      { title: "Lookbook", url: "/dashboard/lookbook" },
    ],
  },
  {
    title: "Marketing",
    url: "/dashboard/coupons",
    icon: TicketPercent,
    subitems: [{ title: "Coupons", url: "/dashboard/coupons" }],
  },
  {
    title: "Reviews",
    url: "/dashboard/reviews",
    icon: Star,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Brand Settings",
    url: "/dashboard/brand-profile-management",
    icon: Settings,
    subitems: [
      { title: "Brand Profile", url: "/dashboard/brand-profile-management" },
      { title: "Account Settings", url: "/dashboard/brand-account-settings" },
      { title: "Shipping Configuration", url: "/dashboard/shipping-configuration" },
      { title: "Return Policy", url: "/dashboard/return-policy" },
      { title: "Payment Settings", url: "/dashboard/payment-settings" },
      { title: "Notifications", url: "/dashboard/notifications" },
    ],
  },
];

const comingSoonItems: SidebarItem[] = [
  {
    title: "Orders",
    icon: ListOrdered,
    disabled: true,
    badge: "Soon",
  },
  {
    title: "Messages",
    icon: MessageCircle,
    disabled: true,
    badge: "Soon",
  },
  {
    title: "Finance",
    icon: Wallet,
    disabled: true,
    badge: "Soon",
  },
  {
    title: "Support",
    icon: HelpCircle,
    disabled: true,
    badge: "Soon",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ahia</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {activeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url || "/dashboard"}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.subitems?.map((subitem) => (
                    <SidebarMenuSub key={subitem.url}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href={subitem.url}>
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

        <SidebarGroup>
          <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comingSoonItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
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
