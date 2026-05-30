import { useState, useEffect, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import { IonPage, IonContent } from "@ionic/react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useCourts } from "../../hooks/useCourts";
import { useAuth } from "../../hooks/useAuth";
import { useAvailability } from "../../hooks/useAvailability";
import { db } from "../../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { cn } from "../../lib/utils";
import {
  generateThirtyMinuteSlots,
  getAvailabilityForDate,
  getSlotStatus as getAvailabilitySlotStatus,
  slotFitsIntervals,
} from "../../helpers/availabilityHelpers";

function getWeek(offset: number) {
  const now = new Date(); 
  now.setDate(now.getDate() + offset * 7);
  const start = new Date(now);
  start.setDate(start.getDate() - start.getDay()); 
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function iso(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CourtAvailability() {
  const { courtId } = useParams<{ courtId: string }>();
  const history = useHistory();
  const { user } = useAuth();
  const { courts, loading } = useCourts();
  const { availability, specialDates, loadingAvailability } = useAvailability(courtId);

  const court = courts?.find((c) => c.id === courtId);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(iso(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  const [dayReservations, setDayReservations] = useState<any[]>([]);

  const week = getWeek(weekOffset);

  useEffect(() => {
    if (!courtId || !selectedDate) return;

    const q = query(
      collection(db, "reservations"),
      where("courtId", "==", courtId),
      where("date", "==", selectedDate)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resList: any[] = [];
      snapshot.forEach((reservationDoc) => {
        const data = reservationDoc.data();
        if (["confirmada", "confirmed", "temporal", "temporary"].includes(data.status)) {
          resList.push({ id: reservationDoc.id, ...data });
        }
      });
      setDayReservations(resList);
    });

    return () => unsubscribe();
  }, [courtId, selectedDate]);

  const availabilityDecision = useMemo(
    () =>
      getAvailabilityForDate({
        date: selectedDate,
        weeklyAvailability: availability,
        specialDates,
        courtActive: court?.active,
        courtStatus: court?.status,
      }),
    [availability, court?.active, court?.status, selectedDate, specialDates]
  );

  const timeSlots = useMemo(() => {
    if (!availabilityDecision.available) return [];

    return generateThirtyMinuteSlots(availabilityDecision.intervals).filter((slot) =>
      slotFitsIntervals(slot, 30, availabilityDecision.intervals)
    );
  }, [availabilityDecision]);

  const availableSlots = timeSlots.filter(
    (slot) => getAvailabilitySlotStatus(slot, 30, dayReservations, user?.uid) === "available"
  );

  const handleContinue = () => {
    if (!selectedSlot) return;
    history.push(`/client/courts/${courtId}/book`, {
      date: selectedDate,
      slot: selectedSlot
    });
  };

  if (loading || loadingAvailability) {
    return (
      <IonPage>
        <div className="w-full min-h-screen bg-[#f8fafc] flex items-center justify-center text-muted-foreground">
          Cargando disponibilidad...
        </div>
      </IonPage>
    );
  }

  if (!court) {
    return (
      <IonPage>
        <div className="w-full min-h-screen bg-[#f8fafc] p-6 text-center">
          <p className="text-lg font-bold">Cancha no encontrada</p>
          <Button onClick={() => history.push("/client/courts")} className="mt-4">Volver a canchas</Button>
        </div>
      </IonPage>
    );
  }

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ '--background': '#f8fafc' }}>
        <div className="w-full min-h-screen text-[#334155]">
          <main className="max-w-4xl mx-auto space-y-6 p-6 md:p-10">

            {/* Botón de Regreso */}
            <button 
              onClick={() => history.push(`/client/courts/${court.id}`)} 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a {court.name}
            </button>

            <div>
              <h1 className="text-3xl font-display font-bold">Elige tu horario</h1>
              <p className="text-muted-foreground mt-1">Selecciona fecha y hora para continuar.</p>
            </div>

            <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
              {/* Selector de Semana */}
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg capitalize">
                  {week[0].toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="rounded-xl cursor-pointer" onClick={() => setWeekOffset(weekOffset - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl cursor-pointer" onClick={() => setWeekOffset(weekOffset + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Grilla de los 7 Días de la semana */}
              <div className="mt-4 grid grid-cols-7 gap-2">
                {week.map((d) => {
                  const key = iso(d);
                  const active = key === selectedDate;
                  return (
                    <button
                      key={key}
                      onClick={() => { setSelectedDate(key); setSelectedSlot(null); }}
                      className={cn(
                        "rounded-xl border py-3 text-center transition cursor-pointer",
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-brand"
                          : "bg-background border-border hover:border-primary/40",
                      )}
                    >
                      <div className={cn("text-[10px] uppercase tracking-wider font-semibold", active ? "opacity-80" : "text-muted-foreground")}>
                        {d.toLocaleDateString("es-CO", { weekday: "short" })}
                      </div>
                      <div className="text-lg font-display font-bold mt-1">{d.getDate()}</div>
                    </button>
                  );
                })}
              </div>

              {/* Sección de Horarios Disponibles */}
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-display font-bold">Horarios disponibles</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <Legend color="bg-success" label="Disponible" />
                    <Legend color="bg-danger" label="Ocupado" />
                    <Legend color="bg-warning" label="Tuyo" />
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                  {availabilityDecision.reason}
                </div>

                {!availabilityDecision.available ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
                    No disponible para esta fecha.
                  </div>
                ) : timeSlots.length === 0 || availableSlots.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
                    No hay horarios disponibles para esta fecha.
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => {
                      const status = getAvailabilitySlotStatus(slot, 30, dayReservations, user?.uid);
                      const active = selectedSlot === slot;
                      const disabled = status !== "available";
                      return (
                        <button
                          key={slot}
                          disabled={disabled}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "rounded-xl border py-3 text-sm font-medium transition relative",
                            active && "ring-2 ring-primary ring-offset-2 z-10",
                            status === "available" && "bg-success-soft text-success border-success/20 hover:bg-success/15 cursor-pointer",
                            status === "busy" && "bg-danger-soft text-danger border-danger/20 opacity-60 cursor-not-allowed",
                            status === "mine" && "bg-warning-soft text-warning border-warning/30 cursor-not-allowed",
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Barra Inferior de Acción */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-secondary p-4">
                <div className="text-sm">
                  {selectedSlot ? (
                    <>
                      <span className="text-muted-foreground">Seleccionado: </span>
                      <span className="font-semibold text-foreground">{selectedDate} · {selectedSlot}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Elige un horario verde para continuar</span>
                  )}
                </div>
                <Button
                  disabled={!selectedSlot}
                  onClick={handleContinue}
                  className="rounded-xl h-11 px-6 shadow-brand font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar a reserva
                </Button>
              </div>

            </Card>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} /> {label}
    </span>
  );
}
