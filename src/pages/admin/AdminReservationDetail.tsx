import { useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, User, Users, XCircle } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { IonContent, IonPage } from "@ionic/react";
import { db } from "../../firebase/config";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { StatusBadge } from "../../components/status-badge";
import { useAdminReservations } from "../../hooks/useAdminReservations";
import { useNotifications } from "../../hooks/useNotifications";

export default function AdminReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { reservations, loadingReservations } = useAdminReservations();
  const { createNotification } = useNotifications();
  const [cancelling, setCancelling] = useState(false);

  const reservation = useMemo(
    () => reservations.find((item) => item.id === id),
    [id, reservations]
  );

  const cancelReservation = async () => {
    if (!reservation) return;

    const confirm = window.confirm("¿Cancelar esta reserva? El cliente será notificado.");
    if (!confirm) return;

    setCancelling(true);
    try {
      await updateDoc(doc(db, "reservations", reservation.id), {
        status: "cancelada",
      });

      await createNotification({
        userId: reservation.userId,
        title: "Reserva cancelada",
        message: "Tu reserva fue cancelada por el administrador.",
        type: "reservation_cancelled",
        reservationId: reservation.id,
        courtId: reservation.courtId,
      });
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      alert("No se pudo cancelar la reserva.");
    } finally {
      setCancelling(false);
    }
  };

  if (loadingReservations) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-muted-foreground">
        Cargando detalle de la reserva...
      </div>
    );
  }

  if (!reservation) {
    return (
      <IonPage>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8fafc] p-6 text-center">
          <h1 className="text-xl font-bold text-foreground">Reserva no encontrada</h1>
          <Button onClick={() => history.push("/admin/reservations")}>
            Volver a reservas
          </Button>
        </div>
      </IonPage>
    );
  }

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ "--background": "#f8fafc" }}>
        <div className="min-h-screen bg-[#f8fafc] p-6 text-[#334155] md:p-10">
          <main className="mx-auto max-w-5xl space-y-6">
            <button
              onClick={() => history.push("/admin/reservations")}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#0052FF]/15 bg-white px-4 py-2 text-sm font-semibold text-[#0052FF] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0052FF]/35 hover:bg-[#0052FF]/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a reservas
            </button>

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reserva GZ-{reservation.id.slice(0, 5).toUpperCase()}
                </div>
                <h1 className="mt-1 text-3xl font-display font-bold text-foreground">
                  {reservation.courtName}
                </h1>
              </div>
              <StatusBadge status={reservation.status} className="text-sm px-3 py-1" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-2xl border-border bg-card p-6 shadow-sm lg:col-span-2">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Información de la reserva
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Detail icon={Calendar} label="Fecha" value={reservation.date} />
                  <Detail icon={Clock} label="Hora" value={`${reservation.startTime} - ${reservation.endTime}`} />
                  <Detail icon={MapPin} label="Cancha" value={reservation.courtName} />
                  <Detail icon={Users} label="Jugadores" value={String(reservation.playersCount)} />
                </div>
              </Card>

              <Card className="rounded-2xl border-border bg-card p-6 shadow-sm">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Cliente
                </h2>
                <div className="mt-5 space-y-4">
                  <Detail icon={User} label="Nombre" value={reservation.userDisplayName} />
                  <Detail icon={User} label="Correo" value={reservation.userEmail || "No disponible"} />
                </div>
              </Card>

              <Card className="rounded-2xl border-border bg-card p-6 shadow-sm lg:col-span-2">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Pago y notas
                </h2>
                <div className="mt-5 space-y-2 text-sm">
                  <Row label="Total" value={`$${reservation.totalPrice.toLocaleString("es-CO")}`} />
                  <Row label="Duración" value={`${reservation.duration} minutos`} />
                  <Row label="Notas" value={reservation.notes || "Sin notas"} />
                </div>
              </Card>

              <Card className="rounded-2xl border-border bg-card p-6 shadow-sm">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Acciones administrativas
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Revisa el estado de la reserva y aplica cambios cuando sea necesario.
                </p>
                {reservation.status !== "cancelada" && reservation.status !== "expirada" && (
                  <Button
                    variant="destructive"
                    disabled={cancelling}
                    onClick={cancelReservation}
                    className="mt-5 w-full rounded-xl"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {cancelling ? "Cancelando..." : "Cancelar reserva"}
                  </Button>
                )}
              </Card>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
