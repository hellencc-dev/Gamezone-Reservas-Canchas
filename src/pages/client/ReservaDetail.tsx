import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { IonPage, IonContent } from "@ionic/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Download,
  MapPin,
  MessageSquare,
  Share2,
  X,
  Trophy,
  Target
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
  basketball: { name: "Basketball", icon: Calendar },
};

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>(); // Capturamos el ID de la ruta
  const history = useHistory();
  const { reservations, loadingReservations } = useReservations();
  const { courts, loading: loadingCourts } = useCourts();

  const [cancelling, setCancelling] = useState(false);

  // Buscar la reserva específica
  const reservation = reservations.find((x) => x.id === id);
  // Buscar la cancha vinculada a esa reserva
  const court = courts?.find((c) => c.id === reservation?.courtId);

  const loading = loadingReservations || loadingCourts;

  // Acción para cancelar la reserva en Firebase en tiempo real
  const handleCancelReservation = async () => {
    if (!reservation) return;
    
    const confirmar = window.confirm("Are you sure you want to cancel this reservation? This action cannot be undone.");
    if (!confirmar) return;

    setCancelling(true);
    try {
      const docRef = doc(db, "reservations", reservation.id);
      await updateDoc(docRef, { status: "cancelled" });
      alert("Reservation cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("Could not cancel reservation. Try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] flex items-center justify-center text-muted-foreground">
        Loading reservation details...
      </div>
    );
  }

  if (!reservation || !court) {
    return (
      <IonPage>
        <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <p className="text-lg font-bold text-foreground">Reservation not found</p>
          <Button onClick={() => history.push("/client/reservations")}>Back to reservations</Button>
        </div>
      </IonPage>
    );
  }

  const sportData = sportIconMap[court.sport?.toLowerCase()] || { name: court.sport || "Sport", icon: Calendar };

  // SOLUCIÓN AL TIPADO: Usamos variables locales basadas en el precio total real guardado
  const baseRate = court.price || 0;
  const serviceFee = 2.50;
  
  // Si totalPrice existe en Firebase lo usamos directamente, sino calculamos una hora estándar
  const totalPaid = Number(reservation.totalPrice) || (baseRate + serviceFee);
  
  // Visualmente calculamos la etiqueta o mostramos los 60 min por defecto del slot
  const durationLabel = "60 min"; 

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ '--background': '#f8fafc' }}>
        <div className="w-full min-h-screen text-[#334155] p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Botón de Atrás */}
            <button 
              onClick={() => history.push("/client/reservations")} 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none p-0 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to reservations
            </button>

            {/* Título de la sección */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs text-muted-foreground font-semibold font-mono uppercase tracking-wider">
                  Reservation GZ-{reservation.id.slice(0, 5).toUpperCase()}
                </div>
                <h1 className="text-3xl font-display font-bold mt-1 text-foreground">{court.name}</h1>
              </div>
              <StatusBadge status={reservation.status} className="text-sm px-3 py-1 font-semibold" />
            </div>

            {/* Banner de Imagen */}
            <div className="rounded-2xl overflow-hidden aspect-[3/1] bg-secondary shadow-sm">
              {court.image ? (
                <img src={court.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">No image available</div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* DETALLES DE LA RESERVA */}
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">Booking details</h3>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <Detail icon={Calendar} label="Date" value={reservation.date} />
                    <Detail icon={Clock} label="Time" value={`${reservation.startTime} – ${reservation.endTime} (${durationLabel})`} />
                    <Detail icon={MapPin} label="Location" value={court.location} />
                    <Detail icon={sportData.icon} label="Sport" value={sportData.name} />
                  </div>
                </Card>

                {/* DETALLES FINALES DE PRECIOS */}
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">Payment</h3>
                  <div className="mt-4 space-y-2 text-sm">
                    <Row label="Court rate" value={`$${baseRate}.00 / hr`} />
                    <Row label="Duration factor" value={durationLabel} />
                    <Row label="Service fee" value={`$${serviceFee.toFixed(2)}`} />
                    <div className="pt-2 mt-2 border-t border-border flex justify-between items-baseline">
                      <span className="font-bold text-foreground">Total paid</span>
                      <span className="font-display font-bold text-xl text-primary">${totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground font-medium">
                      <CreditCard className="h-4 w-4 text-primary" /> Visa ending in 4242 · Approved by GameZone
                    </div>
                  </div>
                </Card>

                {/* LÍNEA DE TIEMPO */}
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">Timeline</h3>
                  <div className="mt-4 space-y-4 relative before:absolute before:bottom-2 before:top-2 before:left-[5px] before:w-0.5 before:bg-border">
                    {[
                      { t: "Reservation created", time: "Completed successfully", done: true },
                      { t: "Payment confirmed", time: "Funds secured", done: reservation.status !== "temporary" && reservation.status !== "cancelled" },
                      { t: "Reminder scheduling", time: "1 hour before match", done: reservation.status === "confirmed" },
                      { t: "Match closure", time: "Status review", done: reservation.status === "expired" },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                        <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 transition-colors duration-300 ${step.done ? "bg-primary ring-4 ring-primary-soft" : "bg-border"}`} />
                        <div>
                          <div className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.t}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{step.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* PANEL DE ACCIONES LATERALES */}
              <div className="space-y-4">
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold text-lg text-foreground">Actions</h3>
                  <div className="mt-4 space-y-2">
                    <Button type="button" className="w-full rounded-xl h-11 font-medium cursor-pointer"><Download className="mr-2 h-4 w-4" /> Download receipt</Button>
                    <Button type="button" variant="outline" className="w-full rounded-xl h-11 font-medium cursor-pointer"><Share2 className="mr-2 h-4 w-4" /> Share booking</Button>
                    <Button type="button" variant="outline" className="w-full rounded-xl h-11 font-medium cursor-pointer"><MessageSquare className="mr-2 h-4 w-4" /> Contact venue</Button>
                    
                    {/* Botón condicional */}
                    {reservation.status === "confirmed" && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        disabled={cancelling}
                        onClick={handleCancelReservation}
                        className="w-full rounded-xl h-11 font-medium border-danger/40 text-danger hover:bg-danger-soft hover:text-danger cursor-pointer disabled:opacity-50"
                      >
                        <X className="mr-2 h-4 w-4" /> {cancelling ? "Cancelling..." : "Cancel reservation"}
                      </Button>
                    )}
                  </div>
                </Card>
                
                <Card className="p-6 rounded-2xl gradient-brand text-primary-foreground shadow-sm">
                  <h3 className="font-display font-bold text-base">Need to change?</h3>
                  <p className="text-xs text-primary-foreground/80 mt-1 leading-relaxed">
                    Free cancellation is allowed up to 24h before your scheduled slot. Funds will be returned to your original payment card.
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