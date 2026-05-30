import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleX,
  ClipboardList,
  Clock3,
  DollarSign,
  LineChart,
  MapPin,
  PieChart,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

import AdminDashboard from "./AdminDashboard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";

const adminTheme = {
  "--background": "#f8fafc",
  "--foreground": "#0f172a",
  "--card": "#ffffff",
  "--card-foreground": "#0f172a",
  "--popover": "#ffffff",
  "--popover-foreground": "#0f172a",
  "--primary": "#2563eb",
  "--primary-foreground": "#ffffff",
  "--secondary": "#f1f5f9",
  "--secondary-foreground": "#1e293b",
  "--muted": "#f1f5f9",
  "--muted-foreground": "#64748b",
  "--accent": "#eef4ff",
  "--accent-foreground": "#1e293b",
  "--border": "#e2e8f0",
  "--input": "#dbe3ef",
  "--ring": "#2563eb",
  "--sidebar": "#142136",
  "--sidebar-foreground": "#ffffff",
  "--sidebar-accent": "#2b3a52",
  "--sidebar-accent-foreground": "#ffffff",
  "--sidebar-border": "#26364d",
  "--sidebar-ring": "#7aa2ff",
  "--brand-gradient":
    "linear-gradient(135deg, #2f65f5 0%, #7b6fce 45%, #ff7b2f 100%)",
} as CSSProperties;

