import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonPage } from "@ionic/react";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Flame,
  LogOut,
  MapPin,
  Plus,
  Timer,
  TrendingUp,
} from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { CourtCard } from "../../components/CourtCard";
import { StatusBadge } from "../../components/status-badge";
import NotificationBell from "../../components/shared/NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import { useCourts } from "../../hooks/useCourts";
import { useReservations } from "../../hooks/useReservations";
import { useNotifications } from "../../hooks/useNotifications";
import { db } from "../../firebase/config";
import {
  getReservationRemainingSeconds,
  isActiveTemporaryReservation,
} from "../../helpers/availabilityHelpers";
import { normalizeReservationStatus } from "../../components/status-badge";

export default function ClientHome() {
  const { user, logout } = useAuth();
  const { courts, loading } = useCourts();
  const history = useHistory();
  const { reservations, loadingReservations } = useReservations();
  const { createNotification } = useNotifications();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const now = Date.now();
  const activeTemporaryReservations = reservations
    .filter((reservation) => isActiveTemporaryReservation(reservation, now))
    .sort(
      (a, b) =>
        getReservationRemainingSeconds(a, now) - getReservationRemainingSeconds(b, now)
    );
  const activeHold = activeTemporaryReservations[0] || null;
  const upcoming = reservations.filter(
    (reservation) =>
      reservation.status === "confirmada" ||
      isActiveTemporaryReservation(reservation, now)
  );

  useEffect(() => {
    if (loadingReservations || !activeHold) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(getReservationRemainingSeconds(activeHold));

    const interval = window.setInterval(() => {
      const remaining = getReservationRemainingSeconds(activeHold);

      if (remaining <= 0) {
        window.clearInterval(interval);
        setTimeLeft(0);

        const docRef = doc(db, "reservations", activeHold.id);
        getDoc(docRef)
          .then((snapshot) => {
            if (!snapshot.exists()) return null;

            const data = snapshot.data();

            if (normalizeReservationStatus(data.status || "") !== "temporal") return null;

            return updateDoc(docRef, { status: "expirada", expiredAt: new Date() }).then(() =>
              createNotification({
                userId: activeHold.userId,
                title: "Reserva expirada",
                message: "Tu reserva expiró porque no confirmaste el pago a tiempo.",
                type: "reservation_expired",
                reservationId: activeHold.id,
                courtId: activeHold.courtId,
              })
            );
          })
          .catch(console.error);
        return;
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeHold?.id, createNotification, loadingReservations]);

  const formatTime = () => {
    if (timeLeft === null || timeLeft <= 0) return "00:00";
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleLogout = async () => {
    await logout();
    history.push("/login");
  };

  const stats = [
    { label: "Reservas activas", value: upcoming.length, icon: CalendarCheck, tint: "bg-primary-soft text-primary" },
    { label: "Partidos este mes", value: 12, icon: Flame, tint: "bg-accent-soft text-accent" },
    { label: "Horas en cancha", value: "26h", icon: Clock, tint: "bg-success-soft text-success" },
    { label: "Puntos de fidelidad", value: 1840, icon: TrendingUp, tint: "bg-warning-soft text-warning" },
  ];

  const sports = [
    { id: "futbol", name: "Fútbol", courts: 5, gradient: "from-emerald-500 to-teal-600" },
    { id: "tenis", name: "Tenis", courts: 3, gradient: "from-amber-400 to-orange-500" },
    { id: "baloncesto", name: "Baloncesto", courts: 2, gradient: "from-blue-500 to-indigo-600" },
  ];

  return (
    <IonPage className="min-h-screen overflow-auto bg-[#f8fafc]">
      <div className="w-full space-y-8 bg-[#f8fafc] p-6 text-[#334155] md:p-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-extrabold text-white shadow-brand">
              GZ
            </div>
            <div>
              <div className="font-display text-lg font-bold text-foreground">GameZone</div>
              <div className="text-xs font-medium text-muted-foreground">Hola, {user?.firstName || "cliente"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="h-11 rounded-xl border-rose-100 bg-white px-4 font-semibold text-slate-700 shadow-sm hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-3xl gradient-brand p-8 text-primary-foreground shadow-brand md:p-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="text-sm opacity-80">Buenas tardes, {user?.firstName || "cliente"}</div>
              <h1 className="mt-2 text-3xl font-display font-bold md:text-4xl">
                ¿Listo para tu próximo partido?
              </h1>
              <p className="mt-2 max-w-md text-primary-foreground/80">
                Tienes {upcoming.length} reservas próximas y {courts ? courts.length : 0} canchas disponibles cerca.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                className="h-11 rounded-xl bg-white px-5 font-semibold text-blue-700 shadow-sm hover:bg-slate-50"
                onClick={() => history.push("/client/courts", { selectedSport: "all" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Reservar cancha
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-white/30 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white"
                onClick={() => history.push("/client/reservations")}
              >
                Mis reservas
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-2xl border-border bg-card p-5 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tint}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-2xl font-display font-bold">{stat.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-display font-bold">Elige tu deporte</h2>
            <Button variant="ghost" size="sm" onClick={() => history.push("/client/courts", { selectedSport: "all" })}>
              Ver todo <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
            {sports.map((sport) => (
              <div
                key={sport.id}
                onClick={() => history.push("/client/courts", { selectedSport: sport.id })}
                className="cursor-pointer rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-all hover:border-primary/40 hover:shadow-elevated"
              >
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${sport.gradient}`}>
                  <span className="text-white">●</span>
                </div>
                <div className="mt-3 text-sm font-medium">{sport.name}</div>
                <div className="text-[11px] text-muted-foreground">{sport.courts} canchas</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Próximas reservas</h2>
              <Button size="sm" variant="ghost" onClick={() => history.push("/client/reservations")}>
                Ver todo
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {upcoming.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No tienes reservas próximas
                </div>
              )}

              {!loading && !loadingReservations && courts && upcoming.map((reservation) => {
                const court = courts.find((item) => item.id === reservation.courtId);

                return (
                  <div
                    key={reservation.id}
                    onClick={() => history.push(`/client/reservations/${reservation.id}`)}
                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-background p-3 shadow-sm transition hover:border-primary/40"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
                      {court?.image ? (
                        <img src={court.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-foreground">{court?.name || "Cancha GameZone"}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{court?.location || "GameZone"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground">
                        {reservation.date} · {reservation.startTime} - {reservation.endTime}
                      </div>
                    </div>
                    <StatusBadge status={reservation.status} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className={`rounded-2xl border-border bg-card p-6 shadow-sm transition-all duration-300 ${activeHold ? "opacity-100 scale-100" : "opacity-40 scale-95 cursor-not-allowed"}`}>
            <div className="flex items-center gap-2">
              <Timer className={`h-5 w-5 ${timeLeft !== null && timeLeft < 60 ? "animate-pulse text-danger" : "text-accent"}`} />
              <h2 className="font-display font-bold text-foreground">Reserva temporal por expirar</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Confirma el pago para asegurar tu reserva.</p>

            <div className={`mt-4 rounded-xl p-4 text-center ${timeLeft !== null && timeLeft < 60 ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"}`}>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Tiempo restante</div>
              <div className="mt-1 text-3xl font-display font-bold tabular-nums">
                {activeHold ? formatTime() : "00:00"}
              </div>
            </div>

            <Button
              disabled={!activeHold || (timeLeft !== null && timeLeft <= 0)}
              className="mt-4 w-full rounded-xl font-medium"
              onClick={() =>
                history.push({
                  pathname: "/client/reserve/pending",
                  state: { reservationId: activeHold?.id },
                })
              }
            >
              Confirmar pago
            </Button>
          </Card>
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-display font-bold">Recomendadas para ti</h2>
            <Button variant="ghost" size="sm" onClick={() => history.push("/client/courts", { selectedSport: "all" })}>
              Ver todo <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {loading ? (
            <div className="p-6 text-center text-sm font-medium text-muted-foreground">Cargando canchas...</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courts && courts.slice(0, 3).map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          )}
        </section>
      </div>
    </IonPage>
  );
}
