import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../firebase/config";

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface AdminReservation {
  id: string;
  courtId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  playersCount: number;
  notes: string;
  status: ReservationStatus;
  totalPrice: number;
  createdAt?: unknown;
}

export function useAdminReservations() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    const reservationsQuery = query(collection(db, "reservations"), orderBy("date", "asc"));

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        const docs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as AdminReservation)
          .sort((a, b) => {
            const dateOrder = a.date.localeCompare(b.date);

            if (dateOrder !== 0) {
              return dateOrder;
            }

            return a.startTime.localeCompare(b.startTime);
          });

        setReservations(docs);
        setLoadingReservations(false);
      },
      (error) => {
        console.error("Error al traer reservas administrativas:", error);
        setLoadingReservations(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { reservations, loadingReservations };
}
