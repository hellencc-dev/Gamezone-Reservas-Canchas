import { IonBadge, IonButton, IonIcon } from "@ionic/react";
import { notificationsOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationBell() {
  const history = useHistory();
  const { unreadCount } = useNotifications();

  return (
    <div className="relative mr-2">
      <IonButton
        fill="clear"
        aria-label="Abrir notificaciones"
        onClick={() => history.push("/notifications")}
        className="relative h-11 w-11 [--border-radius:999px] [--color:#2563eb] hover:[--background:rgba(37,99,235,0.08)]"
      >
        <IonIcon icon={notificationsOutline} className="text-2xl" />
      </IonButton>

      {unreadCount > 0 && (
        <IonBadge className="absolute right-0 top-0 min-w-5 rounded-full bg-orange-500 px-1.5 text-[10px] font-extrabold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </IonBadge>
      )}
    </div>
  );
}
