import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

export default function Notifications() {
  const history = useHistory();
  const { notifications, loading, markAsRead } = useNotifications();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>Volver</IonButton>
          </IonButtons>

          <IonTitle>Notificaciones</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="min-h-screen bg-[#F8FAFC]">
          <h1 className="text-2xl font-bold text-[#334155]">
            Historial de notificaciones
          </h1>

          <p className="mt-2 text-slate-500">
            Aquí puedes consultar los eventos importantes de tu cuenta.
          </p>

          {loading && (
            <p className="mt-6 text-slate-500">Cargando notificaciones...</p>
          )}

          {!loading && notifications.length === 0 && (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#334155]">
                No tienes notificaciones
              </h2>
              <p className="mt-2 text-slate-500">
                Cuando ocurra algo importante en tus reservas, aparecerá aquí.
              </p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <IonList className="mt-6 rounded-2xl overflow-hidden">
              {notifications.map((notification) => (
                <IonItem
                  key={notification.id}
                  button
                  onClick={() => markAsRead(notification.id)}
                  className={notification.read ? "opacity-70" : ""}
                >
                  <IonLabel>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="font-bold text-[#334155]">
                        {notification.title}
                      </h2>

                      {!notification.read && (
                        <span className="rounded-full bg-[#FF6B00] px-2 py-1 text-xs font-semibold text-white">
                          Nueva
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-slate-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}