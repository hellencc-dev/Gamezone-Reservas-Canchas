import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, Filter, Search, XCircle } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { IonContent, IonPage } from "@ionic/react";
import { db } from "../../firebase/config";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { StatusBadge } from "../../components/status-badge";
import {
  AdminReservation,
  ReservationStatus,
  useAdminReservations,
} from "../../hooks/useAdminReservations";
import { useNotifications } from "../../hooks/useNotifications";

type StatusFilter = "all" | ReservationStatus;

const statusTabs: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "temporal", label: "Temporales" },
  { id: "confirmada", label: "Confirmadas" },
  { id: "cancelada", label: "Canceladas" },
  { id: "expirada", label: "Expiradas" },
];

export default function AdminReservations() {
  const history = useHistory();
  const { reservations, loadingReservations } = useAdminReservations();
  const { createNotification } = useNotifications();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [courtQuery, setCourtQuery] = useState("");
  const [date, setDate] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesStatus = status === "all" || reservation.status === status;
      const query = courtQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        reservation.courtName.toLowerCase().includes(query) ||
        reservation.userDisplayName.toLowerCase().includes(query) ||
        reservation.userEmail.toLowerCase().includes(query);
      const matchesDate = !date || reservation.date === date;

      return matchesStatus && matchesQuery && matchesDate;
    });
  }, [courtQuery, date, reservations, status]);

  const cancelReservation = async (reservation: AdminReservation) => {
    const confirm = window.confirm("¿Cancelar esta reserva? El cliente será notificado.");
    if (!confirm) return;

    setUpdatingId(reservation.id);
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
      setUpdatingId(null);
    }
  };

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ "--background": "#f8fafc" }}>
        <div className="min-h-screen bg-[#f8fafc] p-6 text-[#334155] md:p-10">
          <main className="mx-auto max-w-7xl space-y-6">
            <button
              onClick={() => history.push("/admin")}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#0052FF]/15 bg-white px-4 py-2 text-sm font-semibold text-[#0052FF] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0052FF]/35 hover:bg-[#0052FF]/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al panel
            </button>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Reservas del sistema
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Consulta todas las reservas, filtra por estado y cancela cuando sea necesario.
                </p>
              </div>
              <Button onClick={() => history.push("/admin")} variant="outline" className="rounded-xl">
                Volver
              </Button>
            </div>

            <Card className="rounded-2xl border-border bg-card p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={courtQuery}
                    onChange={(event) => setCourtQuery(event.target.value)}
                    placeholder="Buscar por cancha, cliente o correo"
                    className="h-11 rounded-xl bg-background pl-9"
                  />
                </div>
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-11 rounded-xl bg-background"
                />
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatus(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      status === tab.id
                        ? "border-[#0052FF] bg-[#0052FF] text-white shadow-[0_10px_24px_-14px_rgba(0,82,255,0.55)]"
                        : "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-[#0052FF]/35 hover:bg-[#0052FF]/5 hover:text-[#0052FF]"
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </Card>

            {loadingReservations ? (
              <Card className="rounded-2xl border-border bg-card p-12 text-center text-muted-foreground">
                Cargando reservas...
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-border bg-card p-12 text-center">
                <h2 className="font-display text-lg font-bold text-foreground">
                  No hay reservas con esos filtros
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cambia el estado, la fecha o la búsqueda.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((reservation) => (
                  <Card
                    key={reservation.id}
                    className="rounded-2xl border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-elevated"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {reservation.courtName}
                          </h3>
                          <StatusBadge status={reservation.status} />
                        </div>
                        <div className="mt-2 grid gap-1 text-sm text-muted-foreground md:grid-cols-3">
                          <span>{reservation.userDisplayName}</span>
                          <span>{reservation.userEmail || "Correo no disponible"}</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {reservation.date} · {reservation.startTime} - {reservation.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => history.push(`/admin/reservations/${reservation.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Detalle
                        </Button>
                        {reservation.status !== "cancelada" && reservation.status !== "expirada" && (
                          <Button
                            variant="destructive"
                            disabled={updatingId === reservation.id}
                            onClick={() => cancelReservation(reservation)}
                            className="rounded-xl"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {updatingId === reservation.id ? "Cancelando..." : "Cancelar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}
