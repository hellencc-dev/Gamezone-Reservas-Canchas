import { useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import {
  AlertCircle,
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

// Mapeo inteligente: Vincula los tipos de Firebase de tu compañera con los estilos visuales de Lovable
const typeStyle: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  reservation_created: { icon: CheckCircle2, cls: "bg-success-soft text-success" },
  reservation_confirmed: { icon: CheckCircle2, cls: "bg-success-soft text-success" },
  payment_pending: { icon: AlertCircle, cls: "bg-warning-soft text-warning" },
  reservation_cancelled: { icon: XCircle, cls: "bg-danger-soft text-danger" },
  reservation_expired: { icon: XCircle, cls: "bg-danger-soft text-danger" },
  availability_updated: { icon: Sparkles, cls: "bg-primary-soft text-primary" },
};

export default function NotificationsPage() {
  // Consumimos directamente la lógica real del hook de tu compañera
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [tab, setTab] = useState<"all" | "unread">("all");

  // Filtrado reactivo basado en la pestaña seleccionada
  const visibleNotifications = notifications.filter((n) => (tab === "unread" ? !n.read : true));

  // Formateador estético para la estampa de tiempo ISO de Firebase
  const formatNotificationTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Just now";
    }
  };

  return (
    <IonPage className="bg-transparent border-none">
      <IonContent fullscreen scrollEvents={true} style={{ '--background': '#f8fafc' }}>
        <div className="w-full min-h-screen text-[#334155] p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Encabezado Principal */}
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Notifications</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  {loading 
                    ? "Checking for new updates..." 
                    : unreadCount > 0 
                    ? `You have ${unreadCount} unread notifications.` 
                    : "You're all caught up."
                  }
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl font-medium cursor-pointer"
                onClick={markAllAsRead}
                disabled={unreadCount === 0 || loading}
              >
                <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
              </Button>
            </div>

            {/* Pestañas de Filtrado (All / Unread) */}
            <div className="flex gap-2">
              {(["all", "unread"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium border transition capitalize cursor-pointer flex items-center",
                    tab === t
                      ? "bg-primary text-primary-foreground border-primary shadow-brand"
                      : "bg-card text-foreground border-border hover:border-primary/40",
                  )}
                >
                  {t} {t === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Renderizado Condicional del Listado */}
            {loading ? (
              <div className="text-center p-16 text-muted-foreground font-medium">
                Loading secure feed...
              </div>
            ) : visibleNotifications.length === 0 ? (
              <Card className="p-16 rounded-2xl border-dashed border-border text-center bg-card shadow-sm">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
                  <BellOff className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">No notifications available</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                  We'll let you know when there's something new regarding your matches or local courts.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {visibleNotifications.map((n) => {
                  // Resolvemos el estilo de forma segura usando el mapa dinámico
                  const style = typeStyle[n.type] || typeStyle["availability_updated"];
                  const StyleIcon = style.icon;

                  return (
                    <Card
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={cn(
                        "p-4 rounded-2xl border-border bg-card shadow-sm transition flex items-start gap-3",
                        !n.read ? "bg-primary-soft/30 border-primary/20 ring-1 ring-primary/5 cursor-pointer" : "opacity-85"
                      )}
                    >
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", style.cls)}>
                        <StyleIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={cn("font-semibold text-sm md:text-base text-foreground truncate", !n.read && "font-bold")}>
                            {n.title}
                          </h3>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-accent shrink-0 animate-pulse" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <div className="text-xs text-muted-foreground mt-1.5 font-medium">
                          {formatNotificationTime(n.createdAt)}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Preferencias Inferiores Estáticas */}
            <Card className="p-6 rounded-2xl border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">Manage notification preferences</div>
                <div className="text-sm text-muted-foreground mt-0.5">Choose how you receive real-time alerts and game reminders.</div>
              </div>
              <Button variant="outline" className="rounded-xl font-medium cursor-pointer w-full sm:w-auto">Settings</Button>
            </Card>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}