const quickAccessItems = [
  { title: "Reservations", description: "Review and manage all court bookings.", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50", url: "/client/reservations" },
  { title: "Calendar", description: "See today's schedule at a glance.", icon: CalendarDays, color: "text-orange-500", bg: "bg-orange-50", url: "/admin#calendar" },
  { title: "Courts", description: "Manage venues and playing surfaces.", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50", url: "/client/courts" },
  { title: "Availability", description: "Open and block time slots.", icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-50", url: "/admin#calendar" },
];

const homeStats = [
  { title: "Today's Reservations", value: "24", detail: "+12% from yesterday", icon: ClipboardList },
  { title: "Active Courts", value: "8", detail: "2 under maintenance", icon: MapPin },
  { title: "Registered Users", value: "148", detail: "9 new this week", icon: Users },
  { title: "Revenue", value: "$1.2M", detail: "+8% this month", icon: DollarSign },
];

const dashboardStats = [
  { title: "Total Reservations", value: "1,284", trend: "+12.4%", detail: "vs last period", icon: ClipboardList, iconBg: "bg-blue-50", iconColor: "text-blue-600", trendColor: "text-blue-600", trendIcon: TrendingUp },
  { title: "Pending Reservations", value: "37", trend: "+4.1%", detail: "vs last period", icon: Clock3, iconBg: "bg-orange-50", iconColor: "text-orange-500", trendColor: "text-blue-600", trendIcon: TrendingUp },
  { title: "Confirmed Reservations", value: "1,142", trend: "+8.2%", detail: "vs last period", icon: CheckCircle2, iconBg: "bg-blue-50", iconColor: "text-blue-600", trendColor: "text-blue-600", trendIcon: TrendingUp },
  { title: "Cancelled Reservations", value: "105", trend: "-3.6%", detail: "vs last period", icon: CircleX, iconBg: "bg-red-50", iconColor: "text-red-500", trendColor: "text-red-500", trendIcon: TrendingDown },
  { title: "Active Courts", value: "24", trend: "+2", detail: "vs last period", icon: MapPin, iconBg: "bg-blue-50", iconColor: "text-blue-600", trendColor: "text-blue-600", trendIcon: TrendingUp },
  { title: "Courts In Maintenance", value: "3", trend: "-1", detail: "vs last period", icon: Wrench, iconBg: "bg-orange-50", iconColor: "text-orange-500", trendColor: "text-red-500", trendIcon: TrendingDown },
];

const monthlyReservations = [
  ["Jan", 45], ["Feb", 62], ["Mar", 54], ["Apr", 78], ["May", 88], ["Jun", 72],
  ["Jul", 96], ["Aug", 112], ["Sep", 105], ["Oct", 124], ["Nov", 118], ["Dec", 136],
] as const;

const sportBreakdown = [
  ["Football", "48%", "bg-blue-600"],
  ["Tennis", "24%", "bg-orange-500"],
  ["Basketball", "16%", "bg-violet-500"],
  ["Volleyball", "12%", "bg-emerald-500"],
] as const;

function HomeView() {
  return (
    <>
      <section className="overflow-hidden rounded-[22px] px-8 py-10 text-white shadow-sm md:px-12 md:py-14" style={{ background: "var(--brand-gradient)" }}>
        <p className="text-sm font-bold uppercase tracking-wide text-white/75">Welcome back</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">Hi Admin, ready to run GameZone today?</h1>
        <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-white/85">
          Track reservations, court status and availability in one place. Jump back in where you left off.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <Link to="/admin#dashboard" className="inline-flex min-h-13 min-w-56 items-center justify-center gap-2 rounded-lg bg-slate-50 px-8 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-white">
            Open Dashboard
            <ArrowUpRight className="h-5 w-5" />
          </Link>
          <Link to="/client/reservations" className="inline-flex min-h-13 min-w-56 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-8 text-base font-semibold text-white shadow-none transition hover:bg-white/20">
            View Reservations
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-950">Quick access</h2>
        <p className="mt-1 text-base text-slate-600">Jump straight into the tools you use most.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {quickAccessItems.map((item) => (
            <Link key={item.title} to={item.url} className="group rounded-2xl border border-slate-200 bg-white p-8 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="mt-8 text-lg font-bold">{item.title}</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {homeStats.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{item.title}</p>
                <p className="mt-3 text-3xl font-extrabold text-slate-950">{item.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>{item.detail}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function DashboardView() {
  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-1 text-lg text-slate-600">Overview of reservations and court health.</p>
        </div>
        <div className="w-fit rounded-full bg-slate-100 px-5 py-2 text-sm font-bold text-slate-800">Last 30 days</div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="max-w-44 text-lg leading-7 text-slate-600">{item.title}</p>
                <p className="mt-3 text-4xl font-medium tracking-tight text-slate-950">{item.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}>
                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
              <item.trendIcon className={`h-4 w-4 ${item.trendColor}`} />
              <span className={`font-semibold ${item.trendColor}`}>{item.trend}</span>
              <span>{item.detail}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-5 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <LineChart className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-950">Reservations over time</h2>
                <p className="mt-1 text-base text-slate-600">Monthly bookings across all courts.</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800">2026</div>
          </div>
          <div className="mt-10 flex h-64 items-end gap-3 border-b border-slate-100 pb-4">
            {monthlyReservations.map(([month, value]) => (
              <div key={month} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-52 w-full items-end rounded-t-xl bg-blue-50">
                  <div className="w-full rounded-t-xl bg-blue-600" style={{ height: `${value}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-500">{month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex gap-3">
            <PieChart className="mt-1 h-5 w-5 text-orange-500" />
            <div>
              <h2 className="text-xl font-bold text-slate-950">Sport breakdown</h2>
              <p className="mt-1 text-base text-slate-600">Reservations by sport type.</p>
            </div>
          </div>
          <div className="mt-8 space-y-6">
            {sportBreakdown.map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="font-semibold text-slate-500">{value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className={`h-3 rounded-full ${color}`} style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

export default function AdminHome() {
  const { hash } = useLocation();
  const currentView = hash === "#dashboard" ? "dashboard" : "home";

  return (
    <IonPage>
      <IonContent className="admin-light" fullscreen scrollY style={{ "--background": "#f8fafc" } as CSSProperties}>
        <style>
          {`
            ion-content.admin-light::part(scroll) { scrollbar-color: #2563eb #dbeafe; }
            ion-content.admin-light::part(scroll)::-webkit-scrollbar { width: 10px; }
            ion-content.admin-light::part(scroll)::-webkit-scrollbar-track { background: #dbeafe; }
            ion-content.admin-light::part(scroll)::-webkit-scrollbar-thumb {
              background: #2563eb;
              border-radius: 999px;
              border: 2px solid #dbeafe;
            }
            .admin-shell a {
              color: inherit;
              text-decoration: none;
            }
          `}
        </style>
        <SidebarProvider style={adminTheme}>
          <div className="admin-shell min-h-screen flex w-full bg-background text-foreground">
            <AdminDashboard />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-20 md:h-16 flex items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-8 sticky top-0 z-10">
                <SidebarTrigger className="text-slate-700 hover:bg-slate-100" />
                <div className="relative hidden flex-1 max-w-xl sm:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input placeholder="Search reservations, courts, users..." className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-12 text-slate-700 shadow-sm placeholder:text-slate-500 focus-visible:ring-blue-500" />
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <Button variant="ghost" size="icon" aria-label="Notifications" className="h-10 w-10 rounded-full text-slate-700 hover:bg-slate-100">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-base font-semibold text-white shadow-sm" style={{ background: "var(--brand-gradient)" }}>
                    AD
                  </div>
                </div>
              </header>

              <main className="flex-1 bg-slate-50 p-5 md:p-10">
                {currentView === "dashboard" ? <DashboardView /> : <HomeView />}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </IonContent>
    </IonPage>
  );
}
