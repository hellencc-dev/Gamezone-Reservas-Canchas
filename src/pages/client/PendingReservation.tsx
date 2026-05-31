import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, MapPin, X } from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { useAuth } from "../../hooks/useAuth";
import { useCourts } from "../../hooks/useCourts";
import { useNotifications } from "../../hooks/useNotifications";
import { db } from "../../firebase/config";
import {
  getReservationRemainingSeconds,
  isActiveTemporaryReservation,
} from "../../helpers/availabilityHelpers";
import { normalizeReservationStatus } from "../../components/status-badge";

const TOTAL_TIME = 5 * 60;

interface PendingLocationState {
  reservationId?: string;
}

export default function PendingReservation() {
  const history = useHistory();
  const location = useLocation<PendingLocationState>();
  const { user } = useAuth();
  const { courts } = useCourts();
  const { createNotification, notifyAdmins } = useNotifications();

  const [latestHold, setLatestHold] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [loadingHold, setLoadingHold] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [expiringHold, setExpiringHold] = useState(false);

  const reservationId = location.state?.reservationId;

  useEffect(() => {
    if (!user?.uid) return;

    setLoadingHold(true);

    if (reservationId) {
      const unsubscribe = onSnapshot(
        doc(db, "reservations", reservationId),
        (snapshot) => {
          if (!snapshot.exists()) {
            setLatestHold(null);
            setTimeLeft(0);
            setLoadingHold(false);
            return;
          }

          const data = { id: snapshot.id, ...snapshot.data() };
          const status = normalizeReservationStatus(data.status || "");

          if (data.userId !== user.uid || status !== "temporal" || !isActiveTemporaryReservation(data)) {
            setLatestHold(null);
            setTimeLeft(0);
            setLoadingHold(false);
            return;
          }

          setLatestHold({ ...data, status });
          setTimeLeft(getReservationRemainingSeconds(data));
          setLoadingHold(false);
        },
        (error) => {
          console.error("Error al traer la reserva temporal:", error);
          setLoadingHold(false);
        }
      );

      return () => unsubscribe();
    }

    const q = query(
      collection(db, "reservations"),
      where("userId", "==", user.uid),
      where("status", "in", ["temporal", "temporary"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const holds = snapshot.docs
          .map((holdDoc) => ({ id: holdDoc.id, ...holdDoc.data() }))
          .filter((hold) => isActiveTemporaryReservation(hold))
          .sort((a, b) => getReservationRemainingSeconds(a) - getReservationRemainingSeconds(b));
        const hold = holds[0] || null;

        setLatestHold(hold);
        setTimeLeft(hold ? getReservationRemainingSeconds(hold) : 0);
        setLoadingHold(false);
      },
      (error) => {
        console.error("Error al traer reservas temporales:", error);
        setLoadingHold(false);
      }
    );

    return () => unsubscribe();
  }, [reservationId, user?.uid]);

  useEffect(() => {
    if (loadingHold || !latestHold || timeLeft <= 0) return;

    const interval = window.setInterval(() => {
      const remaining = getReservationRemainingSeconds(latestHold);

      if (remaining <= 0) {
        window.clearInterval(interval);
        setTimeLeft(0);
        handleExpireHold(latestHold);
        return;
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [latestHold, loadingHold, timeLeft]);

  const handleConfirmAndPay = async () => {
    if (!latestHold || !user) return;

    setProcessingAction(true);
    try {
      const docRef = doc(db, "reservations", latestHold.id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        setLatestHold(null);
        return;
      }

      const current = { id: snapshot.id, ...snapshot.data() };

      if (!isActiveTemporaryReservation(current)) {
        setLatestHold(null);
        alert("Esta reserva ya no está disponible para confirmar.");
        return;
      }

      await updateDoc(docRef, {
        status: "confirmada",
        confirmedAt: new Date(),
      });

      setLatestHold(null);
      setTimeLeft(0);

      await createNotification({
        userId: user.uid,
        title: "Reserva confirmada",
        message: "Tu reserva fue confirmada correctamente.",
        type: "reservation_confirmed",
        reservationId: latestHold.id,
        courtId: latestHold.courtId,
      });

      await notifyAdmins({
        title: "Reserva confirmada",
        message: "Un cliente confirmó una reserva.",
        type: "reservation_confirmed",
        reservationId: latestHold.id,
        courtId: latestHold.courtId,
      });

      alert("Pago confirmado. Tu reserva quedó confirmada.");
      history.push("/client/reservations");
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReleaseHold = async () => {
    if (!latestHold) return;

    setProcessingAction(true);
    try {
      await updateDoc(doc(db, "reservations", latestHold.id), {
        status: "cancelada",
        cancelledAt: new Date(),
      });
      setLatestHold(null);
      setTimeLeft(0);
      history.push("/client/courts");
    } catch (error) {
      console.error("Error al liberar reserva:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleExpireHold = async (hold = latestHold) => {
    if (!hold || expiringHold) return;

    try {
      setExpiringHold(true);
      const docRef = doc(db, "reservations", hold.id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) return;

      const current = { id: snapshot.id, ...snapshot.data() };

      if (normalizeReservationStatus(current.status || "") !== "temporal") return;

      await updateDoc(docRef, {
        status: "expirada",
        expiredAt: new Date(),
      });

      setLatestHold(null);
      setTimeLeft(0);

      if (user?.uid) {
        await createNotification({
          userId: user.uid,
          title: "Reserva expirada",
          message: "Tu reserva expiró porque no confirmaste el pago a tiempo.",
          type: "reservation_expired",
          reservationId: hold.id,
          courtId: hold.courtId,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setExpiringHold(false);
    }
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const pct = Math.max(0, Math.min(100, (timeLeft / TOTAL_TIME) * 100));
  const urgent = timeLeft < 60;
  const court = courts?.find((c) => c.id === latestHold?.courtId);

  if (loadingHold) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] text-muted-foreground">
        Cargando tu reserva temporal...
      </div>
    );
  }

  if (!latestHold) {
    return (
      <IonPage>
        <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-[#f8fafc] p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">No hay reservas temporales activas</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            No tienes canchas pendientes de pago.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="rounded-xl" onClick={() => history.push("/client/courts")}>
              Ver canchas
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => history.push("/client")}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </IonPage>
    );
  }

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents style={{ "--background": "#f8fafc" }}>
        <div className="min-h-screen w-full p-6 text-[#334155] md:p-10">
          <div className="mx-auto max-w-3xl space-y-6">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="gz-back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">
                <AlertCircle className="h-3.5 w-3.5" /> Reserva temporal
              </div>
              <h1 className="mt-4 text-3xl font-display font-bold text-foreground md:text-4xl">
                Tu cancha está retenida
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Tu reserva se mantendrá disponible durante 5 minutos mientras confirmas el pago. Si no completas la confirmación en ese tiempo, la cancha volverá a estar disponible.
              </p>
            </div>

            <Card className="relative overflow-hidden rounded-3xl border-border bg-card p-8 text-center shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 ${urgent ? "bg-danger" : "bg-accent"}`} />
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Tiempo restante
              </div>
              <div className={`mt-3 text-7xl font-display font-bold tabular-nums ${urgent ? "animate-pulse text-danger" : "text-accent"}`}>
                {mm}:{ss}
              </div>
              <Progress value={pct} className="mt-6 h-2" />
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {timeLeft === 0 ? "Reserva expirada" : urgent ? "Apúrate, está por expirar" : "Aún tienes tiempo para confirmar"}
              </p>
            </Card>

            <Card className="rounded-2xl border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                  {court?.image ? (
                    <img src={court.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg font-bold text-foreground">
                    {court?.name || "Cancha GameZone"}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {court?.location || "GameZone"}
                  </div>
                  <div className="mt-2 text-sm font-medium text-foreground/80">
                    {latestHold.date} · {latestHold.startTime} - {latestHold.endTime} · {latestHold.duration} min
                  </div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">
                    Referencia GZ-{latestHold.id.slice(0, 5).toUpperCase()}
                  </div>
                </div>
                <div className="mt-2 w-full border-t pt-3 sm:mt-0 sm:w-auto sm:border-t-0 sm:pt-0 sm:text-right">
                  <div className="text-2xl font-display font-bold text-primary">
                    ${(Number(latestHold.totalPrice) || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">incluye cargos</div>
                </div>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={handleConfirmAndPay}
                className="h-12 rounded-2xl text-base font-bold shadow-brand"
                disabled={timeLeft === 0 || processingAction}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar pago ${(Number(latestHold.totalPrice) || 0).toFixed(2)}
              </Button>

              <Button
                variant="outline"
                className="h-12 rounded-2xl border-orange-200 bg-orange-50 text-base font-bold text-orange-700 hover:border-orange-300 hover:bg-orange-100 hover:text-orange-800"
                onClick={handleReleaseHold}
                disabled={processingAction}
              >
                <X className="mr-2 h-4 w-4" /> Liberar reserva
              </Button>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p className="text-xs leading-relaxed">
                Tu reserva se mantendrá disponible durante 5 minutos mientras confirmas el pago. Si no completas la confirmación en ese tiempo, la cancha volverá a estar disponible.
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
