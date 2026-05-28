import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAuth } from "../../hooks/useAuth";

export default function AdminHome() {
  const { user, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>GameZone Administrador</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h1 className="text-2xl font-bold text-slate-700">
          Panel administrador
        </h1>

        <p className="mt-2 text-slate-500">
          Hola, {user?.firstName || "admin"}. Aquí se gestionarán reservas,
          canchas, disponibilidad y notificaciones.
        </p>

        <IonButton className="mt-6" expand="block" onClick={logout}>
          Cerrar sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
}