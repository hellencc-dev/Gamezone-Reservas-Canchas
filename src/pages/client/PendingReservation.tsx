import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonPage, IonContent } from "@ionic/react";
import { AlertCircle, CheckCircle2, Clock, MapPin, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { useAuth } from "../../hooks/useAuth";
import { useCourts } from "../../hooks/useCourts";
import { db } from "../../firebase/config";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";

const TOTAL_TIME = 5 * 60; // 5 minutos en segundos

export default function PendingReservation() {
  const history = useHistory();
  const { user } = useAuth();
  const { courts } = useCourts();

  // Estados de la reserva y del temporizador
  const [latestHold, setLatestHold] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [loadingHold, setLoadingHold] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "reservations"),
      where("userId", "==", user.uid),
      where("status", "==", "temporary"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const holdDoc = snapshot.docs[0];
        const data = holdDoc.data();
        setLatestHold({ id: holdDoc.id, ...data });

        // Sincronizar el temporizador con la hora de creación por si refrescan la página
        if (data.createdAt) {
          const createdTime = data.createdAt.toDate().getTime();
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor((now - createdTime) / 1000);
          const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
          setTimeLeft(remaining);
        }
      } else {
        setLatestHold(null);
      }
      setLoadingHold(false);
    }, (error) => {
      console.error("Error al traer el hold de Firebase:", error);
      setLoadingHold(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (loadingHold || !latestHold || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExpireHold(); // Auto-cancelar en Firebase al llegar a 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, latestHold, loadingHold]);

  // Acción: Confirmar y Pagar
  const handleConfirmAndPay = async () => {
    if (!latestHold) return;
    setProcessingAction(true);
    try {
      const docRef = doc(db, "reservations", latestHold.id);
      await updateDoc(docRef, { status: "confirmed" });
      alert("¡Pago procesado con éxito! Tu reserva está confirmada.");
      history.push("/client"); // Pa' la casa con la reserva lista
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  // Acción: Liberar / Cancelar reserva de forma manual o expirada
  const handleReleaseHold = async () => {
    if (!latestHold) return;
    setProcessingAction(true);
    try {
      const docRef = doc(db, "reservations", latestHold.id);
      await updateDoc(docRef, { status: "cancelled" });
      history.push("/client/courts");
    } catch (error) {
      console.error("Error al liberar reserva:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleExpireHold = async () => {
    if (!latestHold) return;
    try {
      const docRef = doc(db, "reservations", latestHold.id);
      await updateDoc(docRef, { status: "cancelled" });
    } catch (e) {
      console.error(e);
    }
  };

  // Formatear tiempo en MM:SS
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const pct = (timeLeft / TOTAL_TIME) * 100;
  const urgent = timeLeft < 60;

  // Buscar los detalles de la cancha vinculada
  const court = courts?.find((c) => c.id === latestHold?.courtId);

  if (loadingHold) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] flex items-center justify-center text-muted-foreground">
        Loading your reservation hold...
      </div>
    );
  }

  // Si no hay ninguna reserva temporal activa
  if (!latestHold) {
    return (
      <IonPage>
        <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">No active holds found</h2>
          <p className="text-sm text-muted-foreground max-w-xs">You don't have any pending courts. Go secure one!</p>
          <Button onClick={() => history.push("/client/courts")}>Browse courts</Button>
        </div>
      </IonPage>
    );
  }

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ '--background': '#f8fafc' }}>
        <div className="w-full min-h-screen text-[#334155] p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-warning-soft text-warning px-3 py-1 text-xs font-semibold">
                <AlertCircle className="h-3.5 w-3.5" /> Temporary reservation
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-foreground">Your court is on hold</h1>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto text-sm">
                Complete payment before the timer runs out or the slot will be released.
              </p>
            </div>

            {/* CARD DEL TEMPORIZADOR */}
            <Card className="p-8 rounded-3xl border-border bg-card text-center relative overflow-hidden shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 transition-colors ${urgent ? "bg-danger" : "bg-accent"}`} />
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Time remaining</div>
              <div className={`mt-3 text-7xl font-display font-bold tabular-nums ${urgent ? "text-danger animate-pulse" : "text-accent"}`}>
                {mm}:{ss}
              </div>
              <Progress value={pct} className="mt-6 h-2" />
              <p className="text-xs text-muted-foreground mt-3 font-medium">
                {timeLeft === 0 ? "Hold expired" : urgent ? "Hurry up — almost expired 🔥" : "Plenty of time to confirm"}
              </p>
            </Card>

            {/* CARD DETALLES DE LA CANCHA REAL */}
            <Card className="p-6 rounded-2xl border-border bg-card shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-secondary shrink-0">
                  {court?.image ? (
                    <img src={court.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-bold text-foreground truncate">{court?.name || "GameZone Court"}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" /> {court?.location || "Main Complex"}
                  </div>
                  <div className="text-sm mt-2 font-medium text-foreground/80">
                    {latestHold.date} · {latestHold.startTime} – {latestHold.endTime} · {latestHold.duration} min
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">Reference GZ-{latestHold.id.slice(0, 5).toUpperCase()}</div>
                </div>
                <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                  <div className="text-2xl font-display font-bold text-primary">${parseFloat(latestHold.totalPrice || 0).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">incl. fees</div>
                </div>
              </div>
            </Card>

            {/* BOTONES DE ACCIÓN */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                onClick={handleConfirmAndPay}
                className="h-12 rounded-xl shadow-brand font-medium cursor-pointer"
                disabled={timeLeft === 0 || processingAction}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm & pay ${parseFloat(latestHold.totalPrice || 0).toFixed(2)}
              </Button>
              
              <Button 
                variant="outline" 
                className="h-12 rounded-xl cursor-pointer"
                onClick={handleReleaseHold}
                disabled={processingAction}
              >
                <X className="mr-2 h-4 w-4" /> Release hold
              </Button>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                A temporary reservation reserves the court for you while you complete payment. 
                After 5 minutes the slot is automatically released to other players.
              </p>
            </div>
            
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}