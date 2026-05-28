import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAuth } from "../../hooks/useAuth";

export default function ClientHome() {
  const { user, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>GameZone Cliente</IonTitle>
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
      </IonContent>
    </IonPage>
  );
}