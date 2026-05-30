import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Home,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/admin", icon: Home },
  { title: "Dashboard", url: "/admin#dashboard", icon: LayoutDashboard },
  { title: "Reservations", url: "/client/reservations", icon: ClipboardList },
  { title: "Calendar", url: "/admin#calendar", icon: CalendarDays },
  { title: "Courts", url: "/client/courts", icon: MapPin },
];

const manageItems = [
  { title: "Users", url: "/admin#users", icon: Users },
  { title: "Reports", url: "/admin#reports", icon: BarChart3 },
  { title: "Settings", url: "/admin#settings", icon: Settings },
];

export default function AdminDashboard() {
  const { hash, pathname } = useLocation();
  const isActive = (url: string) => {
    const [itemPathname, itemHash = ""] = url.split("#");

    return pathname === itemPathname && hash === (itemHash ? `#${itemHash}` : "");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="[&_[data-sidebar=sidebar]]:bg-[#142136] [&_[data-sidebar=sidebar]]:text-white"
    >
      <SidebarHeader className="border-b border-[#26364d] bg-[#142136]">
        <div className="flex items-center gap-3 px-3 py-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white shadow-sm"
            style={{ background: "var(--brand-gradient)" }}
          >
            GZ
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-base font-bold text-white">GameZone</span>
            <span className="text-sm text-white/75">Admin Console</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[#142136] text-white">
        <SidebarGroup className="pt-5">
          <SidebarGroupLabel className="px-3 text-sm font-bold text-white/75">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-10 rounded-lg px-3 text-base text-white hover:bg-[#2b3a52] hover:text-white data-[active=true]:bg-[#2b3a52] data-[active=true]:text-white"
                  >
                    <Link to={item.url} className="text-white no-underline">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="pt-5">
          <SidebarGroupLabel className="px-3 text-sm font-bold text-white/75">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {manageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-10 rounded-lg px-3 text-base text-white hover:bg-[#2b3a52] hover:text-white data-[active=true]:bg-[#2b3a52] data-[active=true]:text-white"
                  >
                    <Link to={item.url} className="text-white no-underline">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-[#26364d] bg-[#142136]">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="h-10 w-10 rounded-full bg-[#2b3a52] flex items-center justify-center text-sm font-bold text-white">
            AD
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-white">Admin</span>
            <span className="text-xs text-white/75">admin@gamezone.app</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
