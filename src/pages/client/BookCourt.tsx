import { useState } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { IonPage, IonContent } from "@ionic/react";
import { ArrowLeft, CheckCircle2, Clock, MapPin, ShieldCheck, Trophy, Target, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useCourts } from "../../hooks/useCourts";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { useAvailability } from "../../hooks/useAvailability";
import { db } from "../../firebase/config";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { cn } from "../../lib/utils";
import {
  formatMinutesToDisplay,
  getAvailabilityForDate,
  getOverlappingReservations,
  parseTimeToMinutes,
  slotFitsIntervals,
} from "../../helpers/availabilityHelpers";

interface NavigationState {
  date: string;
  slot: string;
}

function getLocalIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const sportIconMap: Record<string, { name: string; icon: any }> = {
  futbol: { name: "Fútbol", icon: Trophy },
  tenis: { name: "Tenis", icon: Target },
  baloncesto: { name: "Baloncesto", icon: Calendar },
  basketball: { name: "Baloncesto", icon: Calendar },
};

export default function BookCourt() {
  const { courtId } = useParams<{ courtId: string }>();
  const history = useHistory();
  const location = useLocation<NavigationState>();
  const { user } = useAuth();
  const { courts, loading } = useCourts();
  const { createNotification, notifyAdmins } = useNotifications();
  const { availability, specialDates, loadingAvailability } = useAvailability(courtId);

  const selectedDate = location.state?.date || getLocalIsoDate();
  const selectedSlot = location.state?.slot || "06:00 PM";

  const court = courts?.find((c) => c.id === courtId);

  const [duration, setDuration] = useState<60 | 90 | 120>(60);
  const [playersCount, setPlayersCount] = useState("6");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const baseRate = court?.price || 0;
  const courtTotal = (baseRate * duration) / 60;
  const serviceFee = 2.50;
  const grandTotal = courtTotal + serviceFee;

  const handleCreateHold = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      const availabilityDecision = getAvailabilityForDate({
        date: selectedDate,
        weeklyAvailability: availability,
        specialDates,
        courtActive: court?.active,
        courtStatus: court?.status,
      });

      if (!availabilityDecision.available) {
        alert(availabilityDecision.reason || "La cancha no está disponible para esta fecha.");
        return;
      }

      if (!slotFitsIntervals(selectedSlot, duration, availabilityDecision.intervals)) {
        alert("La duración seleccionada no cabe dentro del horario disponible.");
        return;
      }

      const reservationsQuery = query(
        collection(db, "reservations"),
        where("courtId", "==", courtId),
        where("date", "==", selectedDate)
      );
      const reservationsSnapshot = await getDocs(reservationsQuery);
      const reservations = reservationsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const overlaps = getOverlappingReservations(selectedSlot, duration, reservations);

      if (overlaps.length > 0) {
        alert("Este horario se cruza con otra reserva. Elige otro horario disponible.");
        return;
      }

      const startMinutes = parseTimeToMinutes(selectedSlot);
      const endTimeFormatted =
        startMinutes === null ? selectedSlot : formatMinutesToDisplay(startMinutes + duration);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

      const newReservation = {
        userId: user.uid,
        courtId: courtId,
        date: selectedDate,
        startTime: selectedSlot,
        endTime: endTimeFormatted,
        duration: duration,
        playersCount: parseInt(playersCount) || 1,
        notes: notes,
        status: "temporal",
        totalPrice: grandTotal,
        createdAt: now,
        expiresAt,
        lockedUntil: expiresAt,
      };

      const docRef = await addDoc(collection(db, "reservations"), newReservation);
      
      await createNotification({
        userId: user.uid,
        title: "Reserva temporal creada",
        message: "Tu reserva fue creada. Tienes 5 minutos para confirmar el pago.",
        type: "payment_pending",
        reservationId: docRef.id,
        courtId: courtId
      });

      await notifyAdmins({
        title: "Nueva reserva temporal",
        message: "Nueva reserva temporal creada por un cliente.",
        type: "reservation_created",
        reservationId: docRef.id,
        courtId: courtId
      });
      
      history.push({
        pathname: "/client/reserve/pending",
        state: { reservationId: docRef.id }
      });

    } catch (error) {
      console.error("Error al guardar el hold de la reserva:", error);
      alert("No se pudo crear la reserva. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingAvailability) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] flex items-center justify-center text-muted-foreground">
        Cargando detalles de la reserva...
      </div>
    );
  }

  if (!court) return null;

  const sportData = sportIconMap[court.sport?.toLowerCase()] || { name: court.sport || "Sport", icon: Calendar };

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ '--background': '#f8fafc' }}>
        <div className="w-full min-h-screen text-[#334155]">
          <main className="max-w-7xl mx-auto space-y-6 p-6 md:p-10">
            
            <button 
              onClick={() => history.push(`/client/courts/${court.id}/availability`)} 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a disponibilidad
            </button>

            <div>
              <h1 className="text-3xl font-display font-bold">Confirma tu reserva</h1>
              <p className="text-muted-foreground mt-1">Revisa los detalles y crea una reserva temporal de 5 minutos.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold">Duración del partido</h3>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[60, 90, 120].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDuration(m as 60 | 90 | 120)}
                        className={cn(
                          "rounded-xl border py-4 text-center transition cursor-pointer flex flex-col items-center justify-center",
                          duration === m
                            ? "bg-primary text-primary-foreground border-primary shadow-brand font-semibold"
                            : "bg-background border-border hover:border-primary/40 text-foreground",
                        )}
                      >
                        <div className="text-lg font-display font-bold">{m}m</div>
                        <div className={cn("text-xs mt-0.5", duration === m ? "text-white/90" : "text-muted-foreground")}>
                          ${(baseRate * m) / 60}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold">Datos del jugador</h3>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nombre completo</Label>
                      <Input disabled value={`${user?.firstName || ""} ${user?.lastName || ""}`} className="h-11 rounded-xl bg-muted" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Teléfono</Label>
                      <Input disabled value={user?.phone || "+57 (300) 123-4567"} className="h-11 rounded-xl bg-muted" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Email</Label>
                      <Input disabled value={user?.email || ""} className="h-11 rounded-xl bg-muted" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Jugadores</Label>
                      <Input type="number" value={playersCount} onChange={(e) => setPlayersCount(e.target.value)} className="h-11 rounded-xl bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notas</Label>
                      <Input placeholder="¿Alguna solicitud especial?" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-11 rounded-xl bg-background" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold">Método de pago</h3>
                  <div className="mt-4 space-y-2">
                    {["Visa •••• 4242", "Mastercard •••• 1881", "PayPal"].map((m, i) => (
                      <label
                        key={m}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition",
                          i === 0 ? "border-primary bg-primary-soft text-primary font-medium" : "border-border hover:border-primary/40 bg-background text-foreground",
                        )}
                      >
                        <input type="radio" name="pm" defaultChecked={i === 0} className="accent-primary" />
                        <span className="text-sm font-medium">{m}</span>
                        {i === 0 && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-success" /> Pago protegido por GameZone
                  </div>
                </Card>
              </div>

              <Card className="p-6 rounded-2xl border-border bg-card h-fit lg:sticky lg:top-24 shadow-sm">
                <div className="flex gap-3 border-b border-border pb-4">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-secondary shrink-0">
                    {court.image ? (
                      <img src={court.image} alt="" className="h-full w-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted text-xs">Sin imagen</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-semibold truncate text-foreground">{court.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {court.location}</div>
                    <div className="text-xs text-primary font-medium mt-0.5">{sportData.name}</div>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <Row label="Fecha" value={selectedDate} />
                  <Row label="Hora" value={`${selectedSlot} (${duration}m)`} />
                  <Row label="Tarifa de cancha" value={`$${baseRate} / hora`} />
                  <Row label="Servicio" value={`$${serviceFee.toFixed(2)}`} />
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-baseline">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-display font-bold text-primary">${grandTotal.toFixed(2)}</span>
                </div>

                <Button
                  disabled={submitting}
                  onClick={handleCreateHold}
                  className="w-full mt-5 h-12 rounded-xl shadow-brand font-medium text-base cursor-pointer disabled:opacity-50"
                >
                  <Clock className="mr-2 h-4 w-4" /> {submitting ? "Creando reserva..." : "Retener cancha por 5 minutos"}
                </Button>
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                  Tendrás 5 minutos para confirmar el pago antes de liberar el horario.
                </p>
              </Card>
            </div>

          </main>
        </div>
      </IonContent>
    </IonPage>
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
