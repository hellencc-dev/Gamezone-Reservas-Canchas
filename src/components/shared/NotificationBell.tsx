import { IonBadge, IonButton, IonIcon } from "@ionic/react";
import { notificationsOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationBell() {
  const history = useHistory();
  const { unreadCount } = useNotifications();

  return (
    <div className="relative mr-2 inline-flex">
      <IonButton
        fill="clear"
        aria-label="Abrir notificaciones"
        onClick={() => history.push("/notifications")}
        className="relative h-11 w-11 rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-soft [--background:transparent] [--background-hover:transparent] [--border-radius:999px] [--box-shadow:none] [--color:#0052FF] [--padding-end:0] [--padding-start:0]"
      >
        <IonIcon icon={notificationsOutline} className="text-[22px]" />
      </IonButton>

      {unreadCount > 0 && (
        <IonBadge className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#FF6B00] px-1.5 text-[10px] font-extrabold leading-none text-white shadow-sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </IonBadge>
      )}
    </div>
  );
}
