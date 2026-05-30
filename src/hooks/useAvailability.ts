import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

export interface Availability {
  id: string;
  courtId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
  createdAt?: unknown;
}

export interface AvailabilityInput {
  courtId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface SpecialDate {
  id: string;
  courtId: string;
  date: string;
  available: boolean;
  note: string;
}

export interface SpecialDateInput {
  courtId: string;
  date: string;
  available: boolean;
  note: string;
}

export function useAvailability(courtId?: string) {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [loadingSpecialDates, setLoadingSpecialDates] = useState(true);

  useEffect(() => {
    if (!courtId) {
      setAvailability([]);
      setLoadingAvailability(false);
      return;
    }

    setLoadingAvailability(true);

    const availabilityQuery = query(
      collection(db, "availability"),
      where("courtId", "==", courtId),
    );

    const unsubscribe = onSnapshot(
      availabilityQuery,
      (snapshot) => {
        const docs = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }) as Availability)
          .sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) {
              return a.dayOfWeek - b.dayOfWeek;
            }

            return a.startTime.localeCompare(b.startTime);
          });

        setAvailability(docs);
        setLoadingAvailability(false);
      },
      (error) => {
        console.error("Error al traer disponibilidad:", error);
        setLoadingAvailability(false);
      },
    );

    return () => unsubscribe();
  }, [courtId]);

  useEffect(() => {
    if (!courtId) {
      setSpecialDates([]);
      setLoadingSpecialDates(false);
      return;
    }

    setLoadingSpecialDates(true);

    const specialDatesQuery = query(
      collection(db, "specialDates"),
      where("courtId", "==", courtId),
    );

    const unsubscribe = onSnapshot(
      specialDatesQuery,
      (snapshot) => {
        const docs = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }) as SpecialDate)
          .sort((a, b) => a.date.localeCompare(b.date));

        setSpecialDates(docs);
        setLoadingSpecialDates(false);
      },
      (error) => {
        console.error("Error al traer fechas especiales:", error);
        setLoadingSpecialDates(false);
      },
    );

    return () => unsubscribe();
  }, [courtId]);

  const createAvailability = useCallback(async (input: AvailabilityInput) => {
    await addDoc(collection(db, "availability"), {
      ...input,
      createdAt: serverTimestamp(),
    });
  }, []);

  const updateAvailability = useCallback(async (availabilityId: string, input: AvailabilityInput) => {
    await updateDoc(doc(db, "availability", availabilityId), input);
  }, []);

  const deleteAvailability = useCallback(async (availabilityId: string) => {
    await deleteDoc(doc(db, "availability", availabilityId));
  }, []);

  const createSpecialDate = useCallback(async (input: SpecialDateInput) => {
    await addDoc(collection(db, "specialDates"), input);
  }, []);

  const updateSpecialDate = useCallback(async (specialDateId: string, input: SpecialDateInput) => {
    await updateDoc(doc(db, "specialDates", specialDateId), input);
  }, []);

  const deleteSpecialDate = useCallback(async (specialDateId: string) => {
    await deleteDoc(doc(db, "specialDates", specialDateId));
  }, []);

  return {
    availability,
    specialDates,
    loadingAvailability: loadingAvailability || loadingSpecialDates,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    createSpecialDate,
    updateSpecialDate,
    deleteSpecialDate,
  };
}
