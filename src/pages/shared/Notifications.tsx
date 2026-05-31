import { useState, type ComponentType } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNotifications, NotificationType } from "../../hooks/useNotifications";
import { cn } from "../../lib/utils";

const typeStyle: Record<
  NotificationType,
  { icon: ComponentType<{ className?: string }>; cls: string; label: string }
> = {
  reservation_created: {
    icon: CheckCircle2,
    cls: "bg-success-soft text-success",
    label: "Reserva creada",
  },
  reservation_confirmed: {
    icon: CheckCircle2,
    cls: "bg-success-soft text-success",
    label: "Reserva confirmada",
  },
  payment_pending: {
    icon: AlertCircle,
    cls: "bg-warning-soft text-warning",
    label: "Pago pendiente",
  },
  reservation_cancelled: {
    icon: XCircle,
    cls: "bg-danger-soft text-danger",
    label: "Reserva cancelada",
  },
  reservation_expired: {
    icon: XCircle,
    cls: "bg-danger-soft text-danger",
    label: "Reserva expirada",
  },
  availability_updated: {
    icon: Sparkles,
    cls: "bg-primary-soft text-primary",
    label: "Disponibilidad",
  },
};

export default function NotificationsPage() {
  const history = useHistory();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [tab, setTab] = useState<"all" | "unread">("all");

  const visibleNotifications = notifications.filter((notification) =>
    tab === "unread" ? !notification.read : true
  );

  const formatNotificationTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("es-CO", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Ahora";
    }
  };

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents style={{ "--background": "#f8fafc" }}>
        <div className="min-h-screen w-full p-5 text-[#334155] md:p-10">
          <div className="mx-auto max-w-4xl space-y-6">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="gz-back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>

            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-500 to-orange-400 p-6 text-white shadow-brand md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/85">
                    <Bell className="h-3.5 w-3.5" />
                    Centro de notificaciones
                  </div>
                  <h1 className="mt-4 text-3xl font-display font-bold md:text-4xl">
                    Notificaciones
                  </h1>
                  <p className="mt-2 max-w-xl text-sm font-medium text-white/85">
                    {loading
                      ? "Buscando novedades de tus reservas..."
                      : unreadCount > 0
                        ? `Tienes ${unreadCount} notificación${unreadCount === 1 ? "" : "es"} sin leer.`
                        : "No tienes notificaciones pendientes por leer."}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  className="h-11 rounded-xl bg-white text-blue-700 shadow-sm hover:bg-slate-50"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || loading}
                >
                  <CheckCheck className="mr-1.5 h-4 w-4" />
                  Marcar todo como leído
                </Button>
              </div>
            </section>

            <div className="flex gap-2">
              {[
                ["all", "Todas"],
                ["unread", "Sin leer"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value as "all" | "unread")}
                  className={cn(
                    "gz-chip",
                    tab === value && "gz-chip-active"
                  )}
                >
                  {label}
                  {value === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-16 text-center font-medium text-muted-foreground">
                Cargando notificaciones...
              </div>
            ) : visibleNotifications.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-border bg-card p-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <BellOff className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                  No hay notificaciones
                </h3>
                <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Aquí verás el historial de reservas, pagos, cancelaciones y cambios de disponibilidad.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {visibleNotifications.map((notification) => {
                  const style = typeStyle[notification.type] || typeStyle.availability_updated;
                  const StyleIcon = style.icon;

                  return (
                    <Card
                      key={notification.id}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border-border bg-card p-4 shadow-sm transition",
                        !notification.read
                          ? "cursor-pointer border-primary/20 bg-primary-soft/30 ring-1 ring-primary/5"
                          : "opacity-85"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
                          style.cls
                        )}
                      >
                        <StyleIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={cn(
                              "truncate text-sm font-semibold text-foreground md:text-base",
                              !notification.read && "font-bold"
                            )}
                          >
                            {notification.title}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {style.label}
                          </span>
                          {!notification.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                          )}
                        </div>

                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                          <span>{formatNotificationTime(notification.createdAt)}</span>
                          <span
                            className={cn(
                              "font-bold",
                              notification.read ? "text-slate-400" : "text-blue-600"
                            )}
                          >
                            {notification.read ? "Leída" : "Sin leer"}
                          </span>
                          {!notification.read && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              Marcar como leída
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
