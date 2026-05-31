import { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Download,
  MapPin,
  MessageSquare,
  Share2,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { StatusBadge } from "../../components/status-badge";
import { useReservations } from "../../hooks/useReservations";
import { useCourts } from "../../hooks/useCourts";
import { db } from "../../firebase/config";
import { doc, updateDoc } from "firebase/firestore";

const sportIconMap: Record<string, { name: string; icon: any }> = {
  futbol: { name: "Fútbol", icon: Trophy },
  tenis: { name: "Tenis", icon: Target },
  baloncesto: { name: "Baloncesto", icon: Calendar },
  basketball: { name: "Baloncesto", icon: Calendar },
};

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { reservations, loadingReservations } = useReservations();
  const { courts, loading: loadingCourts } = useCourts();

  const [cancelling, setCancelling] = useState(false);

  const reservation = reservations.find((item) => item.id === id);
  const court = courts?.find((item) => item.id === reservation?.courtId);
  const loading = loadingReservations || loadingCourts;

  const handleCancelReservation = async () => {
    if (!reservation) return;

    const confirm = window.confirm(
      "¿Seguro que quieres cancelar esta reserva? Esta acción no se puede deshacer."
    );
    if (!confirm) return;

    setCancelling(true);
    try {
      await updateDoc(doc(db, "reservations", reservation.id), {
        status: "cancelada",
      });
      alert("Reserva cancelada correctamente.");
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      alert("No se pudo cancelar la reserva. Inténtalo de nuevo.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] flex items-center justify-center text-muted-foreground">
        Cargando detalles de la reserva...
      </div>
    );
  }

  if (!reservation || !court) {
    return (
      <IonPage>
        <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <p className="text-lg font-bold text-foreground">Reserva no encontrada</p>
          <Button onClick={() => history.push("/client/reservations")}>
            Volver a reservas
          </Button>
        </div>
      </IonPage>
    );
  }

  const sportData = sportIconMap[court.sport?.toLowerCase()] || {
    name: court.sport || "Deporte",
    icon: Calendar,
  };

  const baseRate = court.price || 0;
  const serviceFee = 2.5;
  const totalPaid = Number(reservation.totalPrice) || baseRate + serviceFee;
  const durationLabel = `${reservation.duration || 60} min`;

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ "--background": "#f8fafc" }}>
        <div className="w-full min-h-screen text-[#334155] p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <button
              onClick={() => history.push("/client/reservations")}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#0052FF]/15 bg-white px-4 py-2 text-sm font-semibold text-[#0052FF] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0052FF]/35 hover:bg-[#0052FF]/5"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a reservas
            </button>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs text-muted-foreground font-semibold font-mono uppercase tracking-wider">
                  Reserva GZ-{reservation.id.slice(0, 5).toUpperCase()}
                </div>
                <h1 className="text-3xl font-display font-bold mt-1 text-foreground">
                  {court.name}
                </h1>
              </div>
              <StatusBadge status={reservation.status} className="text-sm px-3 py-1 font-semibold" />
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[3/1] bg-secondary shadow-sm">
              {court.image ? (
                <img src={court.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                  Imagen no disponible
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Detalles de la reserva
                  </h3>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <Detail icon={Calendar} label="Fecha" value={reservation.date} />
                    <Detail
                      icon={Clock}
                      label="Hora"
                      value={`${reservation.startTime} - ${reservation.endTime} (${durationLabel})`}
                    />
                    <Detail icon={MapPin} label="Ubicación" value={court.location} />
                    <Detail icon={sportData.icon} label="Deporte" value={sportData.name} />
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">Pago</h3>
                  <div className="mt-4 space-y-2 text-sm">
                    <Row label="Tarifa de cancha" value={`$${baseRate}.00 / hr`} />
                    <Row label="Duración" value={durationLabel} />
                    <Row label="Servicio" value={`$${serviceFee.toFixed(2)}`} />
                    <div className="pt-2 mt-2 border-t border-border flex justify-between items-baseline">
                      <span className="font-bold text-foreground">Total pagado</span>
                      <span className="font-display font-bold text-xl text-primary">
                        ${totalPaid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground font-medium">
                      <CreditCard className="h-4 w-4 text-primary" /> Pago aprobado por GameZone
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Línea de tiempo
                  </h3>
                  <div className="mt-4 space-y-4 relative before:absolute before:bottom-2 before:top-2 before:left-[5px] before:w-0.5 before:bg-border">
                    {[
                      { t: "Reserva creada", time: "Completado correctamente", done: true },
                      {
                        t: "Pago confirmado",
                        time: "Reserva confirmada",
                        done: reservation.status === "confirmada",
                      },
                      {
                        t: "Recordatorio programado",
                        time: "1 hora antes del partido",
                        done: reservation.status === "confirmada",
                      },
                      {
                        t: "Cierre de reserva",
                        time: "Estado final actualizado",
                        done:
                          reservation.status === "expirada" ||
                          reservation.status === "cancelada",
                      },
                    ].map((step) => (
                      <div key={step.t} className="flex gap-4 relative z-10">
                        <div
                          className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 transition-colors duration-300 ${
                            step.done ? "bg-primary ring-4 ring-primary-soft" : "bg-border"
                          }`}
                        />
                        <div>
                          <div
                            className={`text-sm font-semibold ${
                              step.done ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {step.t}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {step.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">Acciones</h3>
                  <div className="mt-4 space-y-2">
                    <Button type="button" className="w-full rounded-xl h-11 font-medium cursor-pointer">
                      <Download className="mr-2 h-4 w-4" /> Descargar recibo
                    </Button>
                    <Button type="button" variant="outline" className="w-full rounded-xl h-11 font-medium cursor-pointer">
                      <Share2 className="mr-2 h-4 w-4" /> Compartir reserva
                    </Button>
                    <Button type="button" variant="outline" className="w-full rounded-xl h-11 font-medium cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" /> Contactar sede
                    </Button>

                    {reservation.status === "confirmada" && (
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={cancelling}
                        onClick={handleCancelReservation}
                        className="w-full rounded-xl h-11 font-medium cursor-pointer disabled:opacity-50"
                      >
                        <X className="mr-2 h-4 w-4" /> {cancelling ? "Cancelando..." : "Cancelar reserva"}
                      </Button>
                    )}
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl gradient-brand text-primary-foreground shadow-sm">
                  <h3 className="font-display font-bold text-base">¿Necesitas cambiar algo?</h3>
                  <p className="text-xs text-primary-foreground/80 mt-1 leading-relaxed">
                    La cancelación está disponible hasta 24 horas antes del horario reservado.
                  </p>
                </Card>
              </div>
            </div>
          </div>
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
      <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="font-semibold text-foreground text-sm mt-0.5 truncate">{value}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
