import { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonPage, IonContent } from "@ionic/react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutGrid, MapPin, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { StatusBadge } from "../../components/status-badge";
import { useReservations } from "../../hooks/useReservations";
import { useCourts } from "../../hooks/useCourts";
import { cn } from "../../lib/utils";

type FilterTab = "all" | "confirmada" | "temporal" | "cancelada" | "expirada";

const tabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "confirmada", label: "Confirmadas" },
  { id: "temporal", label: "Temporales" },
  { id: "cancelada", label: "Canceladas" },
  { id: "expirada", label: "Expiradas" },
];

export default function ClientReservations() {
  const history = useHistory();
  const { reservations, loadingReservations } = useReservations();
  const { courts, loading: loadingCourts } = useCourts();

  const [view, setView] = useState<"list" | "calendar">("list");
  const [tab, setTab] = useState<FilterTab>("all");

  const filtered = reservations.filter((r) => (tab === "all" ? true : r.status === tab));

  const loading = loadingReservations || loadingCourts;

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ '--background': '#f8fafc' }}>
        <div className="w-full min-h-screen text-[#334155] p-6 md:p-10 space-y-6">
          <button
            onClick={() => history.push("/client")}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#0052FF]/15 bg-white px-4 py-2 text-sm font-semibold text-[#0052FF] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0052FF]/35 hover:bg-[#0052FF]/5"
          >
            Volver al inicio
          </button>
          
          {/* Encabezado Principal */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Mis reservas</h1>
              <p className="text-muted-foreground mt-1">Gestiona tus reservas próximas y anteriores.</p>
            </div>
            <div className="flex gap-2">
              <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "px-3 h-9 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer",
                    view === "list" ? "bg-[#0052FF] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" /> Lista
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={cn(
                    "px-3 h-9 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer",
                    view === "calendar" ? "bg-[#0052FF] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" /> Calendario
                </button>
              </div>
              <Button onClick={() => history.push("/client/courts")} className="rounded-xl h-10 shadow-brand font-medium cursor-pointer">
                <Plus className="mr-1 h-4 w-4" /> Nueva reserva
              </Button>
            </div>
          </div>

          {/* Filtros por pestaña */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition cursor-pointer",
                  tab === t.id
                    ? "border-[#0052FF] bg-[#0052FF] text-white shadow-[0_10px_24px_-14px_rgba(0,82,255,0.55)]"
                    : "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-[#0052FF]/35 hover:bg-[#0052FF]/5 hover:text-[#0052FF]",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Renderizado de Vistas */}
          {loading ? (
            <div className="text-center p-16 text-muted-foreground font-medium">Cargando reservas...</div>
          ) : view === "list" ? (
            filtered.length === 0 ? (
              <EmptyState onBrowse={() => history.push("/client/courts")} />
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => {
                  const c = courts?.find((court) => court.id === r.courtId);
                  return (
                    <div
                      key={r.id}
                      onClick={() => history.push(`/client/reservations/${r.id}`)}
                      className="block cursor-pointer"
                    >
                      <Card className="p-4 rounded-2xl border-border bg-card hover:border-primary/40 hover:shadow-elevated transition flex items-center gap-4 shadow-sm">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                          {c?.image ? (
                            <img src={c.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-semibold truncate text-foreground text-base md:text-lg">{c?.name || "Cancha GameZone"}</h3>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c?.location || "GameZone"}</span>
                            <span>·</span>
                            <span className="font-mono text-[11px]">GZ-{r.id.slice(0, 5).toUpperCase()}</span>
                          </div>
                          <div className="text-sm mt-2 font-medium text-foreground/80">{r.date} · {r.startTime} – {r.endTime}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <StatusBadge status={r.status} />
                          <div className="text-base md:text-lg font-display font-bold text-primary">${(Number(r.totalPrice) || 0).toFixed(2)}</div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <CalendarView reservations={filtered} />
          )}

        </div>
      </IonContent>
    </IonPage>
  );
}

function CalendarView({ reservations }: { reservations: any[] }) {
  const history = useHistory();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const totalCells = Math.ceil((monthEnd.getDate() + monthStart.getDay()) / 7) * 7;

  const days = Array.from({ length: totalCells }).map((_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const goToPreviousMonth = () => {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1));
  };

  return (
    <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-foreground capitalize">
            {currentMonth.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
          </h3>
          <div className="text-xs text-muted-foreground font-medium">
            {reservations.length} reserva{reservations.length === 1 ? "" : "s"} en el filtro actual
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-xl" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground font-semibold text-center border-b border-border pb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {days.map((d, i) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const cellIsoDate = `${year}-${month}-${day}`;
          
          const dayReservations = reservations.filter((x) => x.date === cellIsoDate);
          const primaryReservation = dayReservations[0];
          
          const out = d.getMonth() !== currentMonth.getMonth();

          return (
            <div
              key={i}
              onClick={() => primaryReservation && history.push(`/client/reservations/${primaryReservation.id}`)}
              className={cn(
                "min-h-24 rounded-lg border p-1.5 text-xs relative flex flex-col gap-1 transition",
                out ? "opacity-30 border-transparent bg-transparent" : "border-border bg-background",
                primaryReservation && "bg-primary-soft border-primary/30 cursor-pointer hover:border-primary/60",
              )}
            >
              <div className={cn("font-bold text-muted-foreground", primaryReservation && "text-primary")}>
                {d.getDate()}
              </div>
              <div className="space-y-1">
                {dayReservations.slice(0, 2).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="w-full truncate rounded bg-white/80 px-1 py-0.5 text-[10px] font-bold text-primary shadow-sm"
                  >
                    {reservation.startTime}
                  </div>
                ))}
                {dayReservations.length > 2 && (
                  <div className="text-[10px] font-semibold text-primary">
                    +{dayReservations.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <Card className="p-16 rounded-2xl border-dashed border-border text-center bg-card shadow-sm">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
        <CalendarIcon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">Aún no tienes reservas</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
        Cuando reserves una cancha, tus reservas aparecerán aquí.
      </p>
      <Button onClick={onBrowse} className="mt-6 rounded-xl shadow-brand font-medium cursor-pointer">
        Ver canchas
      </Button>
    </Card>
  );
}
