import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

export interface CourtFirebase {
  id: string;
  name: string;
  sport: string;
  location: string;
  price: number;
  image: string;
  imageUrl?: string;
  description?: string;
  active: boolean;
  status: string;
  rating?: number;
}

export interface CourtInput {
  name: string;
  sport: string;
  location: string;
  price: number;
  imageUrl: string;
  description: string;
  active: boolean;
}

function normalizeCourt(id: string, data: Record<string, unknown>): CourtFirebase {
  const active =
    typeof data.active === "boolean"
      ? data.active
      : typeof data.status === "string"
        ? !["disabled", "closed", "inactive"].includes(data.status)
        : true;
  const image = String(data.imageUrl || data.image || "");

  return {
    id,
    name: String(data.name || ""),
    sport: String(data.sport || ""),
    location: String(data.location || ""),
    price: Number(data.price || 0),
    image,
    imageUrl: image,
    description: String(data.description || ""),
    active,
    status: active ? String(data.status || "available") : "closed",
    rating: typeof data.rating === "number" ? data.rating : undefined,
  };
}

export function useCourts() {
  const [courts, setCourts] = useState<CourtFirebase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "courts"),
      (snapshot) => {
        const docs = snapshot.docs
          .map((courtDoc) => normalizeCourt(courtDoc.id, courtDoc.data()))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCourts(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Error al traer las canchas de Firestore:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const createCourt = useCallback(async (court: CourtInput) => {
    await addDoc(collection(db, "courts"), {
      name: court.name,
      sport: court.sport,
      location: court.location,
      price: court.price,
      image: court.imageUrl,
      imageUrl: court.imageUrl,
      description: court.description,
      active: court.active,
      status: court.active ? "available" : "closed",
    });
  }, []);

  const updateCourt = useCallback(async (courtId: string, court: CourtInput) => {
    await updateDoc(doc(db, "courts", courtId), {
      name: court.name,
      sport: court.sport,
      location: court.location,
      price: court.price,
      image: court.imageUrl,
      imageUrl: court.imageUrl,
      description: court.description,
      active: court.active,
      status: court.active ? "available" : "closed",
    });
  }, []);

  const deleteCourt = useCallback(async (courtId: string) => {
    await deleteDoc(doc(db, "courts", courtId));
  }, []);

  const refreshCourts = useCallback(async () => {
    return courts;
  }, [courts]);

  return {
    courts,
    loading,
    refreshCourts,
    createCourt,
    updateCourt,
    deleteCourt,
  };
}
