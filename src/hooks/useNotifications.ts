import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./useAuth";

export type NotificationType =
  | "reservation_created"
  | "reservation_confirmed"
  | "reservation_cancelled"
  | "reservation_expired"
  | "payment_pending"
  | "availability_updated";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  reservationId?: string;
  courtId?: string;
}

interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  reservationId?: string;
  courtId?: string;
}

const isNotificationType = (type: unknown): type is NotificationType =>
  [
    "reservation_created",
    "reservation_confirmed",
    "reservation_cancelled",
    "reservation_expired",
    "payment_pending",
    "availability_updated",
  ].includes(String(type));

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

    setLoading(true);

    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: AppNotification[] = snapshot.docs.map((docItem) => {
        const notificationData = docItem.data();

        return {
          id: docItem.id,
          userId: notificationData.userId,
          title: notificationData.title || "Notificación",
          message: notificationData.message || "",
          type: isNotificationType(notificationData.type)
            ? notificationData.type
            : "availability_updated",
          read: Boolean(notificationData.read),
          createdAt: notificationData.createdAt || new Date().toISOString(),
          reservationId: notificationData.reservationId || undefined,
          courtId: notificationData.courtId || undefined,
        };
      });

      setNotifications(
        data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

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

  const markAllAsRead = async () => {
    const unread = notifications.filter((notification) => !notification.read);

    if (unread.length === 0) {
      return;
    }

    const batch = writeBatch(db);

    unread.forEach((notification) => {
      batch.update(doc(db, "notifications", notification.id), {
        read: true,
      });
    });

    await batch.commit();
  };

  return {
    notifications,
    loading,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
  };
}
