import { IonBadge, IonButton } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationBell() {
  const history = useHistory();
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <IonButton fill="clear" onClick={() => history.push("/notifications")}>
        <span className="text-xl">🔔</span>
      </IonButton>

      {unreadCount > 0 && (
        <IonBadge
          color="danger"
          className="absolute -top-1 -right-1 text-xs"
        >
          {unreadCount}
        </IonBadge>
      )}
    </div>
  );
}