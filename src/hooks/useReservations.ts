import { useState, useEffect } from "react";
import { db } from "../firebase/config"; // Asegúrate de que esta sea la ruta a tu config de firebase
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "./useAuth";

export interface ReservationFirebase {
  id: string;
  courtId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
}

export function useReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationFirebase[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingReservations(false);
      return;
    }

    // Buscamos en la colección 'reservations' solo los documentos que coincidan con el userId del cliente logueado
    const q = query(
      collection(db, "reservations"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: ReservationFirebase[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as ReservationFirebase);
      });
      setReservations(docs);
      setLoadingReservations(false);
    }, (error) => {
      console.error("Error al traer reservas de Firebase: ", error);
      setLoadingReservations(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { reservations, loadingReservations };
}