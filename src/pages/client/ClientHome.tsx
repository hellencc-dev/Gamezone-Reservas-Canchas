import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonPage } from "@ionic/react";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Flame,
  MapPin,
  Plus,
  Timer,
  TrendingUp,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { CourtCard } from "../../components/CourtCard";
import { StatusBadge } from "../../components/status-badge";

import { useAuth } from "../../hooks/useAuth";
import { useCourts } from "../../hooks/useCourts";
import { useReservations } from "../../hooks/useReservations";
import { db } from "../../firebase/config";
import { doc, updateDoc } from "firebase/firestore";

const TOTAL_TIME = 5 * 60; 

export default function ClientHome() {
  const { user } = useAuth();
  const { courts, loading } = useCourts();
  const history = useHistory();
  const { reservations, loadingReservations } = useReservations();

  // Estado para el temporizador local
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const upcoming = reservations.filter((r) => r.status === "confirmed" || r.status === "temporary");
  
  // Encontrar si hay un hold temporal activo actualmente
  const activeHold = reservations.find((r) => r.status === "temporary");

  // Efecto para controlar la cuenta regresiva del Hold
  useEffect(() => {
    if (loadingReservations || !activeHold) {
      setTimeLeft(null);
      return;
    }

    if (activeHold.createdAt) {
      const createdTime = (activeHold.createdAt as any).toDate 
        ? (activeHold.createdAt as any).toDate().getTime() 
        : new Date(activeHold.createdAt).getTime();
        
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - createdTime) / 1000);
      const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
      setTimeLeft(remaining);
    } else {
      setTimeLeft(TOTAL_TIME);
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          // Marcar como cancelado en Firebase de forma asíncrona si expira
          const docRef = doc(db, "reservations", activeHold.id);
          updateDoc(docRef, { status: "cancelled" }).catch(console.error);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeHold, loadingReservations]);

  // Formatear el tiempo restante en MM:SS
  const formatTime = () => {
    if (timeLeft === null || timeLeft <= 0) return "00:00";
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const stats = [
    { label: "Active bookings", value: upcoming.length, icon: CalendarCheck, tint: "bg-primary-soft text-primary" },
    { label: "Played this month", value: 12, icon: Flame, tint: "bg-accent-soft text-accent" },
    { label: "Hours on court", value: "26h", icon: Clock, tint: "bg-success-soft text-success" },
    { label: "Loyalty points", value: 1840, icon: TrendingUp, tint: "bg-warning-soft text-warning" },
  ];

  const sports = [
    { id: "futbol", name: "Fútbol", courts: 5, icon: CalendarCheck, gradient: "from-emerald-500 to-teal-600" },
    { id: "tenis", name: "Tenis", courts: 3, icon: CalendarCheck, gradient: "from-amber-400 to-orange-500" },
    { id: "baloncesto", name: "Basketball", courts: 2, icon: CalendarCheck, gradient: "from-blue-500 to-indigo-600" },
  ];

  return (
    <IonPage className="overflow-auto min-h-screen bg-[#f8fafc]">
      <div className="w-full text-[#334155] p-6 md:p-10 space-y-8 bg-[#f8fafc]">
        
        {/* Hero greeting */}
        <div className="rounded-3xl gradient-brand p-8 md:p-10 text-primary-foreground shadow-brand relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="text-sm opacity-80">Good evening, {user?.firstName || "cliente"} 👋</div>
              <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold">Ready for tonight's match?</h1>
              <p className="mt-2 text-primary-foreground/80 max-w-md">
                You have {upcoming.length} upcoming reservations and {courts ? courts.length : 0} courts available within 5 km.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="rounded-xl h-11" onClick={() => history.push("/client/courts", { selectedSport: "all" })}>
                <Plus className="mr-1 h-4 w-4" /> Book a court
              </Button>
              <Button variant="outline" className="rounded-xl h-11 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white" onClick={() => history.push("/client/reservations")}>
                My reservations
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-5 rounded-2xl border-border bg-card shadow-sm">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.tint}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-2xl font-display font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Sports quick pick */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-display font-bold">Choose your sport</h2>
            <Button variant="ghost" size="sm" onClick={() => history.push("/client/courts", { selectedSport: "all" })}>
              All sports <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {sports.map((s) => (
              <div
                key={s.id}
                onClick={() => history.push("/client/courts", { selectedSport: s.id })}
                className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-elevated transition-all text-center cursor-pointer shadow-sm"
              >
                <div className={`h-12 w-12 mx-auto rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                  <div className="h-6 w-6 text-white flex items-center justify-center">⚽</div>
                </div>
                <div className="mt-3 font-medium text-sm">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">{s.courts} courts</div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming + featured */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 rounded-2xl border-border bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Upcoming reservations</h2>
              <Button size="sm" variant="ghost" onClick={() => history.push("/client/reservations")}>
                View all
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {upcoming.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No upcoming reservations
                </div>
              )}

              {!loading && !loadingReservations && courts && upcoming.map((r) => {
                const c = courts.find((court) => court.id === r.courtId);

                return (
                  <div
                    key={r.id}
                    onClick={() => history.push(`/client/reservations/${r.id}`)}
                    className="flex items-center gap-4 rounded-xl border border-border bg-background p-3 hover:border-primary/40 transition cursor-pointer shadow-sm"
                  >
                    <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-secondary flex items-center justify-center">
                      {c?.image ? (
                        <img src={c.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate text-foreground">{c?.name || "GameZone Court"}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c?.location || "GameZone"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-medium">
                        {r.date} · {r.startTime} – {r.endTime}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ⏳ COMPONENTE DINÁMICO DEL HOLD TEMPORAL */}
          <Card className={`p-6 rounded-2xl border-border bg-card shadow-sm transition-all duration-300 ${activeHold ? "opacity-100 scale-100" : "opacity-40 scale-95 cursor-not-allowed"}`}>
            <div className="flex items-center gap-2">
              <Timer className={`h-5 w-5 ${timeLeft !== null && timeLeft < 60 ? "text-danger animate-pulse" : "text-accent"}`} />
              <h2 className="font-display font-bold text-foreground">Hold expires soon</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Complete payment to confirm your booking.</p>
            
            <div className={`mt-4 rounded-xl p-4 text-center transition-colors ${timeLeft !== null && timeLeft < 60 ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"}`}>
              <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Time remaining</div>
              <div className="text-3xl font-display font-bold mt-1 tabular-nums">
                {activeHold ? formatTime() : "00:00"}
              </div>
            </div>

            <Button 
              disabled={!activeHold || (timeLeft !== null && timeLeft <= 0)}
              className="w-full mt-4 rounded-xl font-medium cursor-pointer" 
              onClick={() => history.push({
                pathname: "/client/reserve/pending",
                state: { reservationId: activeHold?.id }
              })}
            >
              Complete payment
            </Button>
          </Card>
        </div>

        {/* Featured courts */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-display font-bold">Recommended for you</h2>
            <Button variant="ghost" size="sm" onClick={() => history.push("/client/courts", { selectedSport: "all" })}>
              Browse all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {loading ? (
            <div className="text-center p-6 text-sm text-muted-foreground font-medium">Loading courts...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courts && courts.slice(0, 3).map((c) => (
                <CourtCard key={c.id} court={c} />
              ))}
            </div>
          )}
        </section>

      </div>
    </IonPage>
  );
}