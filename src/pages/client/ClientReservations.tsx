import { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonPage, IonContent } from "@ionic/react";
import { Calendar as CalendarIcon, LayoutGrid, MapPin, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { StatusBadge } from "../../components/status-badge";
import { useReservations } from "../../hooks/useReservations";
import { useCourts } from "../../hooks/useCourts";
import { cn } from "../../lib/utils";

type FilterTab = "all" | "confirmed" | "temporary" | "cancelled" | "expired";

const tabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "temporary", label: "Temporary" },
  { id: "cancelled", label: "Cancelled" },
];

export default function ClientReservations() {
  const history = useHistory();
  const { reservations, loadingReservations } = useReservations();
  const { courts, loading: loadingCourts } = useCourts();

  const [view, setView] = useState<"list" | "calendar">("list");
  const [tab, setTab] = useState<FilterTab>("all");

  // Filtrado reactivo basado en la pestaña activa
  const filtered = reservations.filter((r) => (tab === "all" ? true : r.status === tab));

  const loading = loadingReservations || loadingCourts;

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ '--background': '#f8fafc' }}>
        <div className="w-full min-h-screen text-[#334155] p-6 md:p-10 space-y-6">
          
          {/* Encabezado Principal */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">My reservations</h1>
              <p className="text-muted-foreground mt-1">Manage upcoming and past bookings.</p>
            </div>
            <div className="flex gap-2">
              <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "px-3 h-9 rounded-lg text-sm font-medium flex items-center gap-1.5 transition cursor-pointer", 
                    view === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" /> List
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={cn(
                    "px-3 h-9 rounded-lg text-sm font-medium flex items-center gap-1.5 transition cursor-pointer", 
                    view === "calendar" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" /> Calendar
                </button>
              </div>
              <Button onClick={() => history.push("/client/courts")} className="rounded-xl h-10 shadow-brand font-medium cursor-pointer">
                <Plus className="mr-1 h-4 w-4" /> New booking
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
                    ? "bg-primary text-primary-foreground border-primary shadow-brand"
                    : "bg-card text-foreground border-border hover:border-primary/40",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Renderizado de Vistas */}
          {loading ? (
            <div className="text-center p-16 text-muted-foreground font-medium">Loading reservations...</div>
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
                      onClick={() => history.push(r.status === "temporary" ? "/client/reservations/pending" : `/client/reservations/${r.id}`)}
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
                          <h3 className="font-display font-semibold truncate text-foreground text-base md:text-lg">{c?.name || "GameZone Court"}</h3>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c?.location || "Main Complex"}</span>
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
            <CalendarView reservations={reservations} />
          )}

        </div>
      </IonContent>
    </IonPage>
  );
}

function CalendarView({ reservations }: { reservations: any[] }) {
  const start = new Date(2026, 4, 1); // Mayo 2026 como base fija
  const days = Array.from({ length: 35 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() - start.getDay() + i);
    return d;
  });

  return (
    <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-foreground">May 2026</h3>
        <div className="text-xs text-muted-foreground font-medium">
          {reservations.filter(r => r.status === "confirmed").length} confirmed bookings
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground font-semibold text-center border-b border-border pb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {days.map((d, i) => {
          // Transformamos la fecha de la celda actual al formato ISO 'YYYY-MM-DD' de forma segura
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const cellIsoDate = `${year}-${month}-${day}`;
          
          // Buscamos si existe alguna reserva confirmada para este día usando el formato ISO real
          const dayReservation = reservations.find(
            (x) => x.date === cellIsoDate && x.status === "confirmed"
          );
          
          const out = d.getMonth() !== 4; // Determina si el día pertenece a un mes fuera de Mayo

          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-lg border p-1.5 text-xs relative flex flex-col justify-between transition",
                out ? "opacity-30 border-transparent bg-transparent" : "border-border bg-background",
                dayReservation && "bg-primary-soft border-primary/30",
              )}
            >
              <div className={cn("font-bold text-muted-foreground", dayReservation && "text-primary")}>
                {d.getDate()}
              </div>
              {dayReservation && (
                <div className="w-full truncate text-[9px] font-bold text-primary bg-primary-soft rounded px-1 py-0.5 mt-1 text-center">
                  {dayReservation.startTime}
                </div>
              )}
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
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">No reservations yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
        Once you book a court your reservations will show up here.
      </p>
      <Button onClick={onBrowse} className="mt-6 rounded-xl shadow-brand font-medium cursor-pointer">
        Browse courts
      </Button>
    </Card>
  );
}