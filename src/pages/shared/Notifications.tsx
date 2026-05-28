import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  alertCircle,
  arrowBack,
  calendar,
  card,
  checkmarkDone,
  checkmarkDoneCircle,
  closeCircle,
  mailOpen,
  notifications,
  notificationsOff,
  sync,
  time,
} from "ionicons/icons";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  AppNotification,
  NotificationType,
  useNotifications,
} from "../../hooks/useNotifications";

type FilterTab = "all" | "unread";

const notificationStyles: Record<
  NotificationType,
  {
    label: string;
    icon: string;
    badge: string;
    border: string;
  }
> = {
  reservation_created: {
    label: "Reserva creada",
    icon: calendar,
    badge: "bg-blue-50 text-blue-600",
    border: "border-blue-200 bg-blue-50/50",
  },
  reservation_confirmed: {
    label: "Reserva confirmada",
    icon: checkmarkDoneCircle,
    badge: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-200 bg-emerald-50/50",
  },
  reservation_cancelled: {
    label: "Reserva cancelada",
    icon: closeCircle,
    badge: "bg-red-50 text-red-600",
    border: "border-red-200 bg-red-50/50",
  },
  reservation_expired: {
    label: "Reserva expirada",
    icon: alertCircle,
    badge: "bg-amber-50 text-amber-600",
    border: "border-amber-200 bg-amber-50/50",
  },
  payment_pending: {
    label: "Pago pendiente",
    icon: card,
    badge: "bg-violet-50 text-violet-600",
    border: "border-violet-200 bg-violet-50/50",
  },
  availability_updated: {
    label: "Disponibilidad actualizada",
    icon: sync,
    badge: "bg-cyan-50 text-cyan-600",
    border: "border-cyan-200 bg-cyan-50/50",
  },
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function Notifications() {
  const history = useHistory();
  const {
    notifications: items,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [tab, setTab] = useState<FilterTab>("all");

  const visibleNotifications = useMemo(
    () => items.filter((item) => (tab === "unread" ? !item.read : true)),
    [items, tab]
  );

  const summary = unreadCount
    ? `Tienes ${unreadCount} notificación${
        unreadCount === 1 ? "" : "es"
      } sin leer.`
    : "Estás al día con tus notificaciones.";

  const handleMarkAsRead = async (notification: AppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} slot="start" />
              Volver
            </IonButton>
          </IonButtons>

          <IonTitle>Notificaciones</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="min-h-screen bg-[#f8fafc] px-5 py-8 text-slate-950 md:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <section className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white shadow-2xl shadow-blue-500/20 md:flex-row md:items-end md:justify-between md:p-8">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/80 backdrop-blur">
                  <IonIcon icon={notifications} />
                  Centro de actividad
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                  Historial de notificaciones
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
                  Consulta cambios de reservas, pagos y disponibilidad de tus
                  canchas en un solo lugar.
                </p>
              </div>

              <IonButton
                fill="outline"
                disabled={unreadCount === 0}
                onClick={markAllAsRead}
                className="h-11 shrink-0 [--border-color:rgba(255,255,255,0.45)] [--border-radius:0.75rem] [--color:#ffffff]"
              >
                <IonIcon icon={checkmarkDone} slot="start" />
                Marcar todas
              </IonButton>
            </section>

            <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Notificaciones
                </h2>
                <p className="mt-1 text-sm text-slate-500">{summary}</p>
              </div>

              <div className="flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                {[
                  { id: "all" as const, label: "Todas" },
                  { id: "unread" as const, label: "No leídas" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      tab === item.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-500 hover:text-slate-950"
                    }`}
                  >
                    {item.label}
                    {item.id === "unread" && unreadCount > 0 && (
                      <span
                        className={`ml-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] ${
                          tab === item.id
                            ? "bg-white text-blue-600"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {loading && (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <IonIcon icon={sync} className="text-2xl" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-800">
                  Cargando notificaciones
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Estamos consultando tu historial en Firestore.
                </p>
              </div>
            )}

            {!loading && visibleNotifications.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <IonIcon icon={notificationsOff} className="text-3xl" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-800">
                  No hay notificaciones disponibles
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Cuando ocurra algo importante en tus reservas, pagos o
                  disponibilidad, aparecerá aquí.
                </p>
              </div>
            )}

            {!loading && visibleNotifications.length > 0 && (
              <div className="space-y-3">
                {visibleNotifications.map((notification) => {
                  const style = notificationStyles[notification.type];

                  return (
                    <article
                      key={notification.id}
                      className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-xl hover:shadow-slate-900/10 sm:flex-row sm:items-start ${
                        notification.read
                          ? "border-slate-200"
                          : style.border
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification)}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.badge}`}
                        aria-label="Marcar notificación como leída"
                      >
                        <IonIcon icon={style.icon} className="text-xl" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-slate-900">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                          )}
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.badge}`}
                          >
                            {style.label}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <IonIcon icon={time} />
                            {formatDate(notification.createdAt)}
                          </span>
                          <span>
                            {notification.read ? "Leída" : "Pendiente por leer"}
                          </span>
                        </div>
                      </div>

                      {!notification.read && (
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() => markAsRead(notification.id)}
                          className="[--color:#2563eb] [--border-radius:0.75rem]"
                        >
                          <IonIcon icon={mailOpen} slot="start" />
                          Leída
                        </IonButton>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <IonIcon icon={notifications} className="text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-slate-800">
                  Preferencias de notificaciones
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Esta base queda lista para activar alertas por reservas,
                  pagos y disponibilidad desde Firestore.
                </p>
              </div>
            </section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
