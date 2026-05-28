import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./useAuth";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  reservationId?: string;
  courtId?: string;
}

interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
  reservationId?: string;
  courtId?: string;
}

export function useNotifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, "notifications");

    const q = query(
      notificationsRef,
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: AppNotification[] = snapshot.docs.map((docItem) => {
        const notificationData = docItem.data();

        return {
          id: docItem.id,
          userId: notificationData.userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          read: notificationData.read,
          createdAt: notificationData.createdAt,
          reservationId: notificationData.reservationId,
          courtId: notificationData.courtId,
        };
      });

      const sortedData = data.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );

      setNotifications(sortedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const createNotification = async (data: CreateNotificationData) => {
    await addDoc(collection(db, "notifications"), {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      createdAt: new Date().toISOString(),
      reservationId: data.reservationId || null,
      courtId: data.courtId || null,
    });
  };

  const markAsRead = async (notificationId: string) => {
    const notificationRef = doc(db, "notifications", notificationId);

    await updateDoc(notificationRef, {
      read: true,
    });
  };

  return {
    notifications,
    loading,
    unreadCount,
    createNotification,
    markAsRead,
  };
}