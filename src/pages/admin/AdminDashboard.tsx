import { Link, useHistory, useLocation } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Users,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
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
  { title: "Courts", url: "/admin#courts", icon: MapPin },
  { title: "Availability", url: "/admin#availability", icon: CheckCircle2 },
];

const manageItems = [
  { title: "Users", url: "/admin#users", icon: Users },
  { title: "Reports", url: "/admin#reports", icon: BarChart3 },
  { title: "Settings", url: "/admin#settings", icon: Settings },
];

export default function AdminDashboard() {
  const { hash, pathname } = useLocation();
  const history = useHistory();
  const { user, logout } = useAuth();
  const isActive = (url: string) => {
    const [itemPathname, itemHash = ""] = url.split("#");

    return pathname === itemPathname && hash === (itemHash ? `#${itemHash}` : "");
  };
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin";
  const displayEmail = user?.email || "admin@gamezone.app";
  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((part) => part?.[0])
      .join("")
      .toUpperCase() ||
    displayEmail.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    history.push("/login");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="[&_[data-sidebar=sidebar]]:bg-[#142136] [&_[data-sidebar=sidebar]]:text-white"
    >
      <SidebarHeader className="border-b border-[#26364d] bg-[#142136]">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-2xl px-3 py-4 text-white no-underline transition hover:bg-[#1d2c44]"
        >
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
        </Link>
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
                    className="h-11 rounded-2xl border border-transparent px-3 text-base text-white/85 transition hover:bg-[#24344d] hover:text-white data-[active=true]:border-white/20 data-[active=true]:bg-[#2b3a52] data-[active=true]:font-bold data-[active=true]:text-white data-[active=true]:shadow-sm"
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
                    className="h-11 rounded-2xl border border-transparent px-3 text-base text-white/85 transition hover:bg-[#24344d] hover:text-white data-[active=true]:border-white/20 data-[active=true]:bg-[#2b3a52] data-[active=true]:font-bold data-[active=true]:text-white data-[active=true]:shadow-sm"
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2b3a52] text-sm font-bold text-white">
            {initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-bold text-white">{displayName}</span>
            <span className="block truncate text-xs text-white/75">{displayEmail}</span>
          </div>
          <button
            type="button"
            aria-label="Cerrar sesion"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/80 transition hover:bg-[#24344d] hover:text-white group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
