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
import AdminCalendar from "./AdminCalendar";
import ManageCourts from "./ManageCourts";
import ManageAvailability from "./ManageAvailability";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { useAuth } from "../../hooks/useAuth";

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
  { title: "Reservas", description: "Revisa y gestiona todas las reservas.", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50", url: "/admin/reservations" },
  { title: "Calendario", description: "Consulta la agenda del día.", icon: CalendarDays, color: "text-orange-500", bg: "bg-orange-50", url: "/admin#calendar" },
  { title: "Canchas", description: "Gestiona sedes y superficies de juego.", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50", url: "/admin#courts" },
  { title: "Disponibilidad", description: "Abre y bloquea horarios.", icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-50", url: "/admin#availability" },
];

const homeStats = [
  { title: "Reservas de hoy", value: "24", detail: "+12% frente a ayer", icon: ClipboardList },
  { title: "Canchas activas", value: "8", detail: "2 en mantenimiento", icon: MapPin },
  { title: "Usuarios registrados", value: "148", detail: "9 nuevos esta semana", icon: Users },
  { title: "Ingresos", value: "$1.2M", detail: "+8% este mes", icon: DollarSign },
];

const dashboardStats = [
  { title: "Reservas totales", value: "1,284", trend: "+12.4%", detail: "vs periodo anterior", icon: ClipboardList, iconBg: "bg-blue-50", iconColor: "text-blue-600", trendColor: "text-blue-600", trendIcon: TrendingUp },
  { title: "Reservas temporales", value: "37", trend: "+4.1%", detail: "vs periodo anterior", icon: Clock3, iconBg: "bg-orange-50", iconColor: "text-orange-500", trendColor: "text-blue-600", trendIcon: TrendingUp },
  { title: "Reservas confirmadas", value: "1,142", trend: "+8.2%", detail: "vs periodo anterior", icon: CheckCircle2, iconBg: "bg-blue-50", iconColor: "text-blue-600", trendColor: "text-blue-600", trendIcon: TrendingUp },
  { title: "Reservas canceladas", value: "105", trend: "-3.6%", detail: "vs periodo anterior", icon: CircleX, iconBg: "bg-red-50", iconColor: "text-red-500", trendColor: "text-red-500", trendIcon: TrendingDown },
  { title: "Canchas activas", value: "24", trend: "+2", detail: "vs periodo anterior", icon: MapPin, iconBg: "bg-blue-50", iconColor: "text-blue-600", trendColor: "text-blue-600", trendIcon: TrendingUp },
  { title: "Canchas en mantenimiento", value: "3", trend: "-1", detail: "vs periodo anterior", icon: Wrench, iconBg: "bg-orange-50", iconColor: "text-orange-500", trendColor: "text-red-500", trendIcon: TrendingDown },
];

const monthlyReservations = [
  ["Jan", 45], ["Feb", 62], ["Mar", 54], ["Apr", 78], ["May", 88], ["Jun", 72],
  ["Jul", 96], ["Aug", 112], ["Sep", 105], ["Oct", 124], ["Nov", 118], ["Dec", 136],
] as const;

const sportBreakdown = [
  ["Fútbol", "48%", "bg-blue-600"],
  ["Tennis", "24%", "bg-orange-500"],
  ["Baloncesto", "16%", "bg-violet-500"],
  ["Voleibol", "12%", "bg-emerald-500"],
] as const;

function HomeView() {
  return (
    <>
      <section className="overflow-hidden rounded-[22px] px-8 py-10 text-white shadow-sm md:px-12 md:py-14" style={{ background: "var(--brand-gradient)" }}>
        <p className="text-sm font-bold uppercase tracking-wide text-white/75">Bienvenido de nuevo</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">Hola admin, ¿listo para gestionar GameZone?</h1>
        <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-white/85">
          Controla reservas, estado de canchas y disponibilidad desde un solo lugar.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <Link to="/admin#dashboard" className="inline-flex min-h-13 min-w-56 items-center justify-center gap-2 rounded-lg bg-slate-50 px-8 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-white">
            Abrir dashboard
            <ArrowUpRight className="h-5 w-5" />
          </Link>
          <Link to="/admin/reservations" className="inline-flex min-h-13 min-w-56 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-8 text-base font-semibold text-white shadow-none transition hover:bg-white/20">
            Ver reservas
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-950">Accesos rápidos</h2>
        <p className="mt-1 text-base text-slate-600">Entra directo a las herramientas principales.</p>
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
          <p className="mt-1 text-lg text-slate-600">Resumen de reservas y estado de canchas.</p>
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
              <h2 className="text-xl font-bold text-slate-950">Reservas en el tiempo</h2>
              <p className="mt-1 text-base text-slate-600">Reservas mensuales en todas las canchas.</p>
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
              <h2 className="text-xl font-bold text-slate-950">Distribución por deporte</h2>
              <p className="mt-1 text-base text-slate-600">Reservas por tipo de deporte.</p>
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
  const { user } = useAuth();
  const userInitials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((part) => part?.[0])
      .join("")
      .toUpperCase() ||
    (user?.email || "AD").slice(0, 2).toUpperCase();
  const currentView =
    hash === "#dashboard"
      ? "dashboard"
      : hash === "#calendar"
        ? "calendar"
        : hash === "#courts"
          ? "courts"
          : hash === "#availability"
            ? "availability"
          : "home";

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
            .admin-shell input[type="date"] {
              color-scheme: light;
            }
            .admin-shell input[type="date"]::-webkit-calendar-picker-indicator {
              cursor: pointer;
              opacity: 1;
              filter: invert(39%) sepia(89%) saturate(2088%) hue-rotate(213deg) brightness(96%) contrast(92%);
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
                  <Input placeholder="Buscar reservas, canchas o usuarios..." className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-12 text-slate-700 shadow-sm placeholder:text-slate-500 focus-visible:ring-blue-500" />
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <Button variant="ghost" size="icon" aria-label="Notificaciones" className="h-10 w-10 rounded-full text-slate-700 hover:bg-slate-100">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-base font-semibold text-white shadow-sm" style={{ background: "var(--brand-gradient)" }}>
                    {userInitials}
                  </div>
                </div>
              </header>

              <main className="flex-1 bg-slate-50 p-5 md:p-10">
                {currentView === "dashboard" && <DashboardView />}
                {currentView === "calendar" && <AdminCalendar />}
                {currentView === "courts" && <ManageCourts />}
                {currentView === "availability" && <ManageAvailability />}
                {currentView === "home" && <HomeView />}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </IonContent>
    </IonPage>
  );
}
