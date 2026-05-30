import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { normalizeReservationStatus } from "../components/status-badge";

export type ReservationStatus = "temporal" | "confirmada" | "cancelada" | "expirada";

export interface AdminReservation {
  id: string;
  courtId: string;
  userId: string;
  courtName: string;
  userDisplayName: string;
  userEmail: string;
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

type ReservationDocument = Omit<
  AdminReservation,
  "courtName" | "userDisplayName" | "userEmail" | "status"
> & {
  status: string;
};

interface CourtInfo {
  name: string;
}

interface UserInfo {
  displayName: string;
  email: string;
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildUserDisplayName(data: Record<string, unknown>) {
  const displayName = textValue(data.displayName);
  const name = textValue(data.name);
  const firstName = textValue(data.firstName);
  const lastName = textValue(data.lastName);
  const email = textValue(data.email);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return displayName || name || fullName || email || "Usuario sin nombre";
}

export function useAdminReservations() {
  const [reservationDocs, setReservationDocs] = useState<ReservationDocument[]>([]);
  const [courtsById, setCourtsById] = useState<Record<string, CourtInfo>>({});
  const [usersById, setUsersById] = useState<Record<string, UserInfo>>({});
  const [loadingReservationsData, setLoadingReservationsData] = useState(true);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const reservationsQuery = query(
      collection(db, "reservations"),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        const docs = snapshot.docs
          .map((docItem) => {
            const data = docItem.data();
            return {
              id: docItem.id,
              courtId: textValue(data.courtId),
              userId: textValue(data.userId),
              date: textValue(data.date),
              startTime: textValue(data.startTime),
              endTime: textValue(data.endTime),
              duration: Number(data.duration) || 60,
              playersCount: Number(data.playersCount) || 1,
              notes: textValue(data.notes),
              status: normalizeReservationStatus(data.status || "temporal"),
              totalPrice: Number(data.totalPrice) || 0,
              createdAt: data.createdAt,
            } as ReservationDocument;
          })
          .sort((a, b) => {
            const dateOrder = a.date.localeCompare(b.date);
            return dateOrder !== 0 ? dateOrder : a.startTime.localeCompare(b.startTime);
          });

        setReservationDocs(docs);
        setLoadingReservationsData(false);
      },
      (error) => {
        console.error("Error al traer reservas administrativas:", error);
        setLoadingReservationsData(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "courts"),
      (snapshot) => {
        const courts = snapshot.docs.reduce<Record<string, CourtInfo>>((acc, docItem) => {
          const data = docItem.data();
          acc[docItem.id] = {
            name: textValue(data.name) || "Cancha sin nombre",
          };

          return acc;
        }, {});

        setCourtsById(courts);
        setLoadingCourts(false);
      },
      (error) => {
        console.error("Error al traer canchas:", error);
        setLoadingCourts(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const users = snapshot.docs.reduce<Record<string, UserInfo>>((acc, docItem) => {
          const data = docItem.data();
          acc[docItem.id] = {
            displayName: buildUserDisplayName(data),
            email: textValue(data.email),
          };

          return acc;
        }, {});

        setUsersById(users);
        setLoadingUsers(false);
      },
      (error) => {
        console.error("Error al traer usuarios:", error);
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const reservations = useMemo<AdminReservation[]>(() => {
    return reservationDocs.map((reservation) => {
      const court = courtsById[reservation.courtId];
      const user = usersById[reservation.userId];

      return {
        ...reservation,
        status: normalizeReservationStatus(reservation.status) as ReservationStatus,
        courtName: court?.name || "Cancha sin nombre",
        userDisplayName: user?.displayName || "Usuario sin nombre",
        userEmail: user?.email || "",
      };
    });
  }, [courtsById, reservationDocs, usersById]);

  const loadingReservations = loadingReservationsData || loadingCourts || loadingUsers;

  return { reservations, loadingReservations };
}
