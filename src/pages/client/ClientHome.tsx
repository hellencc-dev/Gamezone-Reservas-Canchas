import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
} from "@ionic/react";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "../../components/shared/NotificationBell";
import { useNotifications } from "../../hooks/useNotifications";

export default function ClientHome() {
  const { user, logout } = useAuth();
  const { createNotification } = useNotifications();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>GameZone Cliente</IonTitle>

          <IonButtons slot="end">
            <NotificationBell />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h1 className="text-2xl font-bold text-slate-700">
          Bienvenido, {user?.firstName || "cliente"}
        </h1>

        <p className="mt-2 text-slate-500">
          Aquí el cliente podrá ver canchas, reservas, calendario y notificaciones.
        </p>

        <IonButton className="mt-6" expand="block" onClick={logout}>
          Cerrar sesión
        </IonButton>
        <IonButton
          className="mt-4"
          expand="block"
          color="warning"
          onClick={() =>
            user &&
            createNotification({
              userId: user.uid,
              title: "Reserva creada",
              message: "Tu reserva fue creada y está pendiente de confirmación.",
              type: "reservation_created",
            })
          }
        >
          Crear notificación de prueba
        </IonButton>
      </IonContent>
    </IonPage>
  );
}