import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./useAuth";
import { normalizeReservationStatus } from "../components/status-badge";

export interface ReservationFirebase {
  id: string;
  courtId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  duration?: number;
  playersCount?: number;
  notes?: string;
  createdAt?: any;
}

export function useReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationFirebase[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setReservations([]);
      setLoadingReservations(false);
      return;
    }

    setLoadingReservations(true);

    const q = query(
      collection(db, "reservations"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs: ReservationFirebase[] = [];

        querySnapshot.forEach((docItem) => {
          const data = docItem.data();
          docs.push({
            id: docItem.id,
            ...data,
            status: normalizeReservationStatus(data.status || "temporal"),
          } as ReservationFirebase);
        });

        setReservations(
          docs.sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`))
        );
        setLoadingReservations(false);
      },
      (error) => {
        console.error("Error al traer reservas de Firebase:", error);
        setLoadingReservations(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { reservations, loadingReservations };
}